#!/usr/bin/env node
/**
 * Phase 3E — responsive widget layout screenshots (sample data, no auth required)
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../../../.tmp_visual_verification');

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Phase 3E Intelligence Widget Preview</title>
</head>
<body class="bg-black text-white p-6 font-sans">
  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Intelligence Dashboard</p>
  <h1 class="mt-1 text-lg font-black text-gray-100">Enterprise Intelligence — Phase 3E Preview</h1>
  <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    ${[
      ['Total Artists', '12', '#6366F1'],
      ['Total Partners', '3', '#6366F1'],
      ['Pending Reviews', '5', '#6366F1'],
      ['Approved Submissions', '8', '#6366F1'],
      ['Connected Streaming Platforms', '4', '#6366F1'],
      ['AI Processing Status', 'Queue Active', '#6366F1'],
    ]
      .map(
        ([title, value, color]) => `
    <article class="rounded-2xl border border-white/10 bg-[#050512]/70 p-4">
      <p class="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">${title}</p>
      <p class="mt-2 text-2xl font-black" style="color:${color}">${value}</p>
      <p class="mt-2 text-xs text-gray-500">Live production metrics from Supabase queries.</p>
    </article>`,
      )
      .join('')}
  </div>
</body>
</html>`;

const VIEWPORTS = [
  { name: 'phase-3e-desktop', width: 1440, height: 900 },
  { name: 'phase-3e-tablet', width: 768, height: 1024 },
  { name: 'phase-3e-mobile', width: 375, height: 812 },
];

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(SAMPLE_HTML, { waitUntil: 'networkidle' });

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.screenshot({ path: join(outDir, `${vp.name}.png`), fullPage: true });
  console.log(`Wrote ${vp.name}.png`);
}

await browser.close();
