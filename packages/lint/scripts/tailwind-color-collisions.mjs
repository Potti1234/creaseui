/* Generates lib/strict/tailwind-color-collisions.json: for each colour
   utility prefix the base `@apply` check accepts, the Tailwind utilities that
   share its spelling but style something other than colour (`bg-cover`,
   `text-lg`) and the other utility roots under it (`text-shadow`,
   `bg-linear`). A custom role whose utility lands on one of them is not a
   semantic colour. Run after upgrading Tailwind:
   node packages/lint/scripts/tailwind-color-collisions.mjs */
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import postcss from 'postcss'

export const PREFIXES = [
  'bg',
  'text',
  'border',
  'outline',
  'ring-offset',
  'ring',
  'fill',
  'stroke',
  'accent',
  'caret',
  'decoration',
  'placeholder',
  'divide',
]

const OUTPUT = fileURLToPath(
  new URL('../lib/strict/tailwind-color-collisions.json', import.meta.url),
)

/** Whether every declaration a utility compiles to sets a colour. */
export const colourOnly = css => {
  let only = true
  postcss.parse(css).walkDecls(declaration => {
    if (
      declaration.parent?.type === 'atrule' &&
      declaration.parent.name === 'property'
    )
      return
    if (
      !/(?:^|-)color$/u.test(declaration.prop) &&
      declaration.prop !== 'fill' &&
      declaration.prop !== 'stroke'
    )
      only = false
  })
  return only
}

export const loadTailwind = async (
  from = process.cwd(),
  css = '@import "tailwindcss";',
) => {
  const require = createRequire(path.join(from, 'package.json'))
  const entry = require.resolve('tailwindcss')
  const base = path.dirname(require.resolve('tailwindcss/package.json'))
  const loaded = await import(pathToFileURL(entry).href)
  const tailwind = loaded.__unstable__loadDesignSystem ? loaded : loaded.default
  const designSystem = await tailwind.__unstable__loadDesignSystem(css, {
    base,
    loadStylesheet: async id => ({
      base,
      content: readFileSync(
        path.join(
          base,
          id === 'tailwindcss'
            ? 'index.css'
            : id.replace(/^tailwindcss\//u, ''),
        ),
        'utf8',
      ),
      path: id,
    }),
  })
  const { version } = JSON.parse(
    readFileSync(path.join(base, 'package.json'), 'utf8'),
  )
  return { designSystem, tailwind, version }
}

export const collisions = async from => {
  const { designSystem, version } = await loadTailwind(from)
  const classes = designSystem.getClassList().map(([name]) => name)
  const css = designSystem.candidatesToCss(classes)
  const compiled = new Map(classes.map((name, index) => [name, css[index]]))
  const roots = [
    ...designSystem.utilities.keys('functional'),
    ...designSystem.utilities.keys('static'),
  ]
  const utilities = {}
  for (const prefix of PREFIXES) {
    const own = PREFIXES.filter(
      other => other !== prefix && other.startsWith(`${prefix}-`),
    )
    utilities[prefix] = {
      roots: [
        ...new Set(
          roots
            .filter(
              root =>
                root.startsWith(`${prefix}-`) &&
                designSystem.utilities.has(root, 'functional') &&
                !own.includes(root),
            )
            .map(root => root.slice(prefix.length + 1)),
        ),
      ].sort(),
      static: classes
        .filter(
          name =>
            name.startsWith(`${prefix}-`) &&
            /^[a-z]/u.test(name.slice(prefix.length + 1)) &&
            !own.some(other => name.startsWith(`${other}-`)) &&
            compiled.get(name) != null &&
            !colourOnly(compiled.get(name)),
        )
        .map(name => name.slice(prefix.length + 1))
        .sort(),
    }
  }
  return { tailwindcss: version, utilities }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(OUTPUT, `${JSON.stringify(await collisions(), null, 2)}\n`)
  console.log(`wrote ${path.relative(process.cwd(), OUTPUT)}`)
}
