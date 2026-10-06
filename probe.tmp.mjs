import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
for (const [r, url] of [
  ['tw', 'http://localhost:5173/blocks/preview/tailwind--sidebar-09'],
  ['sx', 'http://localhost:5174/blocks/preview/stylex--sidebar-09'],
  ['tw10', 'http://localhost:5173/blocks/preview/tailwind--sidebar-10'],
  ['sx10', 'http://localhost:5174/blocks/preview/stylex--sidebar-10'],
]) {
  const p = await ctx.newPage()
  await p.goto(url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  await p.screenshot({ path: `/tmp/parity/previews/live-${r}.png` })
  await p.close()
}
await b.close()
