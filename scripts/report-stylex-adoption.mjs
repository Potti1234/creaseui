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
const paired = uiNames.filter((name) => stylexNames.includes(name))
const boundaryFiles = fs
  .readdirSync('src/stylex', { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
  .map((entry) => path.join(entry.parentPath, entry.name))
boundaryFiles.push('src/docs/components/stylex-specimens.ts')

const boundarySource = boundaryFiles
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n')
const manifest = JSON.parse(
  fs.readFileSync('src/stylex/fallbacks/manifest.json', 'utf8'),
)
const specimenSource = fs.readFileSync(
  'src/docs/components/stylex-specimens.ts',
  'utf8',
)
const specimenNames = new Set(
  [...specimenSource.matchAll(/\{ name: '([^']+)'/gu)].map(
    (match) => match[1],
  ),
)

const report = {
  mode: 'integrated-page-switch',
  interpretation:
    'Coverage measures StyleX counterparts and integrated documentation specimens while Tailwind remains the default renderer.',
  components: {
    source: uiNames.length,
    stylexCounterparts: paired.length,
    paired: paired.length,
    coveragePercent: Number(((paired.length / uiNames.length) * 100).toFixed(1)),
  },
  documentationSpecimens: {
    source: uiNames.length,
    stylexSpecimens: specimenNames.size,
    coveragePercent: Number(
      ((specimenNames.size / uiNames.length) * 100).toFixed(1),
    ),
  },
  constrainedComposition: {
    primitiveCount: ['box', 'grid', 'inline', 'stack', 'text'].length,
  },
  guardrails: {
    boundaryFiles: boundaryFiles.length,
    cssFallbacks: manifest.fallbacks.length,
    legacyUiImports: (boundarySource.match(/from\s+['"]@\/ui\//gu) ?? [])
      .length,
    suppressions: (
      boundarySource.match(
        /(?:eslint|oxlint)-disable|@ts-(?:expect-error|ignore)/gu,
      ) ?? []
    ).length,
    unsafeBodyPortals: (boundarySource.match(/portal\s*:\s*true/gu) ?? [])
      .length,
  },
}

const outputPath = 'docs/stylex-adoption.json'
const serialized = `${JSON.stringify(report, null, 2)}\n`
if (process.argv.includes('--write')) {
  fs.writeFileSync(outputPath, serialized)
  console.log(`Wrote ${outputPath}`)
} else {
  const current = fs.existsSync(outputPath)
    ? fs.readFileSync(outputPath, 'utf8')
    : ''
  if (current !== serialized) {
    console.error(
      'StyleX adoption metrics drifted. Run npm run stylex:adoption:generate.',
    )
    process.exitCode = 1
  } else {
    console.log(serialized.trim())
  }
}
