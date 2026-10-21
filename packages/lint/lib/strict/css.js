import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import postcss from 'postcss'

/* Authored CSS policy. Global stylesheets may import frameworks and fonts,
   define and bind semantic tokens and carry a narrow base/reset; component
   appearance belongs to component source. Anything the parser cannot place is
   reported as unverifiable, never accepted. */

const THEME_TOKEN =
  /^(?::root|html|\.light|\.dark|\.theme-[\w-]+|\[data-theme(?:[~|^$*]?=(?:'[^']*'|"[^"]*"|[\w-]+))?\])$/u
const BASE_TOKEN =
  /^(?:\*|html|body|#root|#app|::?before|::?after|::selection|::backdrop|::placeholder|::file-selector-button)$/u
const ELEMENT_TOKEN = /^[a-z][a-z0-9]*$/u
const PSEUDO_ELEMENT = /^::?(?:before|after|placeholder|selection|backdrop)$/u

const THEME_PROPERTIES = new Set([
  'background',
  'background-color',
  'color',
  'color-scheme',
])
const BASE_PROPERTIES = new Set([
  '-moz-osx-font-smoothing',
  '-webkit-font-smoothing',
  '-webkit-tap-highlight-color',
  '-webkit-text-size-adjust',
  'accent-color',
  'background',
  'background-color',
  'border-color',
  'box-sizing',
  'caret-color',
  'color',
  'color-scheme',
  'font-family',
  'font-feature-settings',
  'font-size',
  'font-synthesis',
  'font-variation-settings',
  'font-weight',
  'height',
  'letter-spacing',
  'line-height',
  'margin',
  'min-height',
  'min-width',
  'outline-color',
  'padding',
  'scroll-behavior',
  'tab-size',
  'text-rendering',
  'text-size-adjust',
  'width',
])
/* Base rules may set these only to tokens, resets and full-size keywords:
   `* { padding: 64px; background: hotpink }` is component styling. */
const BASE_PAINT =
  /^(?:accent-color|background(?:-color)?|border-color|caret-color|color|outline-color)$/u
const BASE_LENGTH =
  /^(?:font-size|height|letter-spacing|line-height|margin|min-height|min-width|padding|width)$/u
const BASE_LENGTH_VALUES = new Set([
  'auto',
  'normal',
  '100%',
  '100vh',
  '100dvh',
  '100svh',
  '100lvh',
  'fit-content',
  'min-content',
  'max-content',
])
const tokenValue = value =>
  /^(?:var\(--[\w-]+(?:\s*,[^)]*)?\)\s*)+$/u.test(value)
const baseValueAllowed = (property, raw) => {
  const value = raw.trim().toLowerCase()
  if (RESET_VALUES.has(value)) return true
  if (!BASE_PAINT.test(property) && tokenValue(value)) return true
  /* color-mix(in oklab, var(--ring) 50%, transparent): every word must be a
     token, a mix keyword or a percentage, so named colours fail. */
  if (BASE_PAINT.test(property))
    return (
      value.includes('var(--') &&
      value
        .split(/[\s,()]+/u)
        .filter(word => word !== '')
        .every(
          word => PAINT_WORDS.has(word) || /^--[\w-]+$|^[\d.]+%$/u.test(word),
        )
    )
  if (BASE_LENGTH.test(property))
    return BASE_LENGTH_VALUES.has(value) || /^[\d.]+$/u.test(value)
      ? property === 'line-height' || BASE_LENGTH_VALUES.has(value)
      : false
  return true
}
const PAINT_WORDS = new Set([
  'var',
  'color-mix',
  'in',
  'srgb',
  'srgb-linear',
  'display-p3',
  'oklab',
  'oklch',
  'lab',
  'lch',
  'hsl',
  'hwb',
  'xyz',
  'xyz-d50',
  'xyz-d65',
  'shorter',
  'longer',
  'increasing',
  'decreasing',
  'hue',
  'transparent',
  'currentcolor',
])
/* Utilities a base/theme rule may @apply: a colour utility naming a theme
   colour role (`bg-background`, `outline-ring/50`), the theme font families
   and font smoothing. The role must be one the theme defines; a colour
   prefix followed by any other word (`text-shadow-lg`, `bg-cover`) is a
   different styling family and fails. */
const BASE_APPLY_FIXED = new Set([
  'font-sans',
  'font-serif',
  'font-mono',
  'antialiased',
  'subpixel-antialiased',
])
const COLOR_UTILITY =
  /^(?:bg|text|border|outline|ring-offset|ring|fill|stroke|accent|caret|decoration|placeholder|divide)-([a-z][a-z0-9-]*?)(?:\/\d+)?$/u
/* The roles every Crease theme defines; a project's own `@theme` adds its
   custom roles through `--color-<role>`. */
const DEFAULT_COLOR_ROLES = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
]
const THEME_COLOR = /--color-([a-z][a-z0-9-]*)\s*:/gu
/** `--color-<role>` names declared in a stylesheet's `@theme` blocks. */
const themeColorRoles = root => {
  const roles = []
  root.walkAtRules(/^theme$/iu, rule =>
    rule.walkDecls(/^--color-/u, decl =>
      roles.push(decl.prop.slice('--color-'.length)),
    ),
  )
  return roles
}
const RESET_PROPERTIES =
  /^(?:font(?:-[a-z-]+)?|letter-spacing|line-height|color|margin(?:-[a-z]+)?|padding(?:-[a-z]+)?|border|background(?:-color)?|appearance|-webkit-appearance|text-transform)$/u
const RESET_VALUES = new Set([
  '0',
  'inherit',
  'initial',
  'none',
  'transparent',
  'unset',
  'currentcolor',
])
const CONTAINER_AT_RULES = new Set([
  'container',
  'layer',
  'media',
  'scope',
  'starting-style',
  'supports',
  'variant',
])
const DEFINITION_AT_RULES = new Set([
  'charset',
  'config',
  'counter-style',
  'custom-variant',
  'font-face',
  'font-feature-values',
  'keyframes',
  'namespace',
  'page',
  'plugin',
  'property',
  'reference',
  'source',
  'tailwind',
])

/* Splits on `separator` outside brackets, parentheses and quotes. */
const splitTopLevel = (text, isSeparator) => {
  const parts = []
  let depth = 0
  let quote = null
  let current = ''
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quote !== null) {
      if (character === quote) quote = null
      current += character
      continue
    }
    if (character === '"' || character === "'") quote = character
    else if (character === '(' || character === '[') depth += 1
    else if (character === ')' || character === ']') depth -= 1
    else if (depth === 0 && isSeparator(character, text, index)) {
      parts.push(current)
      current = ''
      continue
    }
    current += character
  }
  parts.push(current)
  return parts.map(part => part.trim()).filter(part => part !== '')
}

