#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

import ts from 'typescript'

import {
  CONTRACT_REPLACEMENTS,
  POLICY_VERSION,
  RENDERERS,
} from '../lib/strict/contracts.js'
import { RULES_BY_GRANT, grantOf } from '../creaseui.js'
import { createCssAudit, findStylesheets } from '../lib/strict/css.js'
import { verifyFoundations } from '../lib/strict/foundations.js'
import { inspectComponent, projectInfo } from '../lib/strict/info.js'
import { BaselineError, enforcementChanges } from '../lib/strict/scope.js'
import { CreaseConfigError } from '../lib/strict/ownership.js'
import { createRenderExports } from '../lib/strict/render-exports.js'

const USAGE = `Usage:
  creaseui-lint init   --renderer <tailwind|stylex|pleat> [--components <dir>]... [--root <dir>] [--manifest crease.lock.json] [--dry-run]
  creaseui-lint doctor [--config creaseui-lint.config.mjs] [--root <dir>]
  creaseui-lint css    [--config creaseui-lint.config.mjs] [--root <dir>]
  creaseui-lint info    [--root <dir>] [--manifest crease.lock.json] [--json]
  creaseui-lint info    --catalog [--renderer <tailwind|stylex|pleat>] [--json]
  creaseui-lint inspect --component <name> [--root <dir>] [--json]
  creaseui-lint scope  --baseline <trusted git ref> [--root <dir>] [--allow-enforcement-changes]
  creaseui-lint audit  --config creaseui-lint.audit.mjs [--output report.json] [--report-only]

Exit codes: 0 ok, 1 findings, 2 invalid setup.`

const CONTRACT_BY_ITEM = new Map(
  [...CONTRACT_REPLACEMENTS].map(([contract, item]) => [item, contract]),
)
const SOURCE = /\.(?:ts|tsx|mts|js|jsx|mjs)$/u
const toPosix = value => value.split(path.sep).join('/')

const walk = directory =>
  existsSync(directory)
    ? readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(directory, entry.name)
        if (entry.isDirectory())
          return entry.name === 'node_modules' ? [] : walk(full)
        return SOURCE.test(entry.name) && !entry.name.endsWith('.d.ts')
          ? [full]
          : []
      })
    : []

const exportedFunctions = file => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  const names = []
  const isFunction = node =>
    node !== undefined &&
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node))
  /* Local factories whose result is a function (`slotDiv = (...) => (props, h) => ...`). */
  const factories = new Set()
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      const returned = statement.body?.statements.find(ts.isReturnStatement)
      if (isFunction(returned?.expression)) factories.add(statement.name.text)
    }
    if (ts.isVariableStatement(statement))
      for (const declaration of statement.declarationList.declarations) {
        const init = declaration.initializer
        if (
          ts.isIdentifier(declaration.name) &&
          isFunction(init) &&
          isFunction(
            ts.isBlock(init.body)
              ? init.body.statements.find(ts.isReturnStatement)?.expression
              : init.body,
          )
        )
          factories.add(declaration.name.text)
      }
  }
  for (const statement of source.statements) {
    const exported = statement.modifiers?.some(
      modifier => modifier.kind === ts.SyntaxKind.ExportKeyword,
    )
    if (!exported) continue
    if (ts.isFunctionDeclaration(statement) && statement.name)
      names.push(statement.name.text)
    if (ts.isVariableStatement(statement))
      for (const declaration of statement.declarationList.declarations)
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer !== undefined &&
          (isFunction(declaration.initializer) ||
            (ts.isCallExpression(declaration.initializer) &&
              ts.isIdentifier(declaration.initializer.expression) &&
              factories.has(declaration.initializer.expression.text)))
        )
          names.push(declaration.name.text)
  }
  return names
}

