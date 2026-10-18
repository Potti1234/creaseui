// Runs the real Crease lint over every documented bad/good case and writes
// the diagnostics the lint-rule docs pages display. `--check` fails when a
// bad case stops failing, a good case reports anything, or the generated
// file is stale.
import { execFileSync, spawnSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'

import {
  constrainedStylex,
  createStrictContext,
  pleat,
  plugin,
  stylex,
  tailwind,
} from '../packages/lint/index.js'
import { pleatPropLimits, stylexPropLimits } from '../eslint.config.js'
import { LINT_CASES } from '../src/docs/lint/cases.ts'
import { LINT_CLI_CASES } from '../src/docs/lint/cli-cases.ts'
import { LINT_RULE_GROUPS } from '../src/docs/lint/rules.ts'

const repo = fileURLToPath(new URL('..', import.meta.url))
const output = path.join(repo, 'src/docs/lint/generated-diagnostics.ts')
const fixture = path.join(repo, 'packages/lint/test/fixtures/strict-app')
const STRICT_RULES = [
  'no-raw-controls',
  'no-raw-composition',
  'no-unapproved-renderer',
  'no-application-styles',
  'component-contract',
  'no-unverifiable-ui',
]

const strictRoots = new Map()
const strictRoot = renderer => {
  const existing = strictRoots.get(renderer)
  if (existing !== undefined) return existing
  const root = mkdtempSync(path.join(tmpdir(), `crease-lint-docs-${renderer}-`))
  cpSync(fixture, root, { recursive: true })
  const lockPath = path.join(root, 'crease.lock.json')
  const lock = JSON.parse(
    readFileSync(lockPath, 'utf8').replaceAll(
      'crease/pleat-',
      `crease/${renderer}-`,
    ),
  )
  writeFileSync(lockPath, JSON.stringify({ ...lock, renderer }, null, 2))
  const context = createStrictContext({
    rootDir: root,
    renderer,
    tsconfig: './tsconfig.json',
    typeInformation: 'syntactic',
  })
  const entry = { root, context }
  strictRoots.set(renderer, entry)
  return entry
}

const parser = { parser: tseslint.parser, sourceType: 'module' }

const configFor = (setup, renderer) => {
  if (setup === 'strict') {
    const { context } = strictRoot(renderer)
    return [
      {
        files: ['**/*.ts'],
        languageOptions: parser,
        plugins: { crease: plugin },
        rules: Object.fromEntries(
          STRICT_RULES.map(rule => [`crease/${rule}`, 'error']),
        ),
        settings: { creaseui: context },
      },
    ]
  }
  const preset =
    setup === 'tailwind'
      ? tailwind({ inlineStyles: 'forbid' })
      : setup === 'stylex'
        ? stylex({ inlineStyles: 'forbid', propLimits: stylexPropLimits })
        : setup === 'constrained'
          ? constrainedStylex({ files: ['**/*.ts'] })
          : pleat({
              inlineStyles: 'forbid',
              propLimits: pleatPropLimits,
              tokenFiles: ['/foundations', '/tokens', '/theme'],
            })
  return [{ ...preset, files: ['**/*.ts'], languageOptions: parser }]
}

const lintCase = (lintCase, renderer, code) => {
  const root = lintCase.setup === 'strict' ? strictRoot(renderer).root : repo
  return new Linter({ configType: 'flat', cwd: root })
    .verify(code, configFor(lintCase.setup, renderer), {
      filename: path.join(root, lintCase.file),
    })
    .map(message => ({
      ruleId: message.ruleId ?? 'parse',
      message: message.message,
      line: message.line,
      column: message.column,
      endLine: message.endLine ?? message.line,
      endColumn: message.endColumn ?? message.column + 1,
    }))
}

const ruleIdFor = rule =>
  rule === 'no-raw-colors' || rule === 'no-arbitrary-values'
    ? `shadcn/${rule}`
    : `crease/${rule}`

const problems = []
const diagnostics = {}
for (const item of LINT_CASES) {
  for (const renderer of item.renderers) {
    const bad = lintCase(item, renderer, item.bad)
    const good = lintCase(item, renderer, item.good)
    const key = `${item.rule}/${item.id}/${renderer}`
    const expected = ruleIdFor(item.rule)
    if (
      !bad.some(m => m.ruleId === expected && m.message.includes(item.expect))
    )
      problems.push(
        `${key}: bad case does not report ${expected} containing "${item.expect}"\n${JSON.stringify(bad, null, 2)}`,
      )
    if (good.length > 0)
      problems.push(
        `${key}: good case reports\n${JSON.stringify(good, null, 2)}`,
      )
    diagnostics[key] = bad
  }
}

for (const group of LINT_RULE_GROUPS)
  for (const rule of group.rules)
    if (
      !LINT_CASES.some(item => item.rule === rule.id) &&
      !LINT_CLI_CASES.some(item => item.check === rule.id)
    )
      problems.push(`${rule.id}: no documented case`)

const bin = path.join(repo, 'packages/lint/bin/creaseui-lint.js')
const cli = (cwd, args) => {
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd,
    encoding: 'utf8',
  })
  return {
    command: `npx creaseui-lint ${args.join(' ')}`,
    exitCode: result.status ?? 1,
    lines: `${result.stdout}${result.stderr}`
      .split(cwd)
      .join('.')
      .split('\n')
      .filter(line => line !== '' && !line.startsWith('note '))
      .map(line => line.trimEnd()),
  }
}
const writeFile = (root, file) => {
  mkdirSync(path.dirname(path.join(root, file.path)), { recursive: true })
  writeFileSync(path.join(root, file.path), file.contents)
}
const cliProject = item => {
  const root = mkdtempSync(path.join(tmpdir(), 'crease-lint-docs-cli-'))
  cpSync(fixture, root, { recursive: true })
  rmSync(path.join(root, 'crease.lock.json'))
  mkdirSync(path.join(root, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    path.join(repo, 'packages/lint'),
    path.join(root, 'node_modules/@creaseui/lint'),
    'dir',
  )
  writeFileSync(
    path.join(root, 'components.json'),
    JSON.stringify({ aliases: { ui: '@/design' } }),
  )
  for (const file of item.setup) writeFile(root, file)
  const init = cli(root, ['init', '--renderer', 'pleat'])
  if (init.exitCode !== 0)
    problems.push(
      `${item.check}/${item.id}: init failed\n${init.lines.join('\n')}`,
    )
  if (item.baseline) {
    const git = (...args) =>
      execFileSync(
        'git',
        ['-c', 'user.name=docs', '-c', 'user.email=docs@example.com', ...args],
        { cwd: root },
      )
    git('init', '-q', '-b', 'main')
    git('add', '.')
    git('commit', '-q', '-m', 'baseline')
  }
  return root
}
const cliOutput = {}
for (const item of LINT_CLI_CASES) {
  const key = `${item.check}/${item.id}`
  const badRoot = cliProject(item)
  writeFile(badRoot, item.bad)
  const bad = cli(badRoot, item.command)
  const goodRoot = cliProject(item)
  writeFile(goodRoot, item.good)
  if (item.goodReinit) cli(goodRoot, ['init', '--renderer', 'pleat'])
  const good = cli(goodRoot, item.command)
  for (const root of [badRoot, goodRoot])
    rmSync(root, { force: true, recursive: true })
  if (bad.exitCode === 0 && !bad.lines.some(line => line.includes(item.expect)))
    problems.push(`${key}: bad case passed\n${bad.lines.join('\n')}`)
  else if (!bad.lines.some(line => line.includes(item.expect)))
    problems.push(
      `${key}: bad case did not report "${item.expect}"\n${bad.lines.join('\n')}`,
    )
  if (
    good.exitCode !== 0 ||
    good.lines.some(line => line.includes(item.expect))
  )
    problems.push(`${key}: good case still fails\n${good.lines.join('\n')}`)
  cliOutput[key] = { bad, good }
}

for (const { root } of strictRoots.values())
  rmSync(root, { force: true, recursive: true })

const source = `// Generated by scripts/generate-lint-docs.mjs. Do not edit.
import type { LintCliRun, LintDiagnostic } from '@/docs/lint/diagnostic'

export const LINT_DIAGNOSTICS: Readonly<
  Record<string, ReadonlyArray<LintDiagnostic>>
> = ${JSON.stringify(diagnostics, null, 2)}

export const LINT_CLI_OUTPUT: Readonly<
  Record<string, Readonly<{ bad: LintCliRun; good: LintCliRun }>>
> = ${JSON.stringify(cliOutput, null, 2)}
`

const fence = (language, code) => `\`\`\`${language}\n${code.trim()}\n\`\`\``
const markdown = `# Lint rules

Generated by \`scripts/generate-lint-docs.mjs\` from the cases the docs pages render. Every diagnostic and CLI output below comes from running the real \`@creaseui/lint\` rules; the web pages at /docs/lint render each bad and good example live.

${LINT_RULE_GROUPS.map(
  group => `## ${group.label}

${group.rules
  .map(rule => {
    const cases = LINT_CASES.filter(item => item.rule === rule.id).map(item => {
      const renderer = item.renderers[0]
      const found = diagnostics[`${item.rule}/${item.id}/${renderer}`] ?? []
      return `#### ${item.title}

${item.description}

Renderers: ${item.renderers.join(', ')}

Bad (\`${item.file}\`):

${fence('ts', item.bad)}

${found.map(entry => `- ${item.file}:${entry.line}:${entry.column} \`${entry.ruleId}\`: ${entry.message}`).join('\n')}

Good:

${fence('ts', item.good)}`
    })
    const cliCases = LINT_CLI_CASES.filter(item => item.check === rule.id).map(
      item => {
        const output = cliOutput[`${item.check}/${item.id}`]
        const run = result =>
          fence('text', `$ ${result.command}\n${result.lines.join('\n')}`)
        return `#### ${item.title}

${item.description}

Bad (\`${item.bad.path}\`):

${fence(item.bad.path.endsWith('.css') ? 'css' : 'ts', item.bad.contents)}

${run(output.bad)}

Good (\`${item.good.path}\`):

${fence(item.good.path.endsWith('.css') ? 'css' : 'ts', item.good.contents)}

${run(output.good)}`
      },
    )
    return `### ${rule.title} (\`${rule.id}\`)

${rule.summary}

${[...cases, ...cliCases].join('\n\n')}`
  })
  .join('\n\n')}`,
).join('\n\n')}
`
const markdownOutput = path.join(repo, 'docs/lint-rules.md')

const check = process.argv.includes('--check')
if (check) {
  let current = ''
  try {
    current = readFileSync(output, 'utf8')
  } catch {}
  if (current !== source)
    problems.push(
      'src/docs/lint/generated-diagnostics.ts is stale: run npm run generate:lint-docs',
    )
  let currentMarkdown = ''
  try {
    currentMarkdown = readFileSync(markdownOutput, 'utf8')
  } catch {}
  if (currentMarkdown !== markdown)
    problems.push('docs/lint-rules.md is stale: run npm run generate:lint-docs')
} else {
  writeFileSync(output, source)
  writeFileSync(markdownOutput, markdown)
}

if (problems.length > 0) {
  console.error(problems.join('\n\n'))
  process.exit(1)
}
console.log(
  `lint docs: ${Object.keys(diagnostics).length} renderer cases and ${Object.keys(cliOutput).length} CLI cases ${check ? 'verified' : 'generated'}`,
)
