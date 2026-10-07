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
    await page.waitForTimeout(500)
    out[key] = await page.evaluate(() => {
      const all = [...document.querySelectorAll('*')]
      const r = e => {
        const b = e.getBoundingClientRect()
        return {
          x: +b.x.toFixed(1),
          y: +b.y.toFixed(1),
          h: +b.height.toFixed(1),
          w: +b.width.toFixed(1),
        }
      }
      const byText = t =>
        all.find(e => e.children.length === 0 && e.textContent.trim() === t)
      const input = document.querySelector('input')
      const firstMail = byText('William Smith')
      const inbox = byText('Inbox')
      const unreads = byText('Unreads')
      return {
        inbox: inbox ? r(inbox.parentElement) : null,
        unreads: unreads ? r(unreads.parentElement) : null,
        input: input ? r(input) : null,
        firstMailName: firstMail ? r(firstMail) : null,
        firstMailRow: firstMail ? r(firstMail.closest('a,button')) : null,
        sidebarW: document.querySelector(
          '[data-slot="sidebar-inner"], [data-slot="sidebar-container"]',
        )
          ? r(
              document.querySelector(
                '[data-slot="sidebar-inner"], [data-slot="sidebar-container"]',
              ),
            )
          : null,
      }
    })
  }
  console.log(JSON.stringify(out, null, 1))
  await browser.close()
})()
