import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/* `creaseui-lint info --catalog` lists what can be installed before anything
   is: one entry per component item of the three renderer registries. */

const root = new URL('..', import.meta.url).pathname
const registries = {
  tailwind: 'src/ui/registry.json',
  stylex: 'src/stylex/registry.json',
  pleat: 'src/pleat/registry.json',
}

const components = Object.entries(registries).flatMap(([renderer, file]) =>
  JSON.parse(readFileSync(join(root, file), 'utf8'))
    .items.filter(item => item.type === 'registry:ui' && item.meta?.crease)
    .map(item => ({
      category: item.categories?.[0] ?? 'other',
      component: item.meta.crease.component,
      description: item.description,
      exports: item.meta.crease.publicExports ?? [],
      install: `npx shadcn@latest add Potti1234/creaseui/${item.name}`,
      item: item.name,
      ...(item.meta.crease.recipes === undefined
        ? {}
        : { recipes: item.meta.crease.recipes.map(recipe => recipe.id) }),
      renderer,
      state: item.meta.crease.stateOwnership,
      title: item.title,
    })),
)

/* Custom properties the components assign to their own elements at runtime
   (e.g. Drawer's --drawer-swipe-strength). doctor tells these apart from
   theme roles when an older source reads one without a fallback. */
const sourceFiles = directory =>
  readdirSync(join(root, directory), { recursive: true })
    .filter(file => String(file).endsWith('.ts'))
    .map(file => join(root, directory, String(file)))
const runtimeProperties = [
  ...new Set(
    ['src/ui', 'src/stylex', 'src/pleat', 'src/lib']
      .flatMap(sourceFiles)
      .flatMap(file => [
        ...readFileSync(file, 'utf8').matchAll(
          /['"](--[\w-]*\w)['"]\s*:|setProperty\(\s*['"](--[\w-]*\w)['"]/gu,
        ),
      ])
      .map(match => match[1] ?? match[2]),
  ),
].sort()

writeFileSync(
  join(root, 'packages/lint/catalog.json'),
  `${JSON.stringify({ schemaVersion: 1, components, runtimeProperties }, null, 2)}\n`,
)