/** Class and slot names the sources of a stylesheet's owner mention. */
const ownerRoots = (strict, rootDir) => file => {
  const owner = strict.ownership.fileFor(file)?.owner
  if (owner === undefined) return undefined
  const roots = new Set()
  for (const record of strict.ownership.files.values()) {
    if (record.owner !== owner || !/\.[cm]?[jt]sx?$/u.test(record.path))
      continue
    const source = path.resolve(rootDir, record.path)
    if (!existsSync(source)) continue
    for (const literal of readFileSync(source, 'utf8').matchAll(
      /(['"`])((?:(?!\1)[^\\]|\\.)*)\1/gu,
    ))
      for (const token of literal[2].matchAll(/[\w-]+/gu)) roots.add(token[0])
  }
  /* An owner without sources (CSS-only artifact) cannot be checked. */
  return roots.size === 0 ? undefined : roots
}

const rendersHtml = file => /\bHtmlBuilder\b/u.test(readFileSync(file, 'utf8'))

/* Receipt variants are what the lint enforces; doctor reconciles them with
   the renderer's source of truth so a value added on one side only cannot
   contradict the other. Tailwind components keep the allowed values as the
   keys of each prop object inside `export const <name>Variants = cva(...)`;
   StyleX and Pleat keep them as `<EXPORT>_<PROP>S` `as const` arrays in a
   contracts module (e.g. BUTTON_VARIANTS, BUTTON_SIZES). */
const constantPart = name =>
  name.replace(/([a-z0-9])([A-Z])/gu, '$1_$2').toUpperCase()

const propKey = name =>
  name !== undefined && (ts.isIdentifier(name) || ts.isStringLiteral(name))
    ? name.text
    : null

const literalValue = node => {
  while (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  )
    node = node.expression
  if (ts.isStringLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (
    ts.isPrefixUnaryExpression(node) &&
    ts.isNumericLiteral(node.operand) &&
    (node.operator === ts.SyntaxKind.MinusToken ||
      node.operator === ts.SyntaxKind.PlusToken)
  )
    return node.operator === ts.SyntaxKind.MinusToken
      ? -Number(node.operand.text)
      : Number(node.operand.text)
  return undefined
}

/** `<name>Variants` cva config in a component file: prop -> allowed keys,
    or null when the export has no such config to compare against. */
const cvaVariants = (file, exportName) => {
  if (!existsSync(file)) return null
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== `${exportName}Variants`
      )
        continue
      const init = declaration.initializer
      if (init === undefined || !ts.isCallExpression(init)) return null
      const config = init.arguments[1]
      if (config === undefined || !ts.isObjectLiteralExpression(config))
        return null
      const variants = config.properties.find(
        property =>
          ts.isPropertyAssignment(property) &&
          propKey(property.name) === 'variants',
      )
      if (
        variants === undefined ||
        !ts.isObjectLiteralExpression(variants.initializer)
      )
        return null
      const found = new Map()
      for (const prop of variants.initializer.properties) {
        if (!ts.isPropertyAssignment(prop)) continue
        const key = propKey(prop.name)
        if (key === null || !ts.isObjectLiteralExpression(prop.initializer))
          continue
        found.set(
          key,
          prop.initializer.properties.map(entry => propKey(entry.name)),
        )
      }
      return found
    }
  }
  return null
}

/** Values of an exported `as const` array anywhere under src/, or null. */
const constArrayValues = (sources, constName) => {
  for (const file of sources) {
    const text = readFileSync(file, 'utf8')
    if (!text.includes(constName)) continue
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue
      for (const declaration of statement.declarationList.declarations) {
        if (
          !ts.isIdentifier(declaration.name) ||
          declaration.name.text !== constName
        )
          continue
        let init = declaration.initializer
        while (
          init !== undefined &&
          (ts.isAsExpression(init) ||
            ts.isSatisfiesExpression(init) ||
            ts.isParenthesizedExpression(init))
        )
          init = init.expression
        if (init === undefined || !ts.isArrayLiteralExpression(init))
          return null
        const values = init.elements.map(literalValue)
        return values.includes(undefined) ? null : values
      }
    }
  }
  return null
}

const VARIANTS = /(?:Variants?|variants)$/u

/** Typed rendering exports plus the syntactic floor, deduplicated by name. */
const renderingExports = (renderExports, file) => {
  const typed = renderExports.of(file) ?? []
  const names = new Set(typed.map(entry => entry.name))
  const nonRendering = renderExports.nonRendering(file)
  return [
    ...typed,
    ...exportedFunctions(file)
      .filter(
        name =>
          !VARIANTS.test(name) && !names.has(name) && !nonRendering.has(name),
      )
      .map(name => ({ name, origin: path.resolve(file), originName: name })),
  ]
}

