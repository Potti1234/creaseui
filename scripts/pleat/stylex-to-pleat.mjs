#!/usr/bin/env node
/**
 * stylex → pleat codemod.
 * Ports src/stylex/*.stylex.ts to src/pleat/*.ts (and other roots given via argv).
 * Emits a MANUAL report for anything it could not transform mechanically.
 */
import ts from 'typescript'
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { join, dirname, basename, relative } from 'node:path'
import { execSync } from 'node:child_process'

const manual = []
const condFallbacks = new Map()

// ---------- condition mapping ----------

const EXACT = {
  ':hover': 'When.hover',
  ':focus': 'When.focus',
  ':focus-visible': 'When.focusVisible',
  ':focus-within': 'When.focusWithin',
  ':active': 'When.active',
  ':disabled': 'When.disabled',
  ':checked': 'When.checked',
  ':indeterminate': 'When.indeterminate',
  ':first-child': 'When.firstChild',
  ':last-child': 'When.lastChild',
  ':nth-child(odd)': 'When.odd',
  ':nth-child(even)': 'When.even',
  ':empty': 'When.empty',
  ':placeholder-shown': 'When.placeholderShown',
  '::before': 'When.before',
  '::after': 'When.after',
  '::placeholder': 'When.placeholder',
  '::selection': 'When.selection',
  '::backdrop': 'When.backdrop',
  '@media (prefers-reduced-motion: reduce)': 'When.reducedMotion',
  '@media (prefers-reduced-motion: no-preference)': 'When.motionSafe',
  '@media (prefers-color-scheme: dark)': 'When.dark',
  '@media (prefers-color-scheme: light)': 'When.light',
  '@media (prefers-contrast: more)': 'When.moreContrast',
  '@media (hover: hover)': 'When.canHover',
  '@media print': 'When.print',
  '@starting-style': 'When.startingStyle',
  default: null,
}

const sq = s => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const UNWRAP = /^:(?:is|where)\((.+)\)$/

