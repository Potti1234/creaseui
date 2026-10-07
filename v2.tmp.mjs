import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [tag, port] of [
  ['tw', 5173],
  ['sx', 5174],
]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  for (let i = 0; i < 8; i++) {
    await p.goto(`http://localhost:${port}/docs/components/stat`, {
      waitUntil: 'networkidle',
    })
    await p.waitForTimeout(700)
    if (
      await p.evaluate(() => document.body.innerText.includes('Total revenue'))
    )
      break
  }
  const info = await p.evaluate(() => {
    const pick = s =>
      [...document.querySelectorAll('*')].find(
        e => e.childElementCount === 0 && e.textContent?.trim() === s,
      )
    const f = e => {
      const cs = getComputedStyle(e)
      const r = e.getBoundingClientRect()
      return {
        fs: cs.fontSize,
        lh: cs.lineHeight,
        fw: cs.fontWeight,
        color: cs.color,
        y: +r.y.toFixed(1),
        ls: cs.letterSpacing,
        mx: cs.marginInline,
        my: cs.marginBlock,
      }
    }
    return {
      label: f(pick('Total revenue')),
      delta: f(pick('vs. previous 30 days')),
      val: f(pick('$1.28M')),
    }
  })
  console.log(tag, JSON.stringify(info, null, 1))
  await p.close()
}
await b.close()
