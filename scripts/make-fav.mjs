import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

;(async () => {
  const root = process.cwd()
  const candidates = [
    path.join(root, 'src', 'app', 'logo.png'),
    path.join(root, 'public', 'logo.png'),
  ]
  const src = candidates.find((p) => fs.existsSync(p))
  if (!src) throw new Error('logo not found')
  const sizes = [16, 32, 48, 64, 128, 256]
  const bufs = []
  for (const s of sizes) {
    const b = await sharp(src)
      .resize({ width: s, height: s, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer()
    bufs.push(b)
  }
  const ico = await pngToIco(bufs)
  fs.writeFileSync(path.join(root, 'src', 'app', 'favicon.ico'), ico)
  console.log('favicon.ico written')
})().catch((e) => { console.error(e); process.exit(1) })

