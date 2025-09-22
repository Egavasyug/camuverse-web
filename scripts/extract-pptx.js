const fsp = require('fs/promises');
const path = require('path');
const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');

const root = process.cwd();
const localPptxCandidates = [
  path.join(root, 'docs', 'CammunityDAO_Overview.pptx'),
  path.join(root, 'CammunityDAO_Overview_With_Proposals_and_Milestones_20250914.pptx')
];
const assetsDir = path.join(root, 'public', 'docs', 'cammunitydao-overview', 'media');
const slidesOutPath = path.join(root, 'src', 'app', 'docs', 'slides');

async function ensureDir(p) { await fsp.mkdir(p, { recursive: true }); }

async function resolvePptx() {
  for (const p of localPptxCandidates) {
    try { await fsp.access(p); return p; } catch {}
  }
  throw new Error('PPTX not found. Place CammunityDAO_Overview.pptx in /docs or keep the root *_Milestones_*.pptx file.');
}

async function loadZip(file) {
  const buf = await fsp.readFile(file);
  const zip = await JSZip.loadAsync(buf);
  return zip;
}

async function extractMedia(zip) {
  await ensureDir(assetsDir);
  const mediaFolder = zip.folder('ppt/media');
  if (!mediaFolder) return [];
  const files = Object.keys(mediaFolder.files);
  const out = [];
  for (const name of files) {
    const entry = mediaFolder.file(name);
    if (!entry) continue;
    const data = await entry.async('nodebuffer');
    const basename = path.basename(name);
    const dest = path.join(assetsDir, basename);
    await fsp.writeFile(dest, data);
    out.push(basename);
  }
  return out;
}

function collectTexts(xmlObj) {
  const texts = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node['a:t']) {
      const t = node['a:t'];
      if (Array.isArray(t)) t.forEach(v => texts.push(String(v)));
      else texts.push(String(t));
    }
    for (const k in node) walk(node[k]);
  };
  walk(xmlObj);
  return texts;
}

function collectEmbeds(xmlObj) {
  const ids = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    const blip = node['a:blip'];
    if (blip && blip['@_r:embed']) ids.push(blip['@_r:embed']);
    for (const k in node) walk(node[k]);
  };
  walk(xmlObj);
  return ids;
}

async function buildRelMap(zip, n) {
  const relPath = `ppt/slides/_rels/slide${n}.xml.rels`;
  const file = zip.file(relPath);
  if (!file) return {};
  const xml = await file.async('string');
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const rels = parser.parse(xml);
  const map = {};
  const arr = rels?.Relationships?.Relationship;
  const items = Array.isArray(arr) ? arr : arr ? [arr] : [];
  for (const r of items) map[r['@_Id']] = r['@_Target'];
  return map;
}

async function generateSlides(zip) {
  await ensureDir(slidesOutPath);
  const slideFolder = zip.folder('ppt/slides');
  const files = Object.keys(slideFolder.files)
    .filter(n => /slide\d+\.xml$/.test(n))
    .sort((a,b) => parseInt(a.match(/slide(\d+)\.xml/)[1],10) - parseInt(b.match(/slide(\d+)\.xml/)[1],10));
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parts = ['---\ntitle: Slides\n---\n', '# Slides', ''];
  for (const name of files) {
    const n = parseInt(name.match(/slide(\d+)\.xml/)[1],10);
    const xml = await zip.file(name).async('string');
    const slide = parser.parse(xml);
    const texts = collectTexts(slide);
    const embeds = collectEmbeds(slide);
    const relMap = await buildRelMap(zip, n);
    parts.push(`\n## Slide ${n}`);
    const images = embeds.map(id => relMap[id]).filter(Boolean);
    for (const img of images) parts.push(`![](/docs/cammunitydao-overview/${img})`);
    if (texts.length) parts.push(texts.map(t => `- ${t}`).join('\n'));
  }
  await fsp.writeFile(path.join(slidesOutPath, 'page.mdx'), parts.join('\n') + '\n', 'utf8');
}

async function main() {
  const pptx = await resolvePptx();
  console.log('Reading', pptx);
  const zip = await loadZip(pptx);
  await extractMedia(zip);
  await generateSlides(zip);
  console.log('Done: assets in public/docs/cammunitydao-overview, MDX at /docs/slides');
}

main().catch(e => { console.error(e); process.exit(1); });
