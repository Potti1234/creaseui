import { existsSync, readFileSync } from 'node:fs'

import postcss from 'postcss'

import {
  createFoldkitTracker,
  resolveObject,
  splitClasses,
  staticValues,
} from './foldkit-sites.js'
import { findStylesheets } from './strict/css.js'
import { strictContextOf } from './strict/context.js'

/* Shared machinery for the defensive-css rule family (defensivecss.dev):
   the sites rules check — Tailwind class strings on h.* builders and
   component calls, StyleX `stylex.create` declaration objects, Pleat
   `Style.make`/`Style.when` declarations — plus the project custom-property
   inventory used to tell guaranteed design tokens from fragile var() reads. */

const STYLEX_PACKAGES = /^@stylexjs\/stylex$/u
const PLEAT_CORE = '@pleat/core'

const propertyKey = property => {
  const { key } = property
  if (property.computed && key.type === 'Literal') return String(key.value)
  if (key.type === 'Identifier') return key.name
  if (key.type === 'Literal') return String(key.value)
  return null
}

const unwrap = node => {
  while (
    node !== null &&
    node !== undefined &&
    ['TSAsExpression', 'TSNonNullExpression', 'TSSatisfiesExpression'].includes(
      node.type,
    )
  )
    node = node.expression
  return node
}

const isClassAttribute = node =>
  node?.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'h' &&
  node.callee.property.type === 'Identifier' &&
  node.callee.property.name === 'Class'

const isBuilderCall = node =>
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'h' &&
  node.callee.property.type === 'Identifier' &&
  /^[a-z][a-z0-9]*$/u.test(node.callee.property.name)

const VARIANT_FACTORIES = new Set(['cva', 'tv'])

const calleeName = node => {
  const callee = node.callee
  if (callee.type === 'Identifier') return callee.name
  if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier'
  ) {
    if (callee.object.type === 'Identifier' && callee.object.name === 'h')
      return `h.${callee.property.name}`
    return callee.property.name
  }
  return null
}

const pascalTag = name =>
  name === null ? null : name.startsWith('h.') ? name : name

/* A defensive site: one element's worth of class text and style
   declarations. `tokens` merges every static class the call can produce
   (class/className props, h.Class attributes, cva/tv strings). `decls` are
   the flattened camelCase declarations resolved from layoutStyle/style
   references. */
export const createDefensiveWalker = (context, options = {}) => {
  const tracker = createFoldkitTracker(options)
  const { variables } = tracker
  const sourceCode = context.sourceCode ?? context.getSourceCode()
  const stack = []

  const classSources = node => {
    const sources = []
    const push = value =>
      sources.push({
        node: value,
        tokens: staticValues(value, variables).strings.flatMap(splitClasses),
      })
    const arg0 = unwrap(node.arguments[0])
    const object = resolveObject(arg0, variables)
    if (object !== null)
      for (const property of object.properties) {
        if (property.type !== 'Property' || property.kind !== 'init') continue
        const key = propertyKey(property)
        if (key === 'class' || key === 'className') push(property.value)
        if (key === 'attributes' && property.value.type === 'ArrayExpression')
          for (const element of property.value.elements)
            if (isClassAttribute(element)) push(element)
      }
    else if (arg0?.type === 'ArrayExpression')
      for (const element of arg0.elements)
        if (isClassAttribute(element)) push(element)
    if (
      node.callee.type === 'Identifier' &&
      VARIANT_FACTORIES.has(node.callee.name)
    )
      for (const argument of node.arguments) push(argument)
    return sources
  }

  /* Declaration objects referenced through layoutStyle/style props:
     `styles.foo` reads the `foo` entry of a local `x.create({...})` call;
     `layoutStyle({...})` carries the declarations inline. */
  const createCallObjects = (node, seen = new Set()) => {
    node = unwrap(node)
    if (node === null || node === undefined || seen.has(node)) return []
    seen.add(node)
    if (node.type === 'CallExpression') {
      const callee = node.callee
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        ['create', 'make'].includes(callee.property.name)
      ) {
        const object = resolveObject(node.arguments[0], variables)
        return object === null ? [] : [object]
      }
      if (callee.type === 'Identifier') {
        const object = resolveObject(node.arguments[0], variables)
        return object === null ? [] : [object]
      }
      return []
    }
    if (node.type === 'MemberExpression' && !node.computed) {
      const target = createCallObjects(node.object, seen)
      const name = propertyKey({ key: node.property, computed: false })
      return target.flatMap(object =>
        object.properties.flatMap(property =>
          property.type === 'Property' && propertyKey(property) === name
            ? createCallObjects(property.value, seen)
            : [],
        ),
      )
    }
    if (node.type === 'Identifier') {
      if (seen.has(node.name)) return []
      seen.add(node.name)
      return createCallObjects(variables.get(node.name), seen)
    }
    if (node.type === 'ConditionalExpression')
      return [
        ...createCallObjects(node.consequent, seen),
        ...createCallObjects(node.alternate, seen),
      ]
    if (node.type === 'LogicalExpression')
      return createCallObjects(node.right, seen)
    if (node.type === 'ArrayExpression')
      return node.elements
        .filter(Boolean)
        .flatMap(element => createCallObjects(element, seen))
    return []
  }

  const styleProps = node => {
    const objects = []
    const arg0 = resolveObject(node.arguments[0], variables)
    if (arg0 === null) return objects
    for (const property of arg0.properties) {
      if (property.type !== 'Property' || property.kind !== 'init') continue
      const key = propertyKey(property)
      if (
        key !== null &&
        (key === 'layoutStyle' ||
          key === 'style' ||
          key === 'styles' ||
          key.endsWith('LayoutStyle'))
      )
        objects.push(...createCallObjects(property.value))
    }
    return objects
  }

  const enter = node => {
    const call = tracker.componentCall(node)
    const name = call?.component ?? pascalTag(calleeName(node))
    const info = {
      node,
      name,
      tag: isBuilderCall(node) ? node.callee.property.name : null,
      classSources: classSources(node),
      styleObjects: styleProps(node),
    }
    stack.push(info)
    return info
  }

  return {
    collectImport: tracker.collectImport,
    collectVariable: tracker.collectVariable,
    enter,
    exit: () => stack.pop(),
    /* Enclosing calls, innermost first, excluding the call under test. */
    ancestors: () => [...stack.slice(0, -1)].reverse(),
    variables,
    sourceCode,
  }
}

