const { chromium } = require('playwright')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/blocks/preview/stylex--sidebar-09', {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(500)
  const d = await page.evaluate(() => {
    const name = [...document.querySelectorAll('span')].find(
      e => e.textContent === 'William Smith',
    )
    const row = name?.closest('button,a')
    const cs = getComputedStyle(name)
    const csRow = row ? getComputedStyle(row) : null
    return {
      nameClasses: name?.className,
      nameLH: cs.lineHeight,
      nameFS: cs.fontSize,
      rowLH: csRow?.lineHeight,
      rowFS: csRow?.fontSize,
      parentDivLH: name?.parentElement
        ? getComputedStyle(name.parentElement).lineHeight
        : null,
      parentClasses: name?.parentElement?.className,
    }
  })
  console.log(JSON.stringify(d, null, 1))
  await browser.close()
})()
