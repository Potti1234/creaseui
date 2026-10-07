/* Temporary parity scan: screenshots every docs page on both renderer
 * origins, pixel-diffs them, and records console/page errors.
 * Usage: node scripts/parity-scan.cjs [slug...] */
const { chromium } = require('playwright')
const { PNG } = require('pngjs')
const pixelmatchModule = require('pixelmatch')
const pixelmatch = pixelmatchModule.default ?? pixelmatchModule
const fs = require('fs')
const path = require('path')

const OUT = '/tmp/parity'
const TAILWIND = 'http://localhost:5173'
const STYLEX = 'http://localhost:5174'

const docsIndex = JSON.parse(fs.readFileSync('public/docs-index.json', 'utf8'))
const allSlugs = docsIndex.components.map(c => c.slug)
const coreRoutes = ['landing', 'create', 'charts', 'blocks']
const args = process.argv.slice(2)
const slugs = args.filter(a => !coreRoutes.includes(a))
const includeCore = args.length === 0 || args.some(a => coreRoutes.includes(a))
const componentSlugs = args.length === 0 ? allSlugs : slugs

const markers = {
  landing: 'components for foldkit',
  create: 'Contribution History',
  charts: 'Chart',
  blocks: 'Sidebar',
}
const titleBySlug = Object.fromEntries(
  docsIndex.components.map(c => [`docs-${c.slug}`, c.title]),
)

const routes = [
  ...(includeCore
    ? [
        { name: 'landing', path: '/' },
        { name: 'create', path: '/create' },
        { name: 'charts', path: '/charts' },
        { name: 'blocks', path: '/blocks' },
      ]
    : []),
  ...componentSlugs.map(slug => ({
    name: `docs-${slug}`,
    path: `/docs/components/${slug}`,
  })),
]
for (const r of routes) r.marker = markers[r.name] ?? titleBySlug[r.name] ?? ''

const shot = async (page, url, name, marker) => {
  const errors = []
  page.on('pageerror', e =>
    errors.push(`pageerror: ${String(e).slice(0, 300)}`),
  )
  page.on('console', m => {
    if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`)
  })
  let resp
  // foldkit devtools can restore a stale route model from a previous tab —
  // reload until the expected route marker renders (max 3 tries).
  for (let attempt = 0; attempt < 3; attempt++) {
    resp = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 45000,
    })
    await page.waitForTimeout(700)
    if (!marker) break
    const ok = await page.evaluate(
      m => document.body.innerText.includes(m),
      marker,
    )
    if (ok) break
    errors.push(`route-flake attempt ${attempt + 1}: missing "${marker}"`)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(150)
  const file = `${OUT}/${name}.png`
  await page.screenshot({ path: file, fullPage: false })
  return { status: resp?.status(), errors, file }
}

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const tailwind = await ctx.newPage()
  const stylex = await ctx.newPage()

  const report = []
  for (const route of routes) {
    const tw = await shot(
      tailwind,
      `${TAILWIND}${route.path}`,
      `${route.name}-tailwind`,
      route.marker,
    )
    const sx = await shot(
      stylex,
      `${STYLEX}${route.path}`,
      `${route.name}-stylex`,
      route.marker,
    )
    let diff = null
    try {
      const a = PNG.sync.read(fs.readFileSync(tw.file))
      const b = PNG.sync.read(fs.readFileSync(sx.file))
      if (a.width === b.width && a.height === b.height) {
        const d = new PNG({ width: a.width, height: a.height })
        const count = pixelmatch(a.data, b.data, d.data, a.width, a.height, {
          threshold: 0.1,
        })
        fs.writeFileSync(`${OUT}/${route.name}-diff.png`, PNG.sync.write(d))
        diff = count
      }
    } catch (e) {
      diff = `diff-failed: ${e.message}`
    }
    report.push({
      route: route.name,
      path: route.path,
      tailwindStatus: tw.status,
      stylexStatus: sx.status,
      diffPixels: diff,
      twErrors: tw.errors,
      sxErrors: sx.errors,
    })
    const flag = typeof diff === 'number' && diff > 500 ? 'DIFF' : 'ok'
    console.log(
      `${flag.padEnd(5)} ${route.name.padEnd(30)} tw:${tw.status} sx:${sx.status} diffPx:${diff} errT:${tw.errors.length} errS:${sx.errors.length}`,
    )
  }
  fs.writeFileSync('/tmp/parity/report.json', JSON.stringify(report, null, 2))
  await browser.close()
}
main().catch(e => {
  console.error(e)
  process.exit(1)
})
