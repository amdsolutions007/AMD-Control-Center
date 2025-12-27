#!/usr/bin/env node
// Converts key images in public/ to WebP versions using sharp.
// Usage: node scripts/convert-to-webp.js

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const publicDir = path.join(process.cwd(), 'public')

const tasks = [
  {
    src: path.join(publicDir, 'amd_logo.png'),
    dest: path.join(publicDir, 'amd_logo.webp'),
    options: { quality: 75, width: 240 },
  },
  {
    src: path.join(publicDir, 'dashboard_bg.jpg'),
    dest: path.join(publicDir, 'dashboard_bg.webp'),
    options: { quality: 75, width: 1600 },
  },
]

async function run() {
  for (const t of tasks) {
    try {
      if (!fs.existsSync(t.src)) {
        console.warn(`Source not found: ${t.src}. Skipping.`)
        continue
      }

      // skip if destination is newer than source
      if (fs.existsSync(t.dest)) {
        const sStat = fs.statSync(t.src)
        const dStat = fs.statSync(t.dest)
        if (dStat.mtimeMs >= sStat.mtimeMs) {
          console.log(`Up-to-date: ${path.basename(t.dest)}`)
          continue
        }
      }

      console.log(`Converting ${path.basename(t.src)} -> ${path.basename(t.dest)}`)
      let pipeline = sharp(t.src).webp({ quality: t.options.quality })
      if (t.options.width) pipeline = pipeline.resize({ width: t.options.width, withoutEnlargement: true })
      await pipeline.toFile(t.dest)
      console.log(`Written: ${t.dest}`)
    } catch (err) {
      console.error(`Failed to convert ${t.src}:`, err)
    }
  }
}

run()
  .then(() => console.log('Image conversion complete.'))
  .catch((e) => {
    console.error('Conversion script failed:', e)
    process.exit(1)
  })
