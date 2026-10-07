import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
for (const [r, url] of [
  ['tw', 'http://localhost:5173/blocks/preview/tailwind--sidebar-01'],
  ['sx', 'http://localhost:5174/blocks/preview/stylex--sidebar-01'],
]) {
  const p = await ctx.newPage()
  for (let i = 0; i < 6; i++) {
    await p.goto(url, { waitUntil: 'networkidle' })
    await p.waitForTimeout(700)
    if (
      await p.evaluate(() => document.body.innerText.includes('Data Fetching'))
    )
      break
  }
  const info = await p.evaluate(() => {
    const hdr = document.querySelector('header')
    return hdr
      ? hdr.outerHTML.replace(/style="[^"]*"/g, '').slice(0, 2600)
      : 'NONE'
  })
  console.log(`=====${r}=====`)
  console.log(info)
  await p.close()
}
await b.close()
