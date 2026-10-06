const { chromium } = require('playwright')
;(async () => {
  const browser = await chromium.launch()
  for (const [tag, port] of [
    ['tw', 5173],
    ['sx', 5174],
  ]) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    })
    await page.goto(
      `http://localhost:${port}/blocks/preview/${tag === 'tw' ? 'tailwind' : 'stylex'}--sidebar-06`,
      { waitUntil: 'networkidle' },
    )
    await page.waitForTimeout(1200)
    const info = await page.evaluate(() => {
      const btn = document.querySelector(
        '[data-slot="dropdown-menu-trigger"], [data-slot="popover-trigger"], button',
      )
      const sb = document.querySelector('[data-slot="sidebar"], [data-sidebar]')
      const btn2 = document.querySelectorAll('button')[1]
      const r1 = btn?.getBoundingClientRect(),
        r2 = sb?.getBoundingClientRect(),
        r3 = btn2?.getBoundingClientRect()
      return {
        trigger: r1 && [r1.x, r1.y, r1.width],
        sidebar: r2 && [r2.x, r2.width],
        second: r3 && [r3.x, r3.width],
        triggerSlot: btn?.getAttribute('data-slot'),
      }
    })
    console.log(tag, JSON.stringify(info))
    await page.close()
  }
  await browser.close()
})()