/* Flattened declaration: `prop` is the CSS property (camelCase or custom
   `--x`), `conditions` the nested pseudo/media keys above the value
   (':hover', '@media (hover:hover)', 'default'). */
export const styleDecls = object => {
  const out = []
  const walk = (container, prop, conditions) => {
    for (const property of container.properties) {
      if (property.type !== 'Property' || property.kind !== 'init') continue
      const key = propertyKey(property)
      if (key === null) continue
      const value = unwrap(property.value)
      if (value?.type === 'ObjectExpression') {
        walk(
          value,
          prop ?? key,
          prop === null ? conditions : [...conditions, key],
        )
        continue
      }
      const text =
        value?.type === 'Literal' && value.value !== null
          ? String(value.value)
          : value?.type === 'TemplateLiteral' && value.expressions.length === 0
            ? (value.quasis[0]?.value.cooked ?? null)
            : null
      out.push({
        conditions,
        key,
        node: property,
        prop: prop ?? key,
        value: text,
        valueNode: value,
      })
    }
  }
  walk(object, null, [])
  return out
}

/* Declaration objects produced by `x.create({...})` (StyleX) and
   `Style.make`/`Style.when` (Pleat) calls: every object that carries CSS
   declarations, including conditional groups. */
export const createDeclCollector = (context, options = {}) => {
  const { variables } = options.tracker ?? createFoldkitTracker({})
  const sourceCode = context.sourceCode ?? context.getSourceCode()
  const stylexBindings = new Set()
  const pleatStyleBindings = new Set()
  const pleatNamespaces = new Set()

  const collectImport = node => {
    const source = node.source.value
    for (const specifier of node.specifiers) {
      if (STYLEX_PACKAGES.test(source)) stylexBindings.add(specifier.local.name)
      if (source === PLEAT_CORE) {
        if (specifier.type === 'ImportNamespaceSpecifier')
          pleatNamespaces.add(specifier.local.name)
        else if (
          (specifier.imported?.name ?? specifier.imported?.value) === 'Style'
        )
          pleatStyleBindings.add(specifier.local.name)
      }
    }
  }

  const isStylexCallee = callee =>
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'create' &&
    callee.object.type === 'Identifier' &&
    stylexBindings.has(callee.object.name)

  const findVariable = (node, name) => {
    let scope = sourceCode.getScope(node)
    while (scope) {
      const variable = scope.set.get(name)
      if (variable) return variable
      scope = scope.upper
    }
    return null
  }

  /* `Style` bound to @pleat/core (named or namespace member). */
  const isPleatStyle = node => {
    if (node.type === 'Identifier') {
      if (!pleatStyleBindings.has(node.name)) return false
      const variable = findVariable(node, node.name)
      const definition = variable?.defs[0]
      return (
        definition?.type === 'ImportBinding' &&
        definition.parent.source.value === PLEAT_CORE
      )
    }
    if (
      node.type === 'MemberExpression' &&
      !node.computed &&
      node.object.type === 'Identifier' &&
      propertyKey({ key: node.property, computed: false }) === 'Style'
    )
      return pleatNamespaces.has(node.object.name)
    return false
  }

  /* Declaration objects of one call, or null when the call styles nothing. */
  const declObjectsOf = node => {
    const callee = node.callee
    if (isStylexCallee(callee)) {
      const object = resolveObject(node.arguments[0], variables)
      if (object === null) return []
      /* stylex.create({ root: {...}, icon: {...} }) — each entry is a
         declaration object. */
      return object.properties.flatMap(property =>
        property.type === 'Property' &&
        property.value.type === 'ObjectExpression'
          ? [property.value]
          : [],
      )
    }
    if (callee.type === 'MemberExpression' && !callee.computed) {
      const method = callee.property.name
      if (
        (method === 'make' || method === 'when') &&
        isPleatStyle(callee.object)
      ) {
        const argument =
          method === 'make' ? node.arguments[0] : node.arguments.at(-1)
        if (
          argument !== undefined &&
          node.arguments.length >= (method === 'make' ? 1 : 2)
        ) {
          const object = resolveObject(argument, variables)
          if (object !== null) return [object]
        }
      }
    }
    return null
  }

  return { collectImport, declObjectsOf }
}

