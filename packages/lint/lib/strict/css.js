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

export const createCssAudit = ({ isOwned = () => false, rootDir }) => {
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

  const checkDeclaration = (file, declaration, kind, owned) => {
    const property = declaration.prop.toLowerCase()
    if (owned || property.startsWith('--')) return
    if (kind === 'theme' && THEME_PROPERTIES.has(property)) return
    if (kind === 'base' && BASE_PROPERTIES.has(property)) return
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
  return found.sort()
}
