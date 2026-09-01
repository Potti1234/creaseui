import fs from 'node:fs'
import path from 'node:path'

const roots = [
  'src/stylex',
  'src/demo/stylex-cards',
  'src/demo/board-stylex.ts',
  'src/demo/board-constrained.ts',
  'src/demo/blocks-stylex',
]

const files = roots.flatMap((root) => {
  const stat = fs.statSync(root)
  if (stat.isFile()) return [root]
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && /\.(?:css|ts|tsx)$/u.test(entry.name),
    )
    .map((entry) => path.join(entry.parentPath, entry.name))
})

const errors = []
const suppressions = []
const fallbackImports = []

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const lines = source.split(/\r?\n/u)

  lines.forEach((line, index) => {
    if (/eslint-disable(?!-next-line)/u.test(line)) {
      errors.push(`${file}:${index + 1}: file-wide ESLint suppression is forbidden`)
    }
    if (/oxlint-disable(?!-next-line)/u.test(line)) {
      errors.push(`${file}:${index + 1}: file-wide Oxlint suppression is forbidden`)
    }
    if (/(?:eslint|oxlint)-disable-next-line|@ts-(?:expect-error|ignore)/u.test(line)) {
      suppressions.push({ file, line: index + 1 })
      if (!/-- reason: .{12,}/u.test(line)) {
        errors.push(
          `${file}:${index + 1}: suppression needs an inline "-- reason: ..." justification`,
        )
      }
    }
  })

  if (file.startsWith(path.join('src', 'stylex'))) {
    if (/portal\s*:\s*true/u.test(source)) {
      errors.push(`${file}: StyleX overlays may not opt into the body portal`)
    }
    if (/portal\?\s*:\s*boolean/u.test(source)) {
      errors.push(`${file}: portal contracts must not allow unsafe true values`)
    }
    if (/anchor\s*:\s*\{/u.test(source)) {
      errors.push(`${file}: anchored overlays must use themedAnchor(...)`)
    }
    if (/portalToContainingRoot/u.test(source)) {
      errors.push(`${file}: direct Foldkit portal access bypasses the theme boundary`)
    }
  }

  for (const match of source.matchAll(/from\s+['"]([^'"]+\.module\.css)['"]/gu)) {
    fallbackImports.push({ file, specifier: match[1] })
  }
}

const manifestPath = 'src/stylex/fallbacks/manifest.json'
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const manifestFiles = new Set(manifest.fallbacks.map((entry) => entry.file))
for (const fallback of fallbackImports) {
  const resolved = path
    .relative(
      'src/stylex/fallbacks',
      path.resolve(path.dirname(fallback.file), fallback.specifier),
    )
    .replaceAll('\\', '/')
  if (resolved.startsWith('../') || !manifestFiles.has(resolved)) {
    errors.push(
      `${fallback.file}: CSS module fallback must be declared in ${manifestPath}`,
    )
  }
}

for (const entry of manifest.fallbacks) {
  if (typeof entry.reason !== 'string' || entry.reason.trim().length < 20) {
    errors.push(`${manifestPath}: ${entry.file} needs a specific reason`)
  }
  if (!fs.existsSync(path.join('src/stylex/fallbacks', entry.file))) {
    errors.push(`${manifestPath}: missing declared fallback ${entry.file}`)
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    JSON.stringify({
      checkedFiles: files.length,
      cssFallbacks: fallbackImports.length,
      justifiedSuppressions: suppressions.length,
    }),
  )
}
