import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/* Foldkit-aware project information for `creaseui-lint info` and `inspect`,
   read from the project itself: package versions, components.json aliases,
   the install receipt and the installed source. */

const readJson = file =>
  existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined

const FRAMEWORK_PACKAGES = ['foldkit', '@foldkit/ui', 'effect', 'vite']
const PREFIX = { pleat: 'pleat-', stylex: 'stylex-', tailwind: '' }
const PROGRAM = ['Model', 'Message', 'init', 'update', 'subscriptions', 'view']

const installedVersion = (rootDir, name) =>
  readJson(path.join(rootDir, 'node_modules', name, 'package.json'))?.version

export const projectInfo = ({ manifest, rootDir }) => {
  const packageJson = readJson(path.join(rootDir, 'package.json')) ?? {}
  const declared = {
    ...packageJson.devDependencies,
    ...packageJson.dependencies,
  }
  const receipt = readJson(manifest)
  const components = readJson(path.join(rootDir, 'components.json'))
  return {
    aliases: components?.aliases ?? {},
    artifacts: (receipt?.artifacts ?? []).map(artifact => ({
      exports: (artifact.exports ?? []).length,
      files: (artifact.files ?? []).map(file => file.path),
      id: artifact.id,
      ...(artifact.adapted === undefined ? {} : { adapted: artifact.adapted }),
      ...(artifact.source === undefined ? {} : { source: artifact.source }),
    })),
    framework: Object.fromEntries(
      FRAMEWORK_PACKAGES.filter(name => declared[name] !== undefined).map(
        name => [
          name,
          {
            declared: declared[name],
            installed: installedVersion(rootDir, name),
          },
        ],
      ),
    ),
    policy: receipt?.policyVersion,
    receipt: receipt === undefined ? null : path.relative(rootDir, manifest),
    registries: components?.registries ?? {},
    renderer: receipt?.renderer,
  }
}

const matches = (artifact, name) =>
  artifact.id === name ||
  artifact.id?.split('/').at(-1) === name ||
  artifact.id?.split('/').at(-1) === `${PREFIX.stylex}${name}` ||
  artifact.id?.split('/').at(-1) === `${PREFIX.pleat}${name}` ||
  (artifact.exports ?? []).some(record => record.name === name)

export const inspectComponent = ({ component, manifest, rootDir }) => {
  const receipt = readJson(manifest)
  if (receipt === undefined)
    return {
      error: `no install receipt at ${path.relative(rootDir, manifest)}; run creaseui-lint init first`,
    }
  const artifact = (receipt.artifacts ?? []).find(entry =>
    matches(entry, component),
  )
  const install = `npx shadcn@latest add Potti1234/creaseui/${PREFIX[receipt.renderer] ?? ''}${component}`
  if (artifact === undefined)
    return {
      error: `${component} is not installed in this ${receipt.renderer} project. Install it with \`${install}\` and compose the installed source; if no Crease component fits, build a new domain component from installed ones instead of re-creating this one.`,
    }
  const files = (artifact.files ?? []).map(file => {
    const absolute = path.join(rootDir, file.path)
    const source = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null
    const program =
      source === null
        ? []
        : PROGRAM.filter(name =>
            new RegExp(
              `^export (?:type|interface|const|function|class) ${name}\\b`,
              'mu',
            ).test(source),
          )
    const sourceExports =
      source === null
        ? []
        : [
            ...source.matchAll(
              /^export (?:const|function|class|let) ([A-Za-z_$][\w$]*)/gmu,
            ),
          ].map(match => match[1])
    return {
      imports:
        source === null
          ? []
          : [
              ...new Set(
                [...source.matchAll(/^import [^'"]*['"]([^'"]+)['"]/gmu)].map(
                  match => match[1],
                ),
              ),
            ].sort(),
      missing: source === null,
      path: file.path,
      program,
      rawElements:
        file.rawRendering === true ? (file.rawElements ?? 'all') : undefined,
      role: file.role,
      sourceExports,
    }
  })
  const registered = new Set(
    (artifact.exports ?? []).map(record => record.name),
  )
  const program = [...new Set(files.flatMap(file => file.program))]
  const stateful = program.includes('Model') && program.includes('update')
  const limitations = [
    ...files
      .filter(file => file.missing)
      .map(file => `${file.path} is in the receipt but missing on disk`),
    ...files.flatMap(file =>
      file.sourceExports
        .filter(name => !registered.has(name))
        .map(
          name =>
            `${file.path} exports ${name} without a contract; doctor checks whether it renders`,
        ),
    ),
    ...files
      .filter(file => file.rawElements !== undefined)
      .map(
        file =>
          `${file.path} may render raw ${file.rawElements === 'all' ? 'elements' : file.rawElements.join(', ')}`,
      ),
  ]
  return {
    artifact: artifact.id,
    exports: (artifact.exports ?? []).map(record => ({
      contract: record.contract,
      foundations: record.foundations ?? [],
      name: record.name,
      renderKind: record.renderKind ?? 'helper',
      variants: record.variants ?? {},
      visibility: record.visibility ?? 'public',
    })),
    files: files.map(({ sourceExports, missing, ...file }) => file),
    install,
    limitations,
    program,
    renderer: receipt.renderer,
    stateOwnership: stateful
      ? 'parent-model: keep its Model in yours, route its Message through update and render view'
      : 'stateless: call it from your view with props',
    stylingOwner: `${receipt.renderer} component source (customize the installed file, not global CSS)`,
  }
}
