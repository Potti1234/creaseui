// Generates src/pleat/tokens.ts + foundations-tokens.ts + complex-tokens.ts
// from the stylex defineVars sources. Kinds are inferred per value.
import { readFileSync, writeFileSync } from 'node:fs'

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

const parseVars = (file, constName) => {
  const src = readFileSync(file, 'utf8')
  const m = src.match(
    new RegExp(
      `export const ${constName} = stylex\\.defineVars\\(\\{([\\s\\S]*?)\\}\\)`,
    ),
  )
  if (!m) throw new Error(`no ${constName} in ${file}`)
  const body = m[1]
  const out = []
  const re =
    /^\s*(\w+):\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*,?\s*(?:\/\*[\s\S]*?\*\/)?\s*$/gm
  let mm
  // handle multi-line values joined by \n at start of next line pattern: capture via a looser split
  const entries = []
  let cur = ''
  let inStr = false
  let strCh = ''
  for (const ch of body) {
    if (inStr) {
      cur += ch
      if (ch === strCh && cur[cur.length - 2] !== '\\') inStr = false
      continue
    }
    if (ch === "'" || ch === '"') {
      inStr = true
      strCh = ch
      cur += ch
      continue
    }
    if (ch === ',') {
      entries.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  entries.push(cur)
  for (const e of entries) {
    const clean = e.replace(/\/\*[\s\S]*?\*\//g, '').trim()
    if (!clean) continue
    const kv = clean.match(/^(\w+):\s*(['"][\s\S]*['"])$/)
    if (!kv) {
      console.error('SKIP', JSON.stringify(clean.slice(0, 80)))
      continue
    }
    out.push([kv[1], kv[2].slice(1, -1)])
  }
  return out
}

const emit = (outFile, constName, entries, headerComment) => {
  const spec = entries
    .map(([k, v]) => `  ${k}: Token.${kindFor(v)}`)
    .join(',\n')
  const vals = entries
    .map(
      ([k, v]) =>
        `  ${k}: ${kindFor(v) === 'number' ? v : `'${v.replace(/'/g, "\\'")}'`}`,
    )
    .join(',\n')
  writeFileSync(
    outFile,
    `import { Global, Theme, Token } from '@pleat/core'

${headerComment}
export const ${constName}Tokens = Token.make(
  {
${spec},
  },
  { prefix: 'crease-' },
)

export const ${constName} = ${constName}Tokens

const ${constName}Theme = Theme.make(${constName}Tokens, {
${vals},
})

Global.theme(${constName}Theme)
`,
  )
  console.log(outFile, entries.length, 'tokens')
}

emit(
  'src/pleat/tokens.ts',
  'tokens',
  parseVars('src/stylex/tokens.stylex.ts', 'tokens'),
  "/** Semantic design tokens, mirrored from the app's CSS variables. */",
)
emit(
  'src/pleat/foundations-tokens.ts',
  'foundation',
  parseVars('src/stylex/foundations-tokens.stylex.ts', 'foundationTokens'),
  '/** Foundation tokens shared across primitives. */',
)
emit(
  'src/pleat/complex-tokens.ts',
  'complex',
  parseVars('src/stylex/complex-tokens.stylex.ts', 'complexTokens'),
  '/** Complex-domain tokens (sidebar, charts, overlays). */',
)
emit(
  'src/pleat/board-tokens.ts',
  'board',
  parseVars('src/demo/board-stylex-tokens.stylex.ts', 'boardTokens'),
  '/** Board demo tokens. */',
)