function condFor(key, file) {
  if (key in EXACT) return EXACT[key]
  let k = key.trim()

  // media / supports / container
  const m = k.match(/^@media\s+(.+)$/s)
  if (m) {
    const q = m[1].trim()
    const minW = q.match(/^\(min-width:\s*(.+)\)$/)
    if (minW) return `When.minWidth(${sq(minW[1].trim())})`
    const maxW = q.match(/^\(max-width:\s*(.+)\)$/)
    if (maxW) return `When.maxWidth(${sq(maxW[1].trim())})`
    return `When.media(${sq(q)})`
  }
  const sup = k.match(/^@supports\s+(.+)$/s)
  if (sup) return `When.supports(${sq(sup[1].trim())})`
  const cont = k.match(/^@container(?:\s+([\w-]+))?\s*(\([\s\S]+\))$/)
  if (cont)
    return `When.container(${sq(cont[2].trim())}${cont[1] ? `, ${sq(cont[1])}` : ''})`

  // unwrap :is(...) / :where(...) around a single attribute selector
  const unwrap = k.match(UNWRAP)
  const inner = unwrap ? unwrap[1].trim() : k

  // :has(X) / :not(X) with an inner attribute or state selector
  const hasM = inner.match(/^:has\((.+)\)$/s)
  if (hasM) return `When.has(${condFor(hasM[1].trim(), file)})`
  const notM = inner.match(/^:not\((.+)\)$/s)
  if (notM) return `When.not(${condFor(notM[1].trim(), file)})`

  // [data-x], [data-x="v"], [data-x=v]
  const dm = inner.match(
    /^\[data-([\w-]+)(?:[~|^$*]?=["']?([^"'\]]*)["']?)?\]$/,
  )
  if (dm) {
    if (dm[2] === undefined) return `When.data(${sq(dm[1])})`
    if (inner.includes('~=')) return `When.pseudo(${sq(k)})`
    return `When.data(${sq(dm[1])}, ${sq(dm[2])})`
  }
  const am = inner.match(/^\[aria-([\w-]+)(?:=["']([^"']*)["'])?\]$/)
  if (am) {
    if (am[2] === undefined) return `When.pseudo(${sq(k)})`
    return `When.aria(${sq(am[1])}, ${sq(am[2])})`
  }
  // pure attribute like [hidden], [open], [dir="rtl"], [inert]
  if (/^\[[\w-]+(=["'][^\]]*["'])?\]$/.test(inner))
    return `When.pseudo(${sq(k)})`

  // anything else: complex selector on the element (combinators OK inside parens)
  condFallbacks.set(k, (condFallbacks.get(k) ?? 0) + 1)
  return k.startsWith(':')
    ? `When.pseudo(${sq(k)})`
    : `When.pseudo(${sq(`:is(${k})`)})`
}

// ---------- style building ----------

const isCondKey = k => k === 'default' || /^[:@[]/.test(k) || k.startsWith('[')

function isComputedWhenKey(name) {
  return name.startsWith('[') // [stylex.when.ancestor(...)]
}

function* eachProp(objLit) {
  for (const p of objLit.properties) {
    if (ts.isPropertyAssignment(p)) yield p
    else if (ts.isSpreadAssignment(p)) yield p
  }
}

function propKey(node, sf) {
  const n = node.name
  if (!n) return null
  if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n))
    return n.text
  if (ts.isComputedPropertyName(n)) return n.getText(sf) // [stylex.when.ancestor(...)]
  return n.getText(sf)
}

/** Parse "[stylex.when.ancestor('sel', marker)]" / siblingAfter from computed key text. */
function parseWhenCall(text) {
  const m = text.match(
    /^\[\s*stylex\.when\.(ancestor|siblingAfter|descendant|parentBefore|parentAfter)\(\s*(['"`])((?:\\.|(?!\2)[\s\S])*)\2\s*(?:,\s*([\s\S]*?)\s*)?\)\s*\]$/,
  )
  if (!m) return null
  return {
    kind: m[1],
    sel: m[3],
    marker: (m[4] ?? '').trim().replace(/,$/, ''),
  }
}

/**
 * Render a stylex decls object into { base: [[k,v]], whens: [[condText, [[k,v]]]] }
 * `whens` preserves first-appearance order; same condition merges into one decl map.
 */
function renderDecls(objLit, sf, file) {
  const base = []
  const whens = []
  const whenIndex = new Map()
  const addWhen = (condText, k, vText) => {
    let idx = whenIndex.get(condText)
    if (idx === undefined) {
      idx = whens.length
      whens.push([condText, []])
      whenIndex.set(condText, idx)
    }
    whens[idx][1].push([k, vText])
  }

  for (const p of eachProp(objLit)) {
    if (ts.isSpreadAssignment(p)) {
      manual.push(`${file}: spread in decls ${p.getText(sf).slice(0, 60)}`)
      continue
    }
    const key = propKey(p, sf)
    if (key === null) {
      manual.push(`${file}: weird key ${p.getText(sf).slice(0, 60)}`)
      continue
    }
    const init = p.initializer

    // computed [stylex.when.*] key → decls-object value
    if (typeof key === 'string' && isComputedWhenKey(key)) {
      const wc = parseWhenCall(key)
      if (!wc || !ts.isObjectLiteralExpression(init)) {
        manual.push(`${file}: bad when-key ${key.slice(0, 80)}`)
        continue
      }
      const inner = renderDecls(init, sf, file)
      const sel = condFor(wc.sel, file)
      const rel =
        wc.kind === 'ancestor' || wc.kind === 'descendant'
          ? wc.marker
            ? `When.within(${wc.marker}, ${sel})`
            : `When.within(${sel})`
          : wc.marker
            ? `When.precededBy(${wc.marker}, ${sel})`
            : `When.precededBy(${sel})`
      for (const [k, v] of inner.base) addWhen(rel, k, v)
      for (const [c2, d2] of inner.whens)
        for (const [k, v] of d2) addWhen(`When.all(${rel}, ${c2})`, k, v)
      continue
    }

    // selector / at-rule key at decls level → decls-object value
    if (typeof key === 'string' && /^[:@[]/.test(key) && key !== 'default') {
      if (!ts.isObjectLiteralExpression(init)) {
        manual.push(`${file}: cond key ${key} has non-object value`)
        continue
      }
      const cond = condFor(key, file)
      if (cond === null) {
        manual.push(`${file}: 'default' as decls key`)
        continue
      }
      const inner = renderDecls(init, sf, file)
      for (const [k, v] of inner.base) addWhen(cond, k, v)
      for (const [c2, d2] of inner.whens)
        for (const [k, v] of d2) addWhen(`When.all(${cond}, ${c2})`, k, v)
      continue
    }

    // property
    if (ts.isObjectLiteralExpression(init)) {
      const keys = [...eachProp(init)].map(q => propKey(q, sf))
      if (keys.every(k => k !== null && isCondKey(k))) {
        // conditional value {default: X, ':hover': Y, cond: {default|cond: ...}}
        const flattenCond = (condText, propName, node) => {
          if (
            ts.isObjectLiteralExpression(node) &&
            [...eachProp(node)]
              .map(q => propKey(q, sf))
              .every(k => k !== null && isCondKey(k))
          ) {
            for (const q of eachProp(node)) {
              const k3 = propKey(q, sf)
              if (k3 === 'default') {
                if (!isNullish(q.initializer.getText(sf)))
                  addWhen(condText, propName, q.initializer.getText(sf))
                continue
              }
              const rel3 = parseWhenCall(k3)
              const c3 = rel3
                ? rel3.kind === 'ancestor' || rel3.kind === 'descendant'
                  ? rel3.marker
                    ? `When.within(${rel3.marker}, ${condFor(rel3.sel, file)})`
                    : `When.within(${condFor(rel3.sel, file)})`
                  : rel3.marker
                    ? `When.precededBy(${rel3.marker}, ${condFor(rel3.sel, file)})`
                    : `When.precededBy(${condFor(rel3.sel, file)})`
                : condFor(k3, file)
              if (c3 === null) continue
              flattenCond(
                `When.all(${condText}, ${c3})`,
                propName,
                q.initializer,
              )
            }
            return
          }
          if (!isNullish(node.getText(sf)))
            addWhen(condText, propName, node.getText(sf))
        }
        for (const q of eachProp(init)) {
          const k2 = propKey(q, sf)
          if (k2 === 'default') {
            if (!isNullish(q.initializer.getText(sf)))
              base.push([key, q.initializer.getText(sf)])
            continue
          }
          const rel = parseWhenCall(k2)
          const cond = rel
            ? rel.kind === 'ancestor' || rel.kind === 'descendant'
              ? rel.marker
                ? `When.within(${rel.marker}, ${condFor(rel.sel, file)})`
                : `When.within(${condFor(rel.sel, file)})`
              : rel.marker
                ? `When.precededBy(${rel.marker}, ${condFor(rel.sel, file)})`
                : `When.precededBy(${condFor(rel.sel, file)})`
            : condFor(k2, file)
          if (cond === null) continue
          flattenCond(cond, key, q.initializer)
        }
        continue
      }
      manual.push(
        `${file}: object value on ${key}: ${init.getText(sf).slice(0, 60)}`,
      )
      continue
    }
    if (!isNullish(init.getText(sf))) base.push([key, init.getText(sf)])
  }
  return { base, whens }
}

const isNullish = t => t === 'null' || t === 'undefined'
const unquote = s => s.replace(/^['"]|['"]$/g, '')
const COLOR =
  /^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6,8})|(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|var)\([^;{}<>!]*\)|[a-zA-Z]+)$/
const LENGTH =
  /^(0|-?\d*\.?\d+(px|rem|em|%|vh|vw|vmin|vmax|svh|lvh|dvh|ch|ex|lh|cqi|cqb)|(calc|clamp|min|max|var)\([^;{}<>!]*\))$/
const DURATION = /^\d*\.?\d+(ms|s)$/
const NUMBER = /^-?\d*\.?\d+$/
const kindFor = v =>
  COLOR.test(v)
    ? 'color'
    : LENGTH.test(v)
      ? 'length'
      : DURATION.test(v)
        ? 'duration'
        : NUMBER.test(v)
          ? 'number'
          : 'value'

const quoteKey = k =>
  /^[A-Za-z_$][\w$]*$/.test(k) || /^\d+(\.\d+)?$/.test(k) ? k : sq(k)
const declObj = decls =>
  `{${decls.map(([k, v]) => `${quoteKey(k)}: ${v}`).join(', ')}}`

function styleExpr(declObjLit, sf, file) {
  const { base, whens } = renderDecls(declObjLit, sf, file)
  const makeExpr =
    base.length === 0 ? 'Style.empty' : `Style.make(${declObj(base)})`
  if (whens.length === 0) return makeExpr
  const pipes = whens
    .map(([c, d]) => `Style.when(${c}, ${declObj(d)})`)
    .join(',\n    ')
  return `${makeExpr}.pipe(\n    ${pipes},\n  )`
}

const kebab = s =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()

// ---------- file transform ----------

function transformFile(src, file, job) {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true)
  const edits = []
  const createSpans = []
  const needs = {
    Style: false,
    When: false,
    Global: false,
    Token: false,
    Theme: false,
  }

  const visit = node => {
    // stylex.create(obj)
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.expression.getText(sf) === 'stylex'
    ) {
      const fn = node.expression.name.text
      if (fn === 'create') {
        const arg = node.arguments[0]
        if (!ts.isObjectLiteralExpression(arg)) {
          manual.push(`${file}: stylex.create non-object arg`)
        } else {
          const entries = [...eachProp(arg)].map(p => {
            if (ts.isSpreadAssignment(p)) {
              manual.push(`${file}: spread in stylex.create`)
              return `...${p.expression.getText(sf)}`
            }
            const k = propKey(p, sf)
            const v = p.initializer
            if (!ts.isObjectLiteralExpression(v)) {
              manual.push(`${file}: stylex.create value not object: ${k}`)
              return `${quoteKey(k)}: ${v.getText(sf)}`
            }
            needs.Style = true
            return `${quoteKey(k)}: ${styleExpr(v, sf, file)}`
          })
          createSpans.push([node.getStart(sf), node.getEnd()])
          edits.push({
            start: node.getStart(sf),
            end: node.getEnd(),
            text: `{\n${entries.join(',\n')},\n}`,
          })
        }
        needs.Style = true
        ts.forEachChild(node, visit)
        return
      } else if (
        createSpans.some(([s, e]) => node.getStart(sf) > s && node.getEnd() < e)
      ) {
        // nested stylex.* calls inside a stylex.create arg are handled by post-pass
        ts.forEachChild(node, visit)
        return
      } else if (fn === 'defineMarker') {
        // name from the variable declaration
        let name = 'marker'
        if (
          ts.isVariableDeclaration(node.parent) &&
          ts.isIdentifier(node.parent.name)
        )
          name = node.parent.name.text
        needs.When = true
        edits.push({
          start: node.getStart(sf),
          end: node.getEnd(),
          text: `When.marker(${sq(kebab(name))})`,
        })
      } else if (fn === 'keyframes') {
        let name = 'frames'
        if (
          ts.isVariableDeclaration(node.parent) &&
          ts.isIdentifier(node.parent.name)
        )
          name = node.parent.name.text
        needs.Global = true
        edits.push({
          start: node.getStart(sf),
          end: node.getEnd(),
          text: `Global.keyframes(${sq(kebab(basename(file).replace(/\.ts$/, '')) + '-' + kebab(name))}, ${node.arguments[0].getText(sf)})`,
        })
      } else if (fn === 'defineVars') {
        const arg = node.arguments[0]
        if (
          !ts.isObjectLiteralExpression(arg) ||
          !ts.isVariableDeclaration(node.parent) ||
          !ts.isIdentifier(node.parent.name)
        ) {
          manual.push(`${file}: odd defineVars shape`)
        } else {
          const name = node.parent.name.text
          const entries = [...eachProp(arg)].map(p => {
            const k = propKey(p, sf)
            const v = p.initializer.getText(sf)
            return [k, v, kindFor(unquote(v))]
          })
          needs.Token = true
          needs.Theme = true
          needs.Global = true
          const spec = entries
            .map(([k, , kind]) => `${quoteKey(k)}: Token.${kind}`)
            .join(', ')
          const vals = entries
            .map(
              ([k, v, kind]) =>
                `${quoteKey(k)}: ${kind === 'number' ? unquote(v) : v}`,
            )
            .join(', ')
          edits.push({
            start: node.getStart(sf),
            end: node.getEnd(),
            text:
              `(() => {\n` +
              `const spec = Token.make({${spec}}, { prefix: 'crease-' })\n` +
              `Global.theme(Theme.make(spec, {${vals}}))\n` +
              `return spec\n` +
              `})()`,
          })
        }
      } else if (fn === 'defineConsts') {
        edits.push({
          start: node.getStart(sf),
          end: node.getEnd(),
          text: `${node.arguments[0].getText(sf)} as const`,
        })
      } else if (['createTheme', 'types'].includes(fn)) {
        manual.push(`${file}: stylex.${fn} — handle by hand`)
      }
      // stylex.props handled by the post-pass text replace
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  // apply edits right-to-left
  edits.sort((a, b) => b.start - a.start)
  let out = src
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end)

  // import rewriting
  out = out.replace(
    /import\s+\*\s+as\s+stylex\s+from\s+'@stylexjs\/stylex'\s*\n?/,
    '',
  )
  out = out.replace(
    /import\s+type\s*\{[^}]*\}\s*from\s+'@stylexjs\/stylex'\s*\n?/,
    m => {
      manual.push(`${file}: type import from stylex: ${m.trim().slice(0, 80)}`)
      return ''
    },
  )
  out = out.replace(/\.stylex\.const'/g, "'")
  for (const [re, repl] of job?.importMap ?? []) {
    out = out.replace(new RegExp(re, 'g'), repl)
  }
  const importSuffix = job?.importSuffix ?? (job?.suffix ? '.pleat' : '')
  out = out.replace(/\.stylex'/g, importSuffix + "'")
  // sibling token file names keep same stems in pleat dir
  out = out.replace(/'\.\/tokens'/g, "'./tokens'")
  out = out.replace(/(['"])((?:\.\.\/)+)stylex\//g, '$1$2pleat/')
  out = out.replace(/(['"])@\/stylex\//g, '$1@/pleat/')

  // stylex.props(x).className ?? '' / stylex.props(x) → className(x)
  const PROPS_ARG = '((?:[^()]|\\([^()]*\\))*)'
  out = out.replace(
    new RegExp(
      `stylex\\.props\\(${PROPS_ARG}\\)\\.className\\s*\\?\\?\\s*''`,
      'g',
    ),
    'className($1)',
  )
  out = out.replace(
    new RegExp(`stylex\\.props\\(${PROPS_ARG}\\)\\.className\\b`, 'g'),
    'className($1)',
  )
  out = out.replace(
    new RegExp(`stylex\\.props\\(${PROPS_ARG}\\)`, 'g'),
    'className($1)',
  )

  // keyframes calls nested inside stylex.create args survived the outer rewrite
  let kf = 0
  out = out.replace(
    /stylex\.keyframes\(/g,
    () =>
      `Global.keyframes(${sq(kebab(basename(file).replace(/\.ts$/, '')) + '-kf' + ++kf)}, `,
  )
  needs.Global = needs.Global || kf > 0

  // StaticStyles → Style.Style in annotations
  out = out.replace(/\bStaticStyles(?:<[^>]*>)?/g, 'Style.Style')
  out = out.replace(/\bstylex\.Style(?:<[^>]*>)?/g, 'Style.Style')
  out = out.replace(/\bStyleXStyles(?:<[^>]*>)?/g, 'Style.Style')
  out = out.replace(/\bStyle\.Style\.Style\b/g, 'Style.Style')
  out = out.replace(/typeof\s+stylex\.defineMarker/g, 'typeof When.marker')
  out = out.replace(
    /\bstylex\.defaultMarker\(\)/g,
    "When.marker('default-marker')",
  )
  needs.Style = needs.Style || /Style\.[A-Za-z]/.test(out)
  needs.When = needs.When || /When\.[A-Za-z]/.test(out)
  needs.Global = needs.Global || /Global\.[A-Za-z]/.test(out)
  needs.Token = needs.Token || /Token\.[A-Za-z]/.test(out)
  needs.Theme = needs.Theme || /Theme\.[A-Za-z]/.test(out)

  // files that gained className() calls need the adapter import
  const needsClassName =
    /\bclassName\(/.test(out) &&
    !/import\s*\{[^}]*\bclassName\b[^}]*\}\s*from/.test(out)

  const used = []
  if (needs.Style) used.push('Style')
  if (needs.When) used.push('When')
  if (needs.Global) used.push('Global')
  if (needs.Token) used.push('Token')
  if (needs.Theme) used.push('Theme')
  let header = ''
  if (used.length)
    header += `import { ${used.join(', ')} } from '@pleat/core'\n`
  if (needsClassName) header += `import { className } from '@/pleat/style'\n`
  // ensure pleat imports come first
  out = header + out.replace(/^\n+/, '')

  // report any leftover stylex refs
  const leftover = out.match(/stylex\.\w+/g)
  if (leftover)
    manual.push(
      `${file}: leftover stylex refs: ${[...new Set(leftover)].join(', ')}`,
    )
  return out
}

// ---------- driver ----------

const jobs = JSON.parse(
  readFileSync(process.argv[2] ?? 'scripts/pleat/jobs.json', 'utf8'),
)
for (const job of jobs) {
  const depth = job.depth ?? 99
  const suffix = job.suffix ?? '.ts'
  const pattern =
    job.pattern ?? `-name '*.stylex.ts' -o -name '*.stylex.const.ts'`
  const files = execSync(
    `find ${job.from} -maxdepth ${depth} \\( ${pattern} \\) | sort`,
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .filter(Boolean)
  const excluded = new Set(job.exclude ?? [])
  for (const f of files) {
    if (excluded.has(basename(f)) || (job.skip && new RegExp(job.skip).test(f)))
      continue
    const nameMap = job.nameMap ?? {}
    const rel0 = relative(job.from, f)
    const rel = nameMap[basename(f)]
      ? join(dirname(rel0), nameMap[basename(f)])
      : rel0
          .replace(/\.stylex\.const\.ts$/, '.const.ts')
          .replace(/\.stylex\.ts$/, suffix)
          .replace(/-stylex\.ts$/, '-pleat.ts')
    const dest = join(
      job.to,
      job.rename ? rel.replace(/stylex\.ts$/, 'pleat.ts') : rel,
    )
    const src = readFileSync(f, 'utf8')
    try {
      const out = transformFile(src, f, job)
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, out)
    } catch (e) {
      manual.push(`${f}: THREW ${e.message}`)
    }
  }
  console.log(`${job.from} -> ${job.to}: ${files.length} files`)
}
console.log('\n=== MANUAL ===')
manual.forEach(m => console.log(m))
console.log('\n=== cond fallback (pseudo) ===')
;[...condFallbacks.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, c]) => console.log(`${c}x ${k}`))
