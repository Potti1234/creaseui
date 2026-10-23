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

/* Rules the strict preset applies to an owned file, by its grant. `doctor`
   reconciles the effective config against this same map. */
export const RULES_BY_GRANT = {
  raw: [
    'no-raw-controls',
    'no-raw-composition',
    'component-contract',
    'no-unverifiable-ui',
  ],
  theme: [
    'no-raw-controls',
    'no-raw-composition',
    'no-unapproved-renderer',
    'component-contract',
    'no-unverifiable-ui',
  ],
  setup: [
    'no-raw-controls',
    'no-raw-composition',
    'no-unapproved-renderer',
    'no-unverifiable-ui',
  ],
  /* Owned renderers without a raw grant compose installed components, so
     they keep every application rule. */
  composing: STRICT_RULE_IDS,
  /* Non-rendering logic (state machines, vendored style engines). */
  behavior: [],
}

export const grantOf = file =>
  file.rawRendering
    ? 'raw'
    : file.role === 'renderer'
      ? 'composing'
      : file.role === 'theme' || file.role === 'setup'
        ? file.role
        : 'behavior'

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
  const raw = paths(file => grantOf(file) === 'raw')
  const theme = paths(file => grantOf(file) === 'theme')
  const setup = paths(file => grantOf(file) === 'setup')
  const composing = paths(file => grantOf(file) === 'composing')
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
  /* Installed Crease sources are shadcn ports that use arbitrary Tailwind
     lengths; colours stay checked against the theme. */
  const rendererConfig = { pleat, stylex, tailwind }[strict.renderer]({
    arbitraryValues: false,
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
      rules: {
        ...levels(STRICT_RULE_IDS, strictLevel),
        'crease/form-association': strictLevel,
      },
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
        /* Whole-file raw grants skip these; `rawElements` grants are held to
           exactly the listed elements. */
        ...levels(RULES_BY_GRANT.raw, strictLevel),
      },
    })
  if (theme.length > 0)
    entries.push({
      ...shared,
      files: theme,
      name: '@creaseui/lint/strict/theme',
      rules: levels(RULES_BY_GRANT.theme, strictLevel),
    })
  if (setup.length > 0)
    entries.push({
      ...shared,
      files: setup,
      name: '@creaseui/lint/strict/setup-entry',
      rules: levels(RULES_BY_GRANT.setup, strictLevel),
    })
  if (composing.length > 0)
    entries.push({
      ...shared,
      files: composing,
      name: '@creaseui/lint/strict/composing',
      rules: {
        ...levels(RULES_BY_GRANT.composing, strictLevel),
        'crease/form-association': strictLevel,
      },
    })
  return entries
}
