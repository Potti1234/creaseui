import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 1600 } })
await p.goto('http://localhost:5173/docs/components/input-group#align', {
  waitUntil: 'networkidle',
})
await p.waitForTimeout(1200)
const ta = p.locator('#block-start-textarea').first()
await ta.fill('x=1')
const copyBtn = p.locator('button[aria-label="Copy"]').last()
const before = await copyBtn.evaluate(el => el.innerHTML.slice(0, 120))
await copyBtn.click()
await p.waitForTimeout(600)
const after = await copyBtn.evaluate(el => el.innerHTML.slice(0, 200))
console.log(
  'before:',
  before,
  '\nafter:',
  after,
  '\ncheck:',
  /M20 6|polyline/i.test(after),
)
await b.close()
