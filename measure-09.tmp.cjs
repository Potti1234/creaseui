const { chromium } = require('playwright')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const out = {}
  for (const [key, url] of [
    ['tw', 'http://localhost:5173/blocks/preview/tailwind--sidebar-09'],
    ['sx', 'http://localhost:5174/blocks/preview/stylex--sidebar-09'],
  ]) {
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    out[key] = await page.evaluate(() => {
      const pick = sel => {
        const el = document.querySelector(sel)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        }
      }
      return {
        containers: [
          ...document.querySelectorAll('[data-slot="sidebar-container"]'),
        ].map(e =>
          pick.call
            ? null
            : (r => {
                const b = e.getBoundingClientRect()
                return { x: +b.x.toFixed(1), w: +b.width.toFixed(1) }
              })(),
        ),
        inner: [
          ...document.querySelectorAll('[data-slot="sidebar-inner"]'),
        ].map(e =>
          (b => {
            const r = e.getBoundingClientRect()
            return { x: +r.x.toFixed(1), w: +r.width.toFixed(1) }
          })(),
        ),
        inset: pick('[data-slot="sidebar-inset"]'),
        mailPanel: pick('[data-slot="mail-panel"], [class*="mail"]'),
        header: pick('header'),
        searchInputs: [...document.querySelectorAll('input')].map(i =>
          (b => {
            const r = i.getBoundingClientRect()
            return {
              x: +r.x.toFixed(1),
              y: +r.y.toFixed(1),
              w: +r.width.toFixed(1),
            }
          })(),
        ),
        wrapperStyle: document
          .querySelector('[data-slot="sidebar-wrapper"]')
          ?.getAttribute('style'),
      }
    })
  }
  console.log(JSON.stringify(out, null, 1))
  await browser.close()
})()
