import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/* `crease-theme` writes Tailwind `@theme`/`cssVars`, which projects without
   Tailwind (StyleX, Pleat) cannot use. `crease-theme-css` ships the same roles
   as a plain stylesheet: the shared theme, the `--color-*`/`--radius-*`/font
   aliases the components read, and the document base layer. */

const root = new URL('..', import.meta.url).pathname
const theme = readFileSync(join(root, 'src/theme.css'), 'utf8').trimEnd()
const styles = readFileSync(join(root, 'src/styles.css'), 'utf8')
const inline = styles.match(/@theme inline \{\n([\s\S]*?)\n\}/u)?.[1]
if (inline === undefined)
  throw new Error('src/styles.css has no @theme inline block')
const aliases = inline
  .split('\n')
  .filter(line => /^ {2}--(?:color|radius|font)-/u.test(line))

const css = `${theme}

/* Aliases are re-declared in every scope so they follow the nearest one. */
:root,
.light,
.dark {
${aliases.join('\n')}
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}

@layer base {
  * {
    border-color: var(--color-border);
    outline-color: color-mix(in oklab, var(--color-ring) 50%, transparent);
  }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
}
`

writeFileSync(join(root, 'registry/theme/crease-theme.css'), css)
