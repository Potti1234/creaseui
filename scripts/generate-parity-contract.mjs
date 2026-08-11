import { readFile, writeFile } from 'node:fs/promises'

const roadmapPath = 'docs/component-roadmap.json'
const registryPath = 'src/ui/registry.json'
const upstreamPath = 'docs/upstream-shadcn.json'
const outputPath = 'docs/component-parity.json'

const [roadmap, registry, upstream] = await Promise.all(
  [roadmapPath, registryPath, upstreamPath].map(async path =>
    JSON.parse(await readFile(path, 'utf8')),
  ),
)

const registryNames = registry.items
  .filter(item => item.type === 'registry:ui')
  .map(item => item.name)
  .sort()
const adapted = new Set(roadmap.classifications.adapted)
const recipes = new Set(roadmap.classifications.recipe)
const legacy = new Set(roadmap.classifications.legacy)
const upstreamNames = new Set(upstream.components)

const missing = upstream.components.filter(component => !registryNames.includes(component))
if (missing.length > 0) {
  throw new Error(`Upstream components missing from Crease UI: ${missing.join(', ')}`)
}

const classificationFor = component =>
  recipes.has(component)
    ? 'recipe'
    : legacy.has(component)
      ? 'legacy'
      : adapted.has(component)
        ? 'adapted'
        : 'full'

const components = registryNames.map(component => {
  const classification = classificationFor(component)
  const dimensions = {
    ...roadmap.qualityContract.defaults,
    ...(roadmap.qualityContract.classificationOverrides[classification] ?? {}),
    ...(roadmap.qualityContract.componentOverrides[component] ?? {}),
  }

  return {
    component,
    upstream: upstreamNames.has(component),
    classification,
    dimensions,
    evidence: [
      `src/ui/${component}.ts`,
      `src/ui/registry.json#${component}`,
      `/docs/components/${component}`,
      ...(roadmap.qualityContract.evidence[component] ?? []),
    ],
  }
})

const contract = {
  $schema: './component-parity.schema.json',
  upstream: {
    repository: upstream.repository,
    commit: upstream.commit,
    date: upstream.date,
    registryItems: upstream.components.length,
  },
  statuses: roadmap.qualityContract.statuses,
  dimensions: roadmap.qualityContract.dimensions,
  summary: {
    upstreamItems: upstream.components.length,
    registryItems: registryNames.length,
    creaseOnlyRecipes: registryNames.filter(component => !upstreamNames.has(component)),
  },
  components,
}

const output = `${JSON.stringify(contract, null, 2)}\n`
if (process.argv.includes('--write')) {
  await writeFile(outputPath, output, 'utf8')
  console.log(`Generated parity contracts for ${components.length} components.`)
} else {
  const current = await readFile(outputPath, 'utf8').catch(() => '')
  if (current !== output) {
    console.error('Component parity contract is stale. Run npm run parity:generate.')
    process.exitCode = 1
  } else {
    console.log(`Component parity contract passed (${components.length} components).`)
  }
}
