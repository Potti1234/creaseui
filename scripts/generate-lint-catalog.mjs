import { readFileSync, writeFileSync } from 'node:fs'
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

writeFileSync(
  join(root, 'packages/lint/catalog.json'),
  `${JSON.stringify({ schemaVersion: 1, components }, null, 2)}\n`,
)
