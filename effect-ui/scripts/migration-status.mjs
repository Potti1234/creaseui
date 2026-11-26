import { existsSync, readFileSync } from 'node:fs'

const read = path =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const catalog = new Set(
  ['ui', 'stylex', 'pleat'].flatMap(renderer =>
    read(`../../src/${renderer}/registry.json`)
      .items.filter(item => item.type === 'registry:ui')
      .map(item => item.meta?.crease?.component ?? item.name),
  ),
)
const registry = new Map(
  read('../registry.json').items.map(item => [item.name, item]),
)
const partial = new Map([
  ['calendar', 'Dedicated month and year grids'],
  [
    'date-input',
    'Built-in adaptive bottom sheet and custom typed display format',
  ],
  ['input-otp', 'Custom character patterns'],
  ['sheet', 'Panel switcher and custom header layout'],
  ['number-input', 'Arbitrary display formatter and strict integer mode'],
])
const renderers = ['stylex-effect-components', 'pleat-effect-components']
const hasFiles = item =>
  item?.files?.length &&
  item.files.every(file =>
    existsSync(new URL(`../${file.path}`, import.meta.url)),
  )

const missing = [...catalog].sort().filter(name => {
  const component = `effect-${name}`
  return (
    !hasFiles(registry.get(component)) ||
    !hasFiles(registry.get(`${component}-behavior`)) ||
    renderers.some(
      renderer =>
        !registry
          .get(renderer)
          ?.registryDependencies?.includes(`@crease-effect/${component}`),
    )
  )
})
const incomplete = [...partial].filter(
  ([name]) => catalog.has(name) && !missing.includes(name),
)

console.log(
  `${catalog.size - missing.length - incomplete.length}/${catalog.size} catalog components ported`,
)
if (incomplete.length) {
  console.log('\nPartial ports')
  for (const [name, work] of incomplete) console.log(`  ${name} — ${work}`)
}
if (missing.length)
  console.log(
    `\nMissing registry coverage (${missing.length})\n  ${missing.join(', ')}`,
  )
if (process.argv.includes('--check') && (missing.length || incomplete.length))
  process.exitCode = 1