/** Receipt for the components installed in one directory. */
export const buildReceipt = ({ rootDir, components, renderer, setup = [] }) => {
  const prefix = renderer === 'tailwind' ? '' : `${renderer}-`
  /* The first directory holds the components; further directories (the
     registry's `lib` target) hold their installed implementation helpers. */
  const [base, ...support] = (
    Array.isArray(components) ? components : [components]
  ).map(directory => path.resolve(rootDir, directory))
  const supportOf = file =>
    support.find(directory => !path.relative(directory, file).startsWith('..'))
  const files = [
    ...new Set([base, ...support].flatMap(directory => walk(directory))),
  ].sort()
  const describe = file => {
    const helper = supportOf(file)
    const local = toPosix(path.relative(helper ?? base, file)).replace(
      SOURCE,
      '',
    )
    const item = path.basename(local)
    const behavior =
      helper !== undefined || local.split('/').includes('behavior')
    const contract =
      helper !== undefined
        ? `implementation.${item}`
        : behavior
          ? `behavior.${item}`
          : (CONTRACT_BY_ITEM.get(item) ?? `component.${item}`)
    return {
      behavior,
      contract,
      local: helper === undefined ? local : `${path.basename(helper)}/${local}`,
    }
  }
  const installed = new Set(files.map(file => path.resolve(file)))
  const renderExports = createRenderExports({ files, rootDir })
  const artifacts = files.map(file => {
    const relative = toPosix(path.relative(rootDir, file))
    const { behavior, contract, local } = describe(file)
    const raw = rendersHtml(file)
    /* Alias-only modules (`export const action = button`) render without
       naming HtmlBuilder; they are renderers but get no raw-element grant. */
    const renders = raw || (renderExports.of(file) ?? []).length > 0
    const role =
      renders && supportOf(file) !== undefined
        ? 'renderer'
        : behavior
          ? 'behavior'
          : renders
            ? 'renderer'
            : 'theme'
    /* An alias of another installed component keeps that component's
         contract (`export const actionAlias = button`). */
    const contractOf = origin =>
      installed.has(origin) &&
      origin !== path.resolve(file) &&
      !describe(origin).behavior
        ? describe(origin).contract
        : contract
    const exports = renders
      ? renderingExports(renderExports, file).map(({ name, origin }) => ({
          contract: contractOf(origin),
          file: relative,
          name,
          ...(behavior ? { visibility: 'implementation' } : {}),
        }))
      : []
    return {
      exports,
      files: [{ path: relative, rawRendering: raw, role }],
      /* shadcn installs StyleX/Pleat items under `ui/<renderer>/`; that
         directory is already the id's renderer prefix. */
      id: `crease/${prefix}${local
        .replace(new RegExp(`^${renderer}/`, 'u'), '')
        .split('/')
        .join('-')}`,
    }
  })
  const owned = new Set(files.map(file => path.resolve(file)))
  for (const file of setup.map(entry => path.resolve(rootDir, entry)))
    if (!owned.has(file))
      artifacts.push({
        exports: [],
        files: [
          {
            path: toPosix(path.relative(rootDir, file)),
            rawRendering: false,
            role: 'setup',
          },
        ],
        id: `crease/setup-${toPosix(path.relative(rootDir, file)).replace(SOURCE, '').split('/').join('-')}`,
      })
  return {
    artifacts,
    policyVersion: POLICY_VERSION,
    renderer,
    schemaVersion: 1,
  }
}

const configFragment = ({
  renderer,
  manifest,
  tsconfig,
}) => `import { fileURLToPath } from 'node:url'
import { creaseui } from '@creaseui/lint'

export default [
  ...creaseui({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    renderer: '${renderer}',
    preset: 'strict',
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    tsconfig: '${tsconfig}',
    manifest: '${manifest}',
    policy: '${POLICY_VERSION}',
  }),
]
`

const ESLINT_CONFIGS = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
]

