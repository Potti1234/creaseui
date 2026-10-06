/* Per-block preview parity: diffs /blocks/preview/<renderer>--<name> between
 * the two dev servers. Retries until two consecutive loads render identical
 * text (works around the foldkit stale-route flake). */
const { chromium } = require('playwright')
const { PNG } = require('pngjs')
const pixelmatchModule = require('pixelmatch')
const pixelmatch = pixelmatchModule.default ?? pixelmatchModule
const fs = require('fs')

const OUT = '/tmp/parity/previews'
const names = [
  'dashboard-01',
  'creaseui-executive-summary',
  'creaseui-cohort-funnel',
  'creaseui-project-status',
  'creaseui-service-monitoring',
  'creaseui-incident-console',
  'creaseui-kanban-board',
  'creaseui-inbox-table',
  'creaseui-order-detail',
  'creaseui-checkout-form',
  'creaseui-data-dashboard',
  'creaseui-card-grid',
  'chart-analytics-dashboard',
  'app-shell-01',
  'login-03',
  'login-04',
  ...Array.from(
    { length: 16 },
    (_, i) => `sidebar-${String(i + 1).padStart(2, '0')}`,
  ),
]
const only = process.argv.slice(2)
const list = only.length
  ? names.filter(n => only.some(o => n.includes(o)))
  : names

const stableShot = async (page, url, file) => {
  let last = ''
  for (let i = 0; i < 5; i++) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(900)
    const text = await page.evaluate(() => document.body.innerText)
    if (text === last && text.length > 50) break
    last = text
  }
  await page.waitForTimeout(500)
  await page.screenshot({ path: file, fullPage: false })
  return last.slice(0, 60).replace(/\n/g, '|')
}

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const tw = await ctx.newPage()
  const sx = await ctx.newPage()
  for (const name of list) {
    const twText = await stableShot(
      tw,
      `http://localhost:5173/blocks/preview/tailwind--${name}`,
      `${OUT}/${name}-tw.png`,
    )
    const sxText = await stableShot(
      sx,
      `http://localhost:5174/blocks/preview/stylex--${name}`,
      `${OUT}/${name}-sx.png`,
    )
    let diff = '?'
    try {
      const a = PNG.sync.read(fs.readFileSync(`${OUT}/${name}-tw.png`))
      const b = PNG.sync.read(fs.readFileSync(`${OUT}/${name}-sx.png`))
      const d = new PNG({ width: a.width, height: a.height })
      diff = pixelmatch(a.data, b.data, d.data, a.width, a.height, {
        threshold: 0.1,
      })
      fs.writeFileSync(`${OUT}/${name}-diff.png`, PNG.sync.write(d))
    } catch (e) {
      diff = `fail ${e.message}`
    }
    console.log(
      `${name.padEnd(32)} diff:${String(diff).padEnd(8)} tw:${twText.slice(0, 28)} sx:${sxText.slice(0, 28)}`,
    )
  }
  await browser.close()
}
main().catch(e => {
  console.error(e)
  process.exit(1)
})
