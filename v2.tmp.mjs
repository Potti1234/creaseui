import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 1600 } })
const errors = []
p.on('pageerror', e => errors.push(String(e)))
p.on('console', m => {
  if (m.type() === 'error') errors.push('console: ' + m.text())
})
await p.goto('http://localhost:5173/docs/components/input-group#align', {
  waitUntil: 'networkidle',
})
await p.waitForTimeout(1500)
const ta = p.locator('#block-start-textarea').first()
await ta.fill("console.log('x');")
const copies = p.locator('button[aria-label="Copy"]')
console.log('copy btns:', await copies.count())
await copies.last().scrollIntoViewIfNeeded()
await copies.last().click()
await p.waitForTimeout(800)
console.log('errors after click:', errors.join('|') || 'none')
console.log(
  'copy btns now:',
  await p.locator('button[aria-label="Copy"]').count(),
)
const taGrp = ta.locator('xpath=ancestor::*[@data-slot="input-group"][1]')
console.log(
  'grp btns:',
  await taGrp.locator('button').count(),
  'aria copy in grp:',
  await taGrp.locator('button[aria-label]').count(),
)
const lastBtn = taGrp.locator('button').last()
console.log(
  'last btn attrs:',
  await lastBtn.evaluate(
    el => el.getAttributeNames().join(',') + '|' + el.innerHTML.slice(0, 120),
  ),
)
await b.close()