const TOKEN =
  /::?[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?|\.[\w-]+|#[\w-]+|\[[^\]]*\]|\*|[a-zA-Z][\w-]*/uy

const tokensOf = compound => {
  const tokens = []
  TOKEN.lastIndex = 0
  while (TOKEN.lastIndex < compound.length) {
    const start = TOKEN.lastIndex
    const match = TOKEN.exec(compound)
    if (match === null || TOKEN.lastIndex === start) return null
    tokens.push(match[0])
  }
  return tokens
}

const RANK = { theme: 0, base: 1, element: 2, component: 3 }

/* theme | base | element | component, or null when it cannot be parsed. */
export const classifySelector = selector => {
  if (/:global\b/u.test(selector)) return 'component'
  const compounds = splitTopLevel(selector, character =>
    /[\s>+~]/u.test(character),
  ).filter(part => !/^[>+~]$/u.test(part))
  let kind = 'theme'
  for (const compound of compounds) {
    const tokens = tokensOf(compound)
    if (tokens === null || tokens.length === 0) return null
    for (const token of tokens) {
      const next = THEME_TOKEN.test(token)
        ? 'theme'
        : BASE_TOKEN.test(token)
          ? 'base'
          : ELEMENT_TOKEN.test(token) || PSEUDO_ELEMENT.test(token)
            ? 'element'
            : 'component'
      if (RANK[next] > RANK[kind]) kind = next
    }
  }
  return kind
}

const resolveSelectors = (selector, parents) => {
  const own = splitTopLevel(selector, character => character === ',')
  if (parents.length === 0) return own
  return parents.flatMap(parent =>
    own.map(child =>
      child.includes('&')
        ? child.replaceAll('&', parent)
        : `${parent} ${child}`,
    ),
  )
}

const importTarget = params => {
  const match = /^(?:url\(\s*)?(['"]?)([^'")\s]+)\1\s*\)?/u.exec(params.trim())
  return match === null ? null : match[2]
}

const isLocalImport = target => target.startsWith('.') || target.startsWith('/')

const ROOT_CLASS = /\.([\w-]+)/gu
const ROOT_SLOT = /\[data-slot[~|^$*]?=\s*['"]?([\w-]+)/gu

/** Classes and data-slot values in a selector's first compound. */
const rootTokens = selector => {
  const first = selector.trim().split(/\s*[\s>+~]\s*/u)[0]
  return [
    ...[...first.matchAll(ROOT_CLASS)].map(match => match[1]),
    ...[...first.matchAll(ROOT_SLOT)].map(match => match[1]),
  ]
}

/* `rootsOf(file)` returns the class and slot names the owning component
   renders (or undefined when unknown); owned CSS must start from one. */
export const createCssAudit = ({
  isOwned = () => false,
  rootDir,
  rootsOf = () => undefined,
}) => {
  const findings = []
  const keys = new Set()
  const seen = new Set()
  const display = file =>
    file.startsWith('registry:')
      ? file
      : path.relative(rootDir, file).split(path.sep).join('/')
  const add = (file, node, kind, message) => {
    const line = node?.source?.start?.line ?? 1
    const key = `${file}:${line}:${message}`
    if (keys.has(key)) return
    keys.add(key)
    findings.push({ file: display(file), kind, line, message })
  }

  /* Roles come from the defaults, every project stylesheet's @theme and
     the theme text audited so far (imports, registry items). */
  let projectRoles
  const auditedRoles = new Set()
  const colorRoles = () => {
    if (projectRoles === undefined) {
      projectRoles = new Set(DEFAULT_COLOR_ROLES)
      for (const file of rootDir === undefined ? [] : findStylesheets(rootDir))
        try {
          for (const role of themeColorRoles(
            postcss.parse(readFileSync(file, 'utf8'), { from: file }),
          ))
            projectRoles.add(role)
        } catch {
          /* unparsable files are reported when they are audited */
        }
    }
    return projectRoles
  }
  const baseApplyAllowed = token => {
    const utility = token.split(':').at(-1)
    if (BASE_APPLY_FIXED.has(utility)) return true
    const role = COLOR_UTILITY.exec(utility)?.[1]
    return (
      role !== undefined && (colorRoles().has(role) || auditedRoles.has(role))
    )
  }

  const checkDeclaration = (file, declaration, kind, owned) => {
    const property = declaration.prop.toLowerCase()
    if (owned || property.startsWith('--')) return
    if (kind === 'theme' && THEME_PROPERTIES.has(property)) return
    if (
      kind === 'base' &&
      BASE_PROPERTIES.has(property) &&
      baseValueAllowed(property, declaration.value)
    )
      return
    if (
      kind === 'element' &&
      RESET_PROPERTIES.test(property) &&
      RESET_VALUES.has(declaration.value.trim().toLowerCase())
    )
      return
    add(
      file,
      declaration,
      'violation',
      kind === 'element'
        ? `\`${declaration.parent.selector}\` restyles a native element globally (\`${property}: ${declaration.value}\`); only reset values (inherit, 0, none) are allowed, appearance belongs to the component`
        : `\`${property}\` is not a ${kind} declaration; global ${kind} rules may only set semantic tokens and base properties`,
    )
  }

  const visit = (file, container, parents, owned) => {
    container.each(node => {
      if (node.type === 'comment') return
      if (node.type === 'decl') {
        if (parents.length === 0)
          add(
            file,
            node,
            'unverifiable',
            `declaration \`${node.prop}\` outside a rule`,
          )
        return
      }
      if (node.type === 'atrule') {
        const name = node.name.toLowerCase()
        if (name === 'import') {
          if (node.parent.type !== 'root')
            add(
              file,
              node,
              'unverifiable',
              'a nested @import cannot be resolved',
            )
          return
        }
        if (name === 'apply') {
          if (parents.length === 0)
            add(file, node, 'unverifiable', '@apply outside a rule')
          return
        }
        if (name === 'theme') {
          node.each(child => {
            if (child.type === 'comment') return
            if (child.type === 'decl' && child.prop.startsWith('--')) return
            add(
              file,
              child,
              'violation',
              '@theme may only define custom properties',
            )
          })
          return
        }
        if (name === 'utility') {
          if (!owned)
            add(
              file,
              node,
              'violation',
              `@utility ${node.params} defines a product utility in global CSS; customize the component source instead`,
            )
          return
        }
        if (name === 'scope') {
          /* `@scope (start) to (end)`: rules inside apply below `start`. */
          const start = /^\s*\(([^)]*)\)/u.exec(node.params)?.[1]
          const roots =
            start === undefined || start.trim() === ''
              ? parents
              : resolveSelectors(start, parents)
          if (node.nodes !== undefined)
            visit(file, node, roots.length === 0 ? [':scope'] : roots, owned)
          return
        }
        if (CONTAINER_AT_RULES.has(name)) {
          if (node.nodes !== undefined) visit(file, node, parents, owned)
          return
        }
        if (DEFINITION_AT_RULES.has(name)) return
        add(file, node, 'unverifiable', `unsupported at-rule @${name}`)
        return
      }
      if (node.type !== 'rule') return
      const selectors = resolveSelectors(node.selector, parents)
      const kinds = selectors.map(classifySelector)
      if (kinds.includes(null)) {
        add(
          file,
          node,
          'unverifiable',
          `selector \`${node.selector}\` cannot be classified`,
        )
        return
      }
      const kind = kinds.reduce((worst, next) =>
        RANK[next] > RANK[worst] ? next : worst,
      )
      if (owned) {
        const unscoped = selectors.find(
          selector =>
            /:global\b/u.test(selector) ||
            !/^[^\s>+~]*(?:\.[\w-]+|\[data-slot[^\]]*\])/u.test(selector),
        )
        if (unscoped !== undefined)
          add(
            file,
            node,
            'violation',
            `\`${unscoped}\` escapes the component's scope; registered component CSS must start from its own class or data-slot`,
          )
        else {
          const roots = rootsOf(file)
          const foreign =
            roots === undefined || parents.length > 0
              ? undefined
              : selectors.find(
                  selector =>
                    !rootTokens(selector).some(token => roots.has(token)),
                )
          if (foreign !== undefined)
            add(
              file,
              node,
              'violation',
              `\`${foreign}\` does not start from a class or data-slot the owning component renders; registered component CSS may only style its own roots`,
            )
        }
      } else if (kind === 'component') {
        add(
          file,
          node,
          'violation',
          `\`${selectors.join(', ')}\` styles components from global CSS; customize the component source or the theme tokens instead`,
        )
        return
      }
      node.each(child => {
        if (child.type === 'decl') checkDeclaration(file, child, kind, owned)
        else if (child.type === 'atrule' && child.name === 'apply') {
          if (!owned && kind !== 'theme' && kind !== 'base')
            add(
              file,
              child,
              'violation',
              `@apply on \`${node.selector}\` styles a native element globally`,
            )
          else if (!owned) {
            const forbidden = child.params
              .split(/\s+/u)
              .map(token => token.replace(/^!|!$/gu, ''))
              .filter(token => token !== '' && !baseApplyAllowed(token))
            if (forbidden.length > 0)
              add(
                file,
                child,
                'violation',
                `@apply ${forbidden.join(' ')} on \`${node.selector}\` is outside what base rules may apply (semantic colour roles, font family, font smoothing); it would restyle every component globally`,
              )
          }
        }
      })
      visit(
        file,
        {
          each: fn =>
            node.each(child => {
              if (child.type !== 'decl') fn(child)
            }),
        },
        selectors,
        owned,
      )
    })
  }

  const auditText = (file, text, { followImports }) => {
    let root
    try {
      root = postcss.parse(text, { from: file })
    } catch (error) {
      add(
        file,
        null,
        'unverifiable',
        `cannot parse CSS: ${error.reason ?? error.message}`,
      )
      return
    }
    for (const node of root.nodes)
      if (node.type === 'atrule' && node.name.toLowerCase() === 'import') {
        const target = importTarget(node.params)
        if (target === null) {
          add(
            file,
            node,
            'unverifiable',
            `@import ${node.params} cannot be resolved`,
          )
          continue
        }
        if (!isLocalImport(target)) continue
        if (!followImports) {
          add(
            file,
            node,
            'unverifiable',
            `local @import ${target} in registry CSS`,
          )
          continue
        }
        const resolved = target.startsWith('/')
          ? path.join(rootDir, target)
          : path.resolve(path.dirname(file), target)
        if (!existsSync(resolved)) {
          add(
            file,
            node,
            'unverifiable',
            `local @import ${target} was not found`,
          )
          continue
        }
        auditFile(resolved)
      }
    for (const role of themeColorRoles(root)) auditedRoles.add(role)
    visit(file, root, [], isOwned(file))
  }

  const auditFile = file => {
    const absolute = path.resolve(file)
    if (seen.has(absolute)) return
    seen.add(absolute)
    auditText(absolute, readFileSync(absolute, 'utf8'), { followImports: true })
  }

  return {
    auditFile,
    auditRegistryItem: item => {
      const text = registryCss(item)
      if (text !== '')
        auditText(`registry:${item.name}`, text, { followImports: false })
    },
    findings,
    files: seen,
  }
}

const serialize = (value, indent = '') =>
  Object.entries(value)
    .map(([key, entry]) =>
      typeof entry === 'object' && entry !== null
        ? Object.keys(entry).length === 0 && key.startsWith('@')
          ? `${indent}${key};`
          : `${indent}${key} {\n${serialize(entry, `${indent}  `)}\n${indent}}`
        : `${indent}${key}: ${entry};`,
    )
    .join('\n')

/* shadcn registry `cssVars` and `css` rendered as the stylesheet they install. */
export const registryCss = item => {
  const blocks = []
  const vars = (selector, entries) =>
    entries !== undefined &&
    blocks.push(
      `${selector} {\n${Object.entries(entries)
        .map(([name, value]) => `  --${name}: ${value};`)
        .join('\n')}\n}`,
    )
  vars('@theme inline', item.cssVars?.theme)
  vars(':root', item.cssVars?.light)
  vars('.dark', item.cssVars?.dark)
  if (item.css !== undefined) blocks.push(serialize(item.css))
  return blocks.join('\n')
}

export const findStylesheets = rootDir => {
  const found = []
  const walk = directory => {
    if (!existsSync(directory)) return
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else if (entry.name.endsWith('.css')) found.push(absolute)
    }
  }
  walk(path.join(rootDir, 'src'))
  /* Stylesheets the sources import from outside src (`import
     '../styles/product.css'`) are part of the app's CSS too. */
  const sources = []
  const walkSources = directory => {
    if (!existsSync(directory)) return
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walkSources(absolute)
      else if (/\.[cm]?[jt]sx?$/u.test(entry.name)) sources.push(absolute)
    }
  }
  walkSources(path.join(rootDir, 'src'))
  const root = path.resolve(rootDir)
  for (const source of sources)
    for (const match of readFileSync(source, 'utf8').matchAll(
      /(?:\bimport\s*|\bfrom\s*|\bimport\s*\(\s*)['"](\.{1,2}\/[^'"?]+\.css)['"]/gu,
    )) {
      const target = path.resolve(path.dirname(source), match[1])
      if (
        existsSync(target) &&
        !path.relative(root, target).startsWith('..') &&
        !found.includes(target)
      )
        found.push(target)
    }
  return found.sort()
}
