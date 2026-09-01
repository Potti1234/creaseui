import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const names = (directory, excluded = new Set()) =>
  fs
    .readdirSync(directory)
    .filter(
      (file) =>
        file.endsWith('.ts') && !excluded.has(file.replace(/\.ts$/u, '')),
    )
    .map((file) => file.replace(/\.ts$/u, ''))
    .sort()

const uiNames = names('src/ui')
const stylexNames = names(
  'src/stylex',
  new Set([
    'complex-tokens.stylex',
    'contracts',
    'foundations-tokens.stylex',
    'index',
    'interaction-tokens.stylex.const',
    'overlay-boundary',
    'overlay-tokens.stylex',
    'style',
    'tokens.stylex',
  ]),
)
const cardNames = names('src/demo/cards')
const stylexCardNames = names(
  'src/demo/stylex-cards',
  new Set([
    'complex-card-tokens.stylex',
    'foundations-card-tokens.stylex',
    'interaction-card-tokens.stylex',
  ]),
)
const paired = (left, right) => left.filter((name) => right.includes(name))

const boundaryFiles = [
  ...fs
    .readdirSync('src/stylex', { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .map((entry) => path.join(entry.parentPath, entry.name)),
  ...fs
    .readdirSync('src/demo/stylex-cards', { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .map((entry) => path.join(entry.parentPath, entry.name)),
  'src/demo/board-stylex.ts',
  'src/demo/board-constrained.ts',
]
const boundarySource = boundaryFiles
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n')

const primitiveFiles = ['box', 'grid', 'inline', 'stack', 'text']
const constrainedSource = fs.readFileSync('src/demo/board-constrained.ts', 'utf8')
const primitiveCalls = Object.fromEntries(
  primitiveFiles.map((name) => [
    name,
    (constrainedSource.match(new RegExp(`\\b${name}\\(`, 'gu')) ?? []).length,
  ]),
)
const manifest = JSON.parse(
  fs.readFileSync('src/stylex/fallbacks/manifest.json', 'utf8'),
)

const report = {
  mode: 'parallel-experiment',
  interpretation:
    'Coverage measures available StyleX counterparts, not removal of Tailwind from the primary product.',
  components: {
    source: uiNames.length,
    stylexCounterparts: paired(uiNames, stylexNames).length,
    paired: paired(uiNames, stylexNames).length,
    coveragePercent: Number(
      ((paired(uiNames, stylexNames).length / uiNames.length) * 100).toFixed(1),
    ),
  },
  createCards: {
    source: cardNames.length,
    stylexCounterparts: paired(cardNames, stylexCardNames).length,
    paired: paired(cardNames, stylexCardNames).length,
    coveragePercent: Number(
      ((paired(cardNames, stylexCardNames).length / cardNames.length) * 100).toFixed(1),
    ),
  },
  constrainedComposition: {
    primitiveCount: primitiveFiles.length,
    primitiveCalls,
  },
  guardrails: {
    boundaryFiles: boundaryFiles.length,
    cssFallbacks: manifest.fallbacks.length,
    legacyUiImports: (boundarySource.match(/from\s+['"]@\/ui\//gu) ?? []).length,
    suppressions: (
      boundarySource.match(
        /(?:eslint|oxlint)-disable|@ts-(?:expect-error|ignore)/gu,
      ) ?? []
    ).length,
    unsafeBodyPortals: (boundarySource.match(/portal\s*:\s*true/gu) ?? []).length,
  },
}

const outputPath = 'docs/stylex-adoption.json'
const serialized = `${JSON.stringify(report, null, 2)}\n`
if (process.argv.includes('--write')) {
  fs.writeFileSync(outputPath, serialized)
  console.log(`Wrote ${outputPath}`)
} else {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : ''
  if (current !== serialized) {
    console.error(`StyleX adoption metrics drifted. Run npm run stylex:adoption:generate.`)
    process.exitCode = 1
  } else {
    console.log(serialized.trim())
  }
}
