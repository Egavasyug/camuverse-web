import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const srcLogo = path.join(root, 'public', 'logo.png')
const outDir = path.join(root, 'src', 'app')

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function makeIcon({ size, out }) {
  const buf = await sharp(srcLogo)
    .resize({ width: size, height: size, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
  await fs.writeFile(out, buf)
}

async function main() {
  await ensureDir(outDir)
  await makeIcon({ size: 512, out: path.join(outDir, 'icon.png') })
  await makeIcon({ size: 180, out: path.join(outDir, 'apple-icon.png') })
  console.log('Wrote src/app/icon.png (512x512) and src/app/apple-icon.png (180x180)')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