/* -- custom property inventory -------------------------------------- */

const VARIABLE_DEFINITION = /(--[\w-]+)\s*:/gu

const stylesheetVariables = new Map()
const projectVariables = rootDir => {
  const cached = stylesheetVariables.get(rootDir)
  if (cached !== undefined) return cached
  const variables = new Set()
  if (rootDir !== undefined && existsSync(rootDir))
    for (const file of findStylesheets(rootDir))
      try {
        const root = postcss.parse(readFileSync(file, 'utf8'), { from: file })
        root.walkDecls(decl => {
          if (decl.prop.startsWith('--')) variables.add(decl.prop)
        })
      } catch {
        /* unparsable stylesheets are reported by the css audit itself */
      }
  stylesheetVariables.set(rootDir, variables)
  return variables
}

/* Custom properties the project guarantees: every `--x:` declaration in
   the file being linted (`'--x':` style props, `[--x:…]` Tailwind arbitrary
   properties, template CSS) plus, when known, the project's stylesheets. */
export const declaredVariables = context => {
  const strict = strictContextOf(context)
  const variables = projectVariables(
    strict?.rootDir ?? context.cwd ?? process.cwd(),
  )
  const local = new Set()
  const text = (context.sourceCode ?? context.getSourceCode()).getText()
  for (const match of text.matchAll(VARIABLE_DEFINITION)) local.add(match[1])
  return name => local.has(name) || variables.has(name)
}

/* Driver shared by all defensive rules: walks every call expression,
   maintaining the enclosing-call stack for parent-sensitive rules.
   siteFn(info, walker) fires per call site; declFn(declObject, info) fires
   per resolved declaration object (StyleX `x.create` entries, Pleat
   `Style.make`/`Style.when` args, layoutStyle/style prop references). */
export const runDefensiveRule = (context, options, siteFn, declFn) => {
  const walker = createDefensiveWalker(context, options)
  const collector = createDeclCollector(context)
  return {
    ImportDeclaration(node) {
      walker.collectImport(node)
      collector.collectImport(node)
    },
    VariableDeclarator: walker.collectVariable,
    CallExpression(node) {
      const info = walker.enter(node)
      if (siteFn !== null) siteFn(info, walker)
      if (declFn !== null) {
        const objects = collector.declObjectsOf(node)
        if (objects !== null) for (const object of objects) declFn(object, info)
        for (const object of info.styleObjects) declFn(object, info)
      }
    },
    'CallExpression:exit'() {
      walker.exit()
    },
  }
}

export const allowedList = (options, key = 'allow') =>
  (options[key] ?? []).map(pattern => new RegExp(`^(?:${pattern})$`, 'u'))

export const matchesAllow = (patterns, value) =>
  patterns.some(pattern => pattern.test(value))

/* `var(--x)` reads without a fallback argument. */
export function* bareVariableReads(text) {
  for (const match of text.matchAll(/var\(\s*(--[\w-]+)\s*(\)|,)/gu))
    if (match[2] === ')') yield match[1]
}