const aliasDirectory = alias =>
  typeof alias === 'string' ? alias.replace(/^@\//u, 'src/') : undefined

/* components.json says where shadcn installed the registry files and which
   stylesheet carries the theme; the files importing it are the app's setup. */
const installTargets = rootDir => {
  const file = path.join(rootDir, 'components.json')
  if (!existsSync(file)) return { components: [], declared: [], setup: [] }
  const config = JSON.parse(readFileSync(file, 'utf8'))
  const declared = [config.aliases?.ui, config.aliases?.lib]
    .map(aliasDirectory)
    .filter(directory => directory !== undefined)
  const components = declared.filter(directory =>
    existsSync(path.join(rootDir, directory)),
  )
  const stylesheet = config.tailwind?.css
  const setup =
    typeof stylesheet !== 'string'
      ? []
      : walk(path.join(rootDir, 'src')).filter(source =>
          [
            ...readFileSync(source, 'utf8').matchAll(
              /^import\s+['"](\.{1,2}\/[^'"]+\.css)['"]/gmu,
            ),
          ].some(
            match =>
              path.resolve(path.dirname(source), match[1]) ===
              path.resolve(rootDir, stylesheet),
          ),
        )
  return { components, declared, setup }
}

const init = values => {
  const rootDir = path.resolve(values.root ?? '.')
  if (!RENDERERS.includes(values.renderer))
    throw new CreaseConfigError([
      `--renderer must be one of ${RENDERERS.join(', ')}`,
    ])
  const targets = installTargets(rootDir)
  const components = values.components ?? targets.components
  if (components.length === 0)
    throw new CreaseConfigError([
      targets.declared.length > 0
        ? `nothing is installed yet: components.json points ui/lib at ${targets.declared.join(', ')}, which does not exist. Install components first (\`creaseui-lint info --catalog\` lists them), then run init`
        : '--components <dir> (the installed component directory) is required when components.json has no ui/lib alias',
    ])
  const manifest = values.manifest ?? 'crease.lock.json'
  const tsconfig = existsSync(path.join(rootDir, 'tsconfig.json'))
    ? './tsconfig.json'
    : './jsconfig.json'
  const receipt = buildReceipt({
    components,
    setup: targets.setup,
    renderer: values.renderer,
    rootDir,
  })
  const writes = []
  const manifestPath = path.join(rootDir, manifest)
  if (existsSync(manifestPath)) {
    /* Registered artifacts are reviewed records and stay as they are; only
       installs whose files the receipt does not know yet are appended. */
    const current = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const registered = new Set(
      (current.artifacts ?? []).flatMap(artifact =>
        (artifact.files ?? []).map(file => file.path),
      ),
    )
    const added = receipt.artifacts.filter(artifact =>
      artifact.files.every(file => !registered.has(file.path)),
    )
    if (added.length === 0)
      console.log(
        `keep    ${manifest} (up to date; registered artifacts are never rewritten)`,
      )
    else {
      console.log(
        `update  ${manifest} (+${added.length}: ${added.map(artifact => artifact.id).join(', ')})`,
      )
      writes.push([
        manifestPath,
        `${JSON.stringify({ ...current, artifacts: [...(current.artifacts ?? []), ...added] }, null, 2)}\n`,
      ])
    }
  } else writes.push([manifestPath, `${JSON.stringify(receipt, null, 2)}\n`])
  const existing = ESLINT_CONFIGS.find(name =>
    existsSync(path.join(rootDir, name)),
  )
  const fragment = configFragment({
    manifest: `./${manifest}`,
    renderer: values.renderer,
    tsconfig,
  })
  if (existing === undefined)
    writes.push([path.join(rootDir, 'eslint.config.js'), fragment])
  else if (
    /\bcreaseui\s*\(/u.test(readFileSync(path.join(rootDir, existing), 'utf8'))
  )
    console.log(`keep    ${existing} (already spreads creaseui())`)
  else {
    writes.push([path.join(rootDir, 'creaseui-lint.config.mjs'), fragment])
    console.log(
      `keep    ${existing} (existing config is never replaced)\n        add: import crease from './creaseui-lint.config.mjs'  and spread  ...crease  into its exported array`,
    )
  }
  for (const [file, content] of writes) {
    console.log(
      `${values['dry-run'] ? 'would write' : 'write  '} ${toPosix(path.relative(rootDir, file))}`,
    )
    if (!values['dry-run']) writeFileSync(file, content)
  }
  console.log(
    `receipt: ${receipt.artifacts.length} artifacts, ${receipt.artifacts.filter(artifact => artifact.files[0].rawRendering).length} raw-rendering files`,
  )
  return 0
}

const findConfigOptions = async values => {
  const rootDir = path.resolve(values.root ?? '.')
  const configFile = path.resolve(rootDir, values.config ?? 'eslint.config.js')
  if (!existsSync(configFile))
    throw new CreaseConfigError([
      `config '${toPosix(path.relative(rootDir, configFile))}' not found; run \`creaseui-lint init\``,
    ])
  const config = (await import(pathToFileURL(configFile).href)).default
  const entries = (Array.isArray(config) ? config : [config]).flat(Infinity)
  const entry = entries.find(item => item?.settings?.creaseui !== undefined)
  if (entry === undefined)
    throw new CreaseConfigError([
      `${toPosix(path.relative(rootDir, configFile))} does not spread creaseui() from @creaseui/lint`,
    ])
  return { configFile, entries, rootDir, strict: entry.settings.creaseui }
}

const doctor = async values => {
  const { configFile, rootDir, strict } = await findConfigOptions(values)
  const findings = []
  const ok = message => console.log(`ok      ${message}`)
  const fail = message => {
    findings.push(message)
    console.log(`problem ${message}`)
  }
  ok(
    `receipt valid (renderer ${strict.renderer}, policy ${strict.policy}, ${strict.ownership.files.size} owned files)`,
  )
  const { ESLint } = await import('eslint')
  const eslint = new ESLint({ cwd: rootDir, overrideConfigFile: configFile })
  const sources = walk(path.join(rootDir, 'src'))
  const installDirs = installTargets(rootDir).components.map(directory =>
    path.resolve(rootDir, directory),
  )
  const ruleIds = [
    'no-raw-controls',
    'no-raw-composition',
    'no-unapproved-renderer',
    'no-application-styles',
    'component-contract',
    'no-unverifiable-ui',
  ]
  let uncovered = 0
  const renderExports = createRenderExports({
    files: sources.filter(
      file => strict.ownership.fileFor(file)?.role === 'renderer',
    ),
    rootDir,
  })
  let incomplete = 0
  for (const file of sources) {
    const relative = toPosix(path.relative(rootDir, file))
    const owned = strict.ownership.fileFor(file)
    /* An ignored implementation is unchecked, not approved: registration
       never switches the authoring rules off. */
    if (await eslint.isPathIgnored(file)) {
      if (owned !== undefined || rendersHtml(file)) {
        incomplete += 1
        fail(
          `${relative} is ignored by the ESLint config; its ${owned === undefined ? 'UI module' : `registered ${owned.role}`} is not checked`,
        )
      }
      continue
    }
    const effective = await eslint.calculateConfigForFile(file)
    const active = ruleId => {
      const setting = effective?.rules?.[`crease/${ruleId}`]
      const level = Array.isArray(setting) ? setting[0] : setting
      return level !== undefined && level !== 'off' && level !== 0
    }
    if (owned === undefined) {
      const installedIn = installDirs.find(directory =>
        path.resolve(file).startsWith(`${directory}${path.sep}`),
      )
      if (installedIn !== undefined && rendersHtml(file)) {
        uncovered += 1
        incomplete += 1
        fail(
          `${relative} is installed in ${toPosix(path.relative(rootDir, installedIn))} but not registered in crease.lock.json; re-run creaseui-lint init`,
        )
      }
      const missing = ruleIds.filter(ruleId => !active(ruleId))
      if (
        missing.length > 0 &&
        (rendersHtml(file) || (renderExports.of(file) ?? []).length > 0)
      ) {
        uncovered += 1
        incomplete += 1
        fail(
          `${relative} renders UI but is not covered by ${missing.join(', ')}`,
        )
      }
    } else {
      /* The rules the strict preset applies to this role and grant must
         still be active after every imported policy module. */
      const required = RULES_BY_GRANT[grantOf(owned)]
      for (const ruleId of required.filter(ruleId => !active(ruleId))) {
        incomplete += 1
        fail(`${relative} (registered ${owned.role}) lost ${ruleId}`)
      }
      if (
        owned.role === 'renderer' &&
        (rendersHtml(file) || (renderExports.of(file) ?? []).length > 0)
      ) {
        const registered = strict.ownership.exportsOf(file)
        for (const { name, origin, originName } of renderingExports(
          renderExports,
          file,
        )) {
          const record = registered?.get(name)
          if (record === undefined) {
            uncovered += 1
            incomplete += 1
            fail(
              `${relative}: rendering export \`${name}\` has no contract in the manifest`,
            )
            continue
          }
          const aliased =
            origin === path.resolve(file)
              ? undefined
              : strict.ownership.exportsOf(origin)?.get(originName)
          if (aliased !== undefined && aliased.contract !== record.contract)
            fail(
              `${relative}: \`${name}\` renders ${aliased.contract} (\`${originName}\`) but is registered as ${record.contract}`,
            )
        }
      }
    }
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(
      /eslint-disable(?:-next-line|-line)?\s+([^\n*]*crease\/[^\n*]*)/gu,
    ))
      if (!/--\s*\S/u.test(match[1]))
        fail(
          `${relative}: Crease suppression without a reason (${match[1].trim()})`,
        )
    if (
      effective?.languageOptions?.parserOptions?.projectService !== true &&
      effective?.languageOptions?.parserOptions?.project === undefined &&
      SOURCE.test(file)
    )
      fail(`${relative}: no typed parser configuration`)
  }
  ok(
    `${sources.length} source files inspected, ${uncovered} uncovered UI modules`,
  )
  const missingReplacements = [...CONTRACT_REPLACEMENTS.keys()].filter(
    contract => strict.ownership.publicExportFor(contract) === undefined,
  )
  if (missingReplacements.length > 0)
    console.log(
      `note    no installed replacement for: ${missingReplacements.join(', ')} (diagnostics show install commands)`,
    )
  const stylesheets = createCssAudit({
    isOwned: file => strict.ownership.fileFor(file) !== undefined,
    rootDir,
    rootsOf: ownerRoots(strict, rootDir),
  })
  for (const file of findStylesheets(rootDir)) stylesheets.auditFile(file)
  for (const finding of stylesheets.findings) {
    if (finding.kind === 'unverifiable') incomplete += 1
    fail(
      `${finding.file}:${finding.line} ${finding.kind === 'unverifiable' ? 'unverifiable CSS: ' : ''}${finding.message}`,
    )
  }
  console.log(`ok      ${stylesheets.files.size} stylesheets inspected`)
  /* Installed components read theme roles through `var(--role)`; a role no
     stylesheet declares and no installed source sets falls back silently. */
  const declared = new Set(
    [...stylesheets.files].flatMap(entry => {
      const file = path.resolve(
        rootDir,
        Array.isArray(entry) ? entry[0] : entry,
      )
      if (!existsSync(file)) return []
      const css = readFileSync(file, 'utf8')
      /* Only Tailwind compiles `@theme` blocks; elsewhere they define nothing. */
      const effective =
        strict.ownership.renderer === 'tailwind'
          ? css
          : css.replace(/@theme[^{]*\{[^}]*\}/gu, '')
      return effective
        ? [...effective.matchAll(/(--[\w-]+)\s*:/gu)].map(match => match[1])
        : []
    }),
  )
  const installedSources = sources
    .filter(file => strict.ownership.fileFor(file) !== undefined)
    .map(file => [
      file,
      readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/gu, ''),
    ])
  const assigned = new Set(
    installedSources.flatMap(([, text]) =>
      [...text.replace(/var\(--[\w-]+/gu, ' ').matchAll(/--[\w-]*\w/gu)].map(
        match => match[0],
      ),
    ),
  )
  for (const [file, text] of installedSources) {
    const undefinedRoles = [
      ...new Set(
        [...text.matchAll(/var\((--[\w-]*\w)\s*\)/gu)].map(match => match[1]),
      ),
    ].filter(role => !declared.has(role) && !assigned.has(role))
    const runtime = undefinedRoles.filter(role => RUNTIME_PROPERTIES.has(role))
    const roles = undefinedRoles.filter(role => !RUNTIME_PROPERTIES.has(role))
    const relative = toPosix(path.relative(rootDir, file))
    if (roles.length > 0)
      fail(
        `${relative} reads ${roles.join(', ')}, which no stylesheet defines; install the theme (crease-theme for Tailwind, crease-theme-css for StyleX and Pleat) and import it`,
      )
    /* Older snapshots read component runtime properties without a fallback;
       no theme defines those, so pointing at the theme would mislead. */
    if (runtime.length > 0)
      fail(
        `${relative} reads ${runtime.join(', ')} without a fallback: runtime properties CreaseUI components set on their own elements while they render, not theme roles, so installing a theme won't define them. This source predates the fallback; re-install it from the current registry or read it as var(${runtime[0]}, <default>)`,
      )
  }
  for (const problem of verifyFoundations({
    ownership: strict.ownership,
    rootDir,
  }))
    fail(problem)
  /* A receipt value the source does not define contradicts it: the lint
     accepts what the type rejects. Values the receipt drops are the
     intended narrowing mechanism, so they are a note, not a failure. */
  const shown = value =>
    typeof value === 'string' ? `'${value}'` : String(value)
  /* cva variant keys for boolean props are the strings 'true'/'false'
     while receipts record the booleans they select. */
  const variantValue = value =>
    value === 'true' ? true : value === 'false' ? false : value
  const compare = (record, prop, sourceValues, where) => {
    const label = `\`${record.name}\` (${record.contract}) variant \`${prop}\``
    const receiptValues = record.variants[prop]
    /* A prop the receipt does not list carries no restriction at all. */
    if (!Array.isArray(receiptValues)) return
    const source = sourceValues.map(variantValue)
    const receipt = receiptValues.map(variantValue)
    for (const value of receipt)
      if (!source.includes(value))
        fail(
          `${record.file}: ${label} allows ${shown(value)} in the receipt but not in ${where}; remove the value from the receipt, or add it to the source`,
        )
    const narrowed = source.filter(value => !receipt.includes(value))
    if (narrowed.length > 0)
      console.log(
        `note    ${record.file}: ${label} drops ${narrowed.map(shown).join(', ')} (narrowed by the receipt)`,
      )
  }
  for (const byName of strict.ownership.exports.values())
    for (const record of byName.values()) {
      const props = Object.keys(record.variants ?? {})
      if (props.length === 0) continue
      if (strict.renderer === 'tailwind') {
        const variants = cvaVariants(
          path.resolve(rootDir, record.file),
          record.name,
        )
        if (variants === null) continue
        for (const [prop, values] of variants)
          compare(record, prop, values, `${record.name}Variants`)
        for (const prop of props)
          if (!variants.has(prop))
            fail(
              `${record.file}: \`${record.name}\` (${record.contract}) receipt variant \`${prop}\` has no entry in ${record.name}Variants; remove it from the receipt, or add it to the source`,
            )
      } else {
        const base = constantPart(record.name)
        const resolved = new Map()
        for (const prop of props)
          for (const constant of [
            `${base}_${constantPart(prop)}S`,
            `${base}_${constantPart(prop)}`,
          ]) {
            const values = constArrayValues(sources, constant)
            if (values !== null) {
              resolved.set(prop, { constant, values })
              break
            }
          }
        if (resolved.size === 0) continue
        for (const prop of props) {
          const entry = resolved.get(prop)
          if (entry === undefined)
            fail(
              `${record.file}: \`${record.name}\` (${record.contract}) receipt variant \`${prop}\` has no ${base}_${constantPart(prop)} constant in the sources; remove it from the receipt, or add the constant`,
            )
          else compare(record, prop, entry.values, entry.constant)
        }
      }
    }
  if (incomplete > 0) {
    console.log(
      `coverage feature-only: ${incomplete} implementation or UI files are ignored, lose Crease rules or have unregistered rendering exports; this is not complete design-system enforcement`,
    )
    return 2
  }
  console.log('coverage complete')
  return findings.length === 0 ? 0 : 1
}

/* Browser tooling loads only for `audit`, never from the lint entry points. */
const audit = async values => {
  if (!values.config) {
    console.error('creaseui-lint audit: --config <file> is required')
    return 2
  }
  const { AuditSetupError, loadAuditConfig, runAudit } =
    await import('../lib/audit/index.js')
  const configPath = path.resolve(values.config)
  try {
    const report = await runAudit(await loadAuditConfig(configPath), {
      reportOnly: values['report-only'],
      searchFrom: [path.dirname(configPath), process.cwd()],
    })
    for (const finding of report.findings)
      console.log(
        `${finding.severity} ${finding.rule} [${finding.case} ${finding.theme} ${finding.viewport} ${finding.direction} ${finding.state}] ${finding.selector}: ${finding.measured} (expected ${finding.expected}). ${finding.fix}`,
      )
    for (const result of report.results.filter(
      result => result.status === 'unvisited',
    ))
      console.error(
        `incomplete [${result.case} ${result.theme} ${result.viewport} ${result.direction} ${result.state}]: ${result.reason}`,
      )
    for (const exception of report.exceptions.unused)
      console.warn(
        `unused exception ${exception.rule} ${exception.selector} (${exception.owner})`,
      )
    const { coverage } = report
    console.log(
      `audit: ${coverage.checked} checked, ${coverage.failed} failed, ${coverage.unresolved} unresolved, ${coverage.unsupported} unsupported, ${coverage.unvisited} unvisited, ${coverage.excluded} excluded`,
    )
    if (values.output)
      writeFileSync(values.output, `${JSON.stringify(report, null, 2)}\n`)
    return report.exitCode
  } catch (error) {
    if (error instanceof AuditSetupError) {
      console.error(error.message)
      return 2
    }
    throw error
  }
}

const css = async values => {
  const { rootDir, strict } = await findConfigOptions(values)
  const run = createCssAudit({
    isOwned: file => strict.ownership.fileFor(file) !== undefined,
    rootDir,
    rootsOf: ownerRoots(strict, rootDir),
  })
  for (const file of findStylesheets(rootDir)) run.auditFile(file)
  for (const finding of run.findings)
    console.log(
      `${finding.kind} ${finding.file}:${finding.line} ${finding.message}`,
    )
  const count = kind =>
    run.findings.filter(finding => finding.kind === kind).length
  console.log(
    `css: ${run.files.size} stylesheets, ${count('violation')} violations, ${count('unverifiable')} unverifiable`,
  )
  return count('unverifiable') > 0 ? 2 : count('violation') > 0 ? 1 : 0
}

const scope = values => {
  const rootDir = path.resolve(values.root ?? process.cwd())
  if (values.baseline === undefined) {
    console.error('scope needs --baseline <trusted git ref>')
    return 2
  }
  let changes
  try {
    changes = enforcementChanges({ baseline: values.baseline, rootDir })
  } catch (error) {
    if (!(error instanceof BaselineError)) throw error
    console.error(error.message)
    return 2
  }
  const accepted = values['allow-enforcement-changes'] === true
  for (const change of changes)
    console.log(`${accepted ? 'system ' : 'problem'} ${change}`)
  console.log(
    `scope: ${changes.length} enforcement changes against ${values.baseline}`,
  )
  if (changes.length === 0) return 0
  if (accepted) {
    console.log(
      'enforcement changes accepted as a system change; review them separately from feature work',
    )
    return 0
  }
  console.log(
    'a feature change must not change enforcement inputs; rerun with --allow-enforcement-changes for a reviewed system change',
  )
  return 1
}

const receiptPath = values => {
  const rootDir = path.resolve(values.root ?? process.cwd())
  return {
    manifest: path.resolve(rootDir, values.manifest ?? 'crease.lock.json'),
    rootDir,
  }
}

/* Custom properties CreaseUI components assign at runtime (catalog.json). */
const RUNTIME_PROPERTIES = new Set(
  JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'))
    .runtimeProperties ?? [],
)

const catalog = values => {
  const { components } = JSON.parse(
    readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'),
  )
  const renderer =
    values.renderer ?? projectInfo(receiptPath(values)).renderer ?? undefined
  const listed = components.filter(
    entry => renderer === undefined || entry.renderer === renderer,
  )
  if (values.json) {
    console.log(JSON.stringify({ components: listed, renderer }, null, 2))
    return 0
  }
  let category
  for (const entry of [...listed].sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.component.localeCompare(b.component) ||
      a.renderer.localeCompare(b.renderer),
  )) {
    if (entry.category !== category) {
      category = entry.category
      console.log(`\n${category}`)
    }
    console.log(
      `  ${entry.component.padEnd(22)} ${entry.exports.slice(0, 4).join(', ')}${entry.exports.length > 4 ? ', …' : ''}${renderer === undefined ? ` [${entry.renderer}]` : ''}\n  ${''.padEnd(22)} ${entry.install}`,
    )
  }
  console.log(
    `\n${listed.length} components${renderer === undefined ? '' : ` for ${renderer}`}; \`creaseui-lint inspect --component <name>\` details one once installed`,
  )
  return 0
}

