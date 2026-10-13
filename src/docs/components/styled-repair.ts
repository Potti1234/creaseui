/*
 * Post-pass over emitted documentation programs.
 *
 * The shared emitters render styled example programs for both the StyleX and
 * Pleat renderers. A few emit paths reference `className(...)` or `styles.*`
 * without emitting the matching import or `const styles` declaration for the
 * specific fixture branch, and Pleat example programs that keep
 * `layoutStyle: styles.X` need the branded contract cast. This repair applies
 * the missing pieces to the finished program text so every emitted program
 * typechecks against the real APIs.
 */

const SHELL_DECLARATIONS = `{
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
    }`

const SHELL_PLAIN_DECLARATIONS = `{
      marginInline: 'auto',
      maxWidth: '28rem',
      padding: '2rem',
    }`

const SHELL_ENTRIES: Record<string, string> = {
  shell: SHELL_DECLARATIONS,
  shellPlain: SHELL_PLAIN_DECLARATIONS,
  page: SHELL_PLAIN_DECLARATIONS,
}

const addImport = (code: string, importLine: string): string => {
  const imports = [...code.matchAll(/^import .*$/gm)]
  const last = imports.at(-1)
  if (last === undefined) {
    return `${importLine}\n\n${code}`
  }
  const at = last.index! + last[0].length
  return `${code.slice(0, at)}\n${importLine}${code.slice(at)}`
}

export const repairStyled = (
  code: string,
  base: 'stylex' | 'pleat',
): string => {
  let out = code
  const baseModule = base === 'pleat' ? '@/pleat' : '@/stylex'

  if (/\bclassName\(/.test(out) && !/import\s*\{[^}]*\bclassName\b/.test(out)) {
    out = addImport(out, `import { className } from '${baseModule}/style'`)
  }

  if (
    /\bstylex\.(props|create|defineVars|createTheme)\(/.test(out) &&
    !/import \* as stylex/.test(out)
  ) {
    out = addImport(out, "import * as stylex from '@stylexjs/stylex'")
  }

  const styleRefs = new Set(
    [...out.matchAll(/\bstyles\.(\w+)/g)].map(match => match[1]!),
  )
  if (styleRefs.size > 0) {
    if (/const styles\s*=/.test(out)) {
      for (const name of styleRefs) {
        const declaration = SHELL_ENTRIES[name]
        if (declaration === undefined) continue
        if (new RegExp(`\\b${name}\\s*:`).test(out)) continue
        out = out.replace(
          /(const styles\s*=\s*)(stylex\.create\(\{|\{)/,
          (_all, head, open) =>
            `${head}${open}\n    ${name}: ${base === 'pleat' ? `Style.make(${declaration})` : declaration},`,
        )
      }
    } else {
      const entry = (name: string): string =>
        base === 'pleat'
          ? `${name}: Style.make(${SHELL_ENTRIES[name]})`
          : `${name}: ${SHELL_ENTRIES[name]}`
      const emitted = [...styleRefs].filter(name => name in SHELL_ENTRIES)
      if (emitted.length > 0) {
        const body =
          base === 'pleat'
            ? `{ ${emitted.map(entry).join(', ')} }`
            : `stylex.create({ ${emitted.map(entry).join(', ')} })`
        if (base === 'pleat' && !/\bStyle\b/.test(out)) {
          out = addImport(out, "import { Style } from '@pleat/core'")
        }
        if (
          base === 'stylex' &&
          !/import \* as stylex/.test(out) &&
          !/from '@stylexjs\/stylex'/.test(out)
        ) {
          out = addImport(out, "import * as stylex from '@stylexjs/stylex'")
        }
        out = `${out}\n\nconst styles = ${body}`
      }
    }
  }

  if (
    base === 'pleat' &&
    /Style\.make\(/.test(out) &&
    !/\bStyle\b/.test(out.replaceAll('Style.make', ''))
  ) {
    out = addImport(out, "import { Style } from '@pleat/core'")
  }

  if (base === 'pleat') {
    out = out.replace(
      /(\w*[Ll]ayoutStyle):\s*(styles(?:\.\w+|\[[^\]]+\]))(?!\w)(?!\s+as\s+ComponentLayoutStyle)/g,
      '$1: $2 as ComponentLayoutStyle',
    )
    if (
      /as ComponentLayoutStyle/.test(out) &&
      !/\bComponentLayoutStyle\b/.test(
        out.slice(0, out.indexOf('as ComponentLayoutStyle')),
      )
    ) {
      out = addImport(
        out,
        "import type { ComponentLayoutStyle } from '@/pleat/contracts'",
      )
    }
  }

  if (
    base === 'stylex' &&
    /as ComponentLayoutStyle/.test(out) &&
    !/\bComponentLayoutStyle\b/.test(
      out.slice(0, out.indexOf('as ComponentLayoutStyle')),
    )
  ) {
    out = addImport(
      out,
      "import type { ComponentLayoutStyle } from '@/stylex/contracts'",
    )
  }

  return out
}
