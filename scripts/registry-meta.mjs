import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CONTRACT_REPLACEMENTS } from '../packages/lint/lib/strict/contracts.js'
import { recipesFor } from '../packages/lint/lib/strict/recipes.js'

/* meta.crease and docs for registry items, generated from the source and the
   lint contracts so agents see Foldkit facts instead of shadcn's React
   defaults. Standard shadcn fields only; no parallel inventory. */

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
)
const foldkitVersion = packageJson.dependencies?.foldkit
const DOCS = 'https://github.com/Potti1234/creaseui/blob/main'

/* The same contract `creaseui-lint init` records for the installed exports. */
const replacedContracts = new Map()
for (const [contract, item] of CONTRACT_REPLACEMENTS)
  replacedContracts.set(item, [
    ...(replacedContracts.get(item) ?? []),
    contract,
  ])
export const contractFor = component =>
  replacedContracts.get(component)?.[0] ?? `component.${component}`

const exportNames = source =>
  [
    ...[
      ...source.matchAll(
        /^export (?:async )?(?:const|function\*?|class|let) ([A-Za-z_$][\w$]*)/gmu,
      ),
    ].map(match => match[1]),
    ...[...source.matchAll(/^export \{([^}]*)\}/gmu)].flatMap(match =>
      match[1]
        .split(',')
        .map(part => part.trim())
        .filter(part => part !== '' && !part.startsWith('type '))
        .map(part => part.split(/\s+as\s+/u).at(-1)),
    ),
  ].sort()

/* Shared state modules a component re-exports (`export * from
   '@/lib/sidebar-state'`) supply its program parts. */
const reexportedSources = source =>
  [...source.matchAll(/^export \*\s+from\s+['"]@\/lib\/([\w./-]+)['"]/gmu)]
    .map(match => join(process.cwd(), 'src/lib', `${match[1]}.ts`))
    .filter(file => existsSync(file))
    .map(file => readFileSync(file, 'utf8'))

export const programParts = source => {
  const sources = [source, ...reexportedSources(source)]
  return ['Model', 'Message', 'init', 'update', 'subscriptions', 'view'].filter(
    name =>
      sources.some(text =>
        new RegExp(
          `^export (?:type|interface|const|function|class) ${name}\\b`,
          'mu',
        ).test(text),
      ),
  )
}

/* `component` is the Tailwind item name the component shares across renderers. */
export const creaseMeta = ({ category, component, renderer, source }) => {
  const program = programParts(source)
  const stateful = program.includes('Model') && program.includes('update')
  const docsPage = `${DOCS}/docs/registry.md`
  const recipes = recipesFor(component)
  return {
    ...(category === undefined ? {} : { categories: [category.toLowerCase()] }),
    docs: stateful
      ? `Stateful Foldkit component: the parent owns its Model, routes its Message through update and renders view; install with the theme, then customize the installed source. See ${docsPage}.`
      : `Stateless Foldkit view: call it from your view with props and the HtmlBuilder; customize the installed source, not global CSS. See ${docsPage}.`,
    meta: {
      crease: {
        component,
        contract: contractFor(component),
        framework: 'foldkit',
        frameworkVersion: foldkitVersion,
        program,
        publicExports: exportNames(source),
        ...(recipes.length === 0 ? {} : { recipes }),
        renderer,
        replaces: replacedContracts.get(component) ?? [],
        schemaVersion: 1,
        stateOwnership: stateful ? 'parent-model' : 'stateless',
        stylingOwner: renderer === 'tailwind' ? 'component-classes' : renderer,
      },
    },
  }
}