const info = values => {
  if (values.catalog) return catalog(values)
  const result = projectInfo(receiptPath(values))
  if (values.json) {
    console.log(JSON.stringify(result, null, 2))
    return result.receipt === null ? 2 : 0
  }
  for (const [name, version] of Object.entries(result.framework))
    console.log(
      `${name.padEnd(12)} ${version.installed ?? 'not installed'} (declared ${version.declared})`,
    )
  console.log(`renderer     ${result.renderer ?? 'unknown'}`)
  console.log(`policy       ${result.policy ?? 'unknown'}`)
  console.log(
    `receipt      ${result.receipt ?? 'missing; run creaseui-lint init'}`,
  )
  for (const [alias, target] of Object.entries(result.aliases))
    console.log(`alias        ${alias} -> ${target}`)
  for (const artifact of result.artifacts)
    console.log(
      `installed    ${artifact.id} (${artifact.files.join(', ')}; ${artifact.exports} exports)`,
    )
  console.log(
    'catalog      creaseui-lint info --catalog lists every installable component',
  )
  return result.receipt === null ? 2 : 0
}

const inspect = values => {
  if (values.component === undefined) {
    console.error('inspect needs --component <name>')
    return 2
  }
  const result = inspectComponent({
    component: values.component,
    ...receiptPath(values),
  })
  if (result.error !== undefined) {
    if (values.json) console.log(JSON.stringify(result, null, 2))
    else console.error(result.error)
    return 1
  }
  if (values.json) {
    console.log(JSON.stringify(result, null, 2))
    return 0
  }
  console.log(`artifact     ${result.artifact} (${result.renderer})`)
  console.log(`state        ${result.stateOwnership}`)
  if (result.program.length > 0)
    console.log(`program      ${result.program.join(', ')}`)
  console.log(`styling      ${result.stylingOwner}`)
  for (const file of result.files)
    console.log(
      `file         ${file.path} (${file.role}); imports ${file.imports.join(', ') || 'nothing'}`,
    )
  for (const record of result.exports)
    console.log(
      `export       ${record.name}: ${record.contract ?? record.renderKind}${Object.keys(record.variants).length > 0 ? ` ${JSON.stringify(record.variants)}` : ''}`,
    )
  for (const limitation of result.limitations)
    console.log(`limitation   ${limitation}`)
  return 0
}

