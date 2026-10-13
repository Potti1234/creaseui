import path from 'node:path'

import tseslint from 'typescript-eslint'

import { pleat, plugin, stylex, tailwind } from './index.js'
import { createStrictContext } from './lib/strict/context.js'

export const STRICT_RULE_IDS = [
  'no-raw-controls',
  'no-raw-composition',
  'no-unapproved-renderer',
  'no-application-styles',
  'component-contract',
  'no-unverifiable-ui',
]

const levels = (names, level) =>
  Object.fromEntries(names.map(name => [`crease/${name}`, level]))

/**
 * Strict consumer configuration: application views may only compose
 * installed Crease components; raw rendering is limited to the exact files
 * the crease.lock.json receipt (or reviewed extensions) registers.
 */
export const creaseui = (options = {}) => {
  const strict = createStrictContext(options)
  const files = options.files ?? ['src/**/*.{ts,tsx,mts,js,jsx,mjs}']
  const owned = [...strict.ownership.files.values()]
  const paths = filter => owned.filter(filter).map(file => file.path)
  const raw = paths(file => file.rawRendering)
  const theme = paths(file => file.role === 'theme')
  const setup = paths(file => file.role === 'setup')
  const projects =
    strict.tsconfig === undefined
      ? undefined
      : (Array.isArray(strict.tsconfig)
          ? strict.tsconfig
          : [strict.tsconfig]
        ).map(project => path.resolve(strict.rootDir, project))
  const shared = {
    basePath: strict.rootDir,
    plugins: { crease: plugin },
    settings: { creaseui: strict },
  }
  const strictLevel = 'error'
  const rendererConfig = { pleat, stylex, tailwind }[strict.renderer]({
    files: raw,
  })

  const entries = [
    {
      ...shared,
      files: [...files, ...paths(() => true)],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions:
          projects === undefined
            ? { projectService: true, tsconfigRootDir: strict.rootDir }
            : { project: projects, tsconfigRootDir: strict.rootDir },
      },
      name: '@creaseui/lint/strict/setup',
    },
    {
      ...shared,
      files,
      ignores: paths(() => true),
      name: '@creaseui/lint/strict/application',
      rules: levels(STRICT_RULE_IDS, strictLevel),
    },
  ]
  if (strict.preset === 'migration')
    entries.push({
      ...shared,
      files: options.migrationFiles,
      ignores: paths(() => true),
      name: '@creaseui/lint/strict/migration',
      rules: levels(STRICT_RULE_IDS, 'warn'),
    })
  if (raw.length > 0)
    entries.push({
      ...shared,
      files: raw,
      name: '@creaseui/lint/strict/implementation',
      plugins: { ...rendererConfig.plugins, crease: plugin },
      rules: {
        ...rendererConfig.rules,
        ...levels(['component-contract', 'no-unverifiable-ui'], strictLevel),
      },
    })
  if (theme.length > 0)
    entries.push({
      ...shared,
      files: theme,
      name: '@creaseui/lint/strict/theme',
      rules: levels(
        [
          'no-raw-controls',
          'no-raw-composition',
          'no-unapproved-renderer',
          'component-contract',
          'no-unverifiable-ui',
        ],
        strictLevel,
      ),
    })
  if (setup.length > 0)
    entries.push({
      ...shared,
      files: setup,
      name: '@creaseui/lint/strict/setup-entry',
      rules: levels(
        [
          'no-raw-controls',
          'no-raw-composition',
          'no-unapproved-renderer',
          'no-unverifiable-ui',
        ],
        strictLevel,
      ),
    })
  return entries
}
