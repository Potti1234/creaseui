const { chromium } = require('playwright')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const out = {}
  for (const [key, url] of [
    ['tw', 'http://localhost:5173/blocks/preview/tailwind--sidebar-04'],
    ['sx', 'http://localhost:5174/blocks/preview/stylex--sidebar-04'],
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
      const res = {}
      res.gap = pick('[data-slot="sidebar-gap"]')
      res.container = pick('[data-slot="sidebar-container"]')
      res.inner = pick('[data-slot="sidebar-inner"]')
      res.group = pick('[data-slot="sidebar-group"]')
      res.menu = pick('[data-slot="sidebar-menu"]')
      res.menuItem = pick('[data-slot="sidebar-menu-item"]')
      res.menuBtn = pick('[data-slot="sidebar-menu-button"]')
      res.sub = pick('[data-slot="sidebar-menu-sub"]')
      res.subItem = pick('[data-slot="sidebar-menu-sub-item"]')
      res.subBtn = pick('[data-slot="sidebar-menu-sub-button"]')
      res.inset = pick('[data-slot="sidebar-inset"]')
      res.header = pick('header')
      const buttons = [
        ...document.querySelectorAll('[data-slot="sidebar-menu-button"]'),
      ]
      res.rowYs = buttons
        .slice(0, 8)
        .map(b => +b.getBoundingClientRect().y.toFixed(1))
      const subs = [
        ...document.querySelectorAll('[data-slot="sidebar-menu-sub-button"]'),
      ]
      res.subYs = subs
        .slice(0, 8)
        .map(b => +b.getBoundingClientRect().y.toFixed(1))
      res.subXs = subs
        .slice(0, 3)
        .map(b => +b.getBoundingClientRect().x.toFixed(1))
      res.groupYs = [
        ...document.querySelectorAll('[data-slot="sidebar-group"]'),
      ].map(b => +b.getBoundingClientRect().y.toFixed(1))
      return res
    })
  }
  console.log(JSON.stringify(out, null, 1))
  await browser.close()
})()