const main = async () => {
  const [command, ...rest] = process.argv.slice(2)
  if (
    command === undefined ||
    ['help', '--help', '-h'].includes(command) ||
    rest.includes('--help') ||
    rest.includes('-h')
  ) {
    console.log(USAGE)
    return 0
  }
  const { values } = parseArgs({
    allowPositionals: false,
    args: rest,
    options: {
      'allow-enforcement-changes': { type: 'boolean' },
      catalog: { type: 'boolean' },
      baseline: { type: 'string' },
      component: { type: 'string' },
      components: { multiple: true, type: 'string' },
      json: { type: 'boolean' },
      config: { type: 'string' },
      'dry-run': { type: 'boolean' },
      manifest: { type: 'string' },
      output: { type: 'string' },
      'report-only': { type: 'boolean' },
      renderer: { type: 'string' },
      root: { type: 'string' },
    },
  })
  if (command === 'init') return init(values)
  if (command === 'doctor') return doctor(values)
  if (command === 'audit') return audit(values)
  if (command === 'css') return css(values)
  if (command === 'scope') return scope(values)
  if (command === 'info') return info(values)
  if (command === 'inspect') return inspect(values)
  console.error(USAGE)
  return 2
}

/* process.exit() truncates console.log writes still buffered to a piped
   stdout — set exitCode and let the process drain and exit naturally, with a
   short fallback in case an open handle keeps the loop alive. */
const finish = code => {
  process.exitCode = code
  setTimeout(() => process.exit(code), 100).unref()
}

main().then(
  code => finish(code),
  error => {
    console.error(
      error instanceof CreaseConfigError
        ? error.message
        : error?.code?.startsWith('ERR_PARSE_ARGS_')
          ? `${error.message}\n\n${USAGE}`
          : (error?.stack ?? String(error)),
    )
    finish(2)
  },
)
