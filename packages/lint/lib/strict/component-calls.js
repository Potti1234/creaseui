import ts from 'typescript'

import {
  FORBIDDEN_PROPS,
  HTML_ONLY_CHILDREN,
  LAYOUT_CONSTRUCTORS,
  LAYOUT_PROPERTIES,
  isAppearanceSlot,
  isLayoutSlot,
  isPlacementUtility,
  isOwnedGeometryUtility,
  ownsGeometry,
  isSquareGeometryUtility,
  isSquareSize,
  SQUARE_GEOMETRY_PROPERTIES,
  OWNED_GEOMETRY_PROPERTIES,
} from './contracts.js'
import { isAssertion, unwrap } from './resolver.js'

/** Map import bindings of a file to installed (receipt) export records. */
export const createComponentIndex = (context, strict, analysis) => {
  const bindings = new Map()
  const imports = []

  const collect = program => {
    if (strict === null) return
    for (const declaration of program.body) {
      if (
        declaration.type !== 'ImportDeclaration' ||
        declaration.importKind === 'type'
      )
        continue
      const file = strict.modules.resolve(
        declaration.source.value,
        context.filename,
      )
      if (file === null) continue
      for (const specifier of declaration.specifiers) {
        if (specifier.importKind === 'type') continue
        const variable = analysis.variableOf(specifier.local)
        if (variable === null) continue
        if (specifier.type === 'ImportNamespaceSpecifier') {
          bindings.set(variable, { namespace: file })
          continue
        }
        const name =
          specifier.type === 'ImportDefaultSpecifier'
            ? 'default'
            : (specifier.imported.name ?? specifier.imported.value)
        const record = recordAt(file, name)
        if (record !== undefined) {
          bindings.set(variable, { record })
          imports.push({ record, specifier })
          continue
        }
        const namespace = strict.modules.namespaceExport(file, name)
        if (namespace !== null) bindings.set(variable, { namespace })
      }
    }
  }

  const recordAt = (file, name) => {
    const origin = strict.modules.exportOrigin(file, name)
    return origin === null
      ? undefined
      : strict.ownership.exportsOf(origin.file)?.get(origin.name)
  }

  const keyOf = member =>
    member.computed
      ? analysis.resolveString(member.property)
      : member.property.type === 'Identifier'
        ? member.property.name
        : null

  /** Origin of `Ns.name`: an export record or a nested `export * as` namespace. */
  const memberOrigin = (namespace, name) => {
    const record = recordAt(namespace, name)
    if (record !== undefined) return { record }
    const nested = strict.modules.namespaceExport(namespace, name)
    return nested === null ? undefined : { namespace: nested }
  }

  /** `const { a: b } = init` binding of a variable: `{ init, key }`, with
      `key: null` when the property cannot be resolved statically. */
  const destructuring = variable => {
    const definition = variable?.defs.length === 1 ? variable.defs[0] : null
    if (definition?.type !== 'Variable') return null
    if (definition.parent.kind !== 'const') return null
    const property = definition.name.parent
    const pattern = property?.parent
    if (
      property?.type !== 'Property' ||
      property.value !== definition.name ||
      pattern?.type !== 'ObjectPattern' ||
      definition.node.id !== pattern ||
      definition.node.init === null
    )
      return null
    const key = property.computed
      ? analysis.resolveString(property.key)
      : property.key.type === 'Identifier'
        ? property.key.name
        : String(property.key.value)
    return { init: definition.node.init, key }
  }

  /**
   * Installed origin of an expression: `{ namespace }`, `{ record }` or
   * `{ unresolved }`. Follows immutable aliases (`const UI = Design`),
   * destructuring (`const { button } = Design`) and constant members.
   */
  const originOf = (node, depth = 0) => {
    node = unwrap(node)
    if (node === null || node === undefined || depth > 12) return undefined
    if (node.type === 'Identifier') {
      const variable = analysis.variableOf(node)
      const entry = bindings.get(variable)
      if (entry !== undefined) return entry
      const destructured = destructuring(variable)
      if (destructured !== null) {
        const namespace = originOf(destructured.init, depth + 1)?.namespace
        if (namespace === undefined) return undefined
        if (destructured.key === null) return { unresolved: true }
        return memberOrigin(namespace, destructured.key)
      }
      const init = analysis.constInit(node)
      return init === null ? undefined : originOf(init, depth + 1)
    }
    if (node.type === 'MemberExpression') {
      const namespace = originOf(node.object, depth + 1)?.namespace
      if (namespace === undefined) return undefined
      const name = keyOf(node)
      if (name === null) return { unresolved: true }
      return memberOrigin(namespace, name)
    }
    return undefined
  }

  /** Record for `Ns.name` or constant computed `Ns['name']`, through aliases. */
  const memberRecord = member =>
    member?.type === 'MemberExpression' ? originOf(member)?.record : undefined

  /** `Ns[key]` on a component namespace whose key cannot be resolved. */
  const unresolvedMember = member =>
    member?.type === 'MemberExpression' &&
    member.computed &&
    originOf(member)?.unresolved === true

  /** `const { [key]: x } = Ns` on a component namespace with an unknown key. */
  const unresolvedDestructuring = identifier =>
    destructuring(analysis.variableOf(identifier))?.key === null &&
    originOf(identifier)?.unresolved === true

  const callRecord = callee => originOf(callee)?.record

  return {
    callRecord,
    collect,
    destructuring,
    imports,
    memberRecord,
    unresolvedDestructuring,
    unresolvedMember,
  }
}

const label = record => `\`${record.name}\` (${record.contract})`

/** Static class tokens of a value, or null when they cannot be resolved. */
const classValues = (analysis, node, seen = new Set()) => {
  node = unwrap(node)
  if (node === null || node === undefined) return []
  if (node.type === 'Literal' && typeof node.value === 'string')
    return [node.value]
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return [node.quasis[0].value.cooked]
  if (node.type === 'Identifier' && node.name === 'undefined') return []
  if (node.type === 'Identifier') {
    const init = analysis.constInit(node)
    if (init === null || seen.has(init)) return null
    seen.add(init)
    return classValues(analysis, init, seen)
  }
  if (node.type === 'ConditionalExpression') {
    const both = [
      classValues(analysis, node.consequent, seen),
      classValues(analysis, node.alternate, seen),
    ]
    return both.includes(null) ? null : both.flat()
  }
  if (node.type === 'LogicalExpression') {
    const right = classValues(analysis, node.right, seen)
    if (node.operator === '&&') return right
    const left = classValues(analysis, node.left, seen)
    return left === null || right === null ? null : [...left, ...right]
  }
  return null
}

/**
 * Findings for one contracted component call. `violation` findings belong
 * to component-contract, `unverifiable` ones to no-unverifiable-ui.
 */
const STYLEX = '@stylexjs/stylex'

const importOf = (analysis, identifier) => {
  const definition = analysis.variableOf(identifier)?.defs[0]
  return definition?.type === 'ImportBinding' &&
    definition.parent.source.value === STYLEX
    ? definition.node
    : undefined
}

/** `stylex.create` (namespace or default import) or an imported `create`. */
export const isStylexCreate = (analysis, callee) => {
  if (callee.type === 'Identifier') {
    const specifier = importOf(analysis, callee)
    return (
      specifier?.type === 'ImportSpecifier' &&
      (specifier.imported.name ?? specifier.imported.value) === 'create'
    )
  }
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'create' &&
    callee.object.type === 'Identifier' &&
    importOf(analysis, callee.object)?.type !== 'ImportSpecifier' &&
    importOf(analysis, callee.object) !== undefined
  )
}

/* The wrapper's own function: an exported module-level function, whatever its
   syntax. Callbacks, nested helpers and private helpers do not own props. */
const isWrapperFunction = fn => {
  const parent = fn.parent
  if (parent?.type === 'ExportDefaultDeclaration') return true
  if (fn.type === 'FunctionDeclaration')
    return parent?.type === 'ExportNamedDeclaration'
  return (
    parent?.type === 'VariableDeclarator' &&
    parent.init === fn &&
    parent.parent?.parent?.type === 'ExportNamedDeclaration'
  )
}

export const analyzeCall = ({
  analysis,
  call,
  context,
  forwarding = false,
  record,
  strict,
}) => {
  const findings = []
  /* The forwarding exemption covers only values read from the wrapper's own
     parameters (`props`, `props.class`, `const { class: c } = props`);
     factories, constants and other locals are still checked. */
  const ownProps = (node, seen = new Set()) => {
    if (!forwarding) return false
    node = unwrap(node)
    if (node?.type === 'MemberExpression' && !node.computed)
      return ownProps(node.object, seen)
    if (node?.type !== 'Identifier') return false
    const variable = analysis.variableOf(node)
    if (variable === null || seen.has(variable) || variable.defs.length !== 1)
      return false
    seen.add(variable)
    const definition = variable.defs[0]
    if (definition.type === 'Parameter')
      return isWrapperFunction(definition.node)
    return (
      definition.type === 'Variable' &&
      definition.parent.kind === 'const' &&
      definition.node.init !== null &&
      ownProps(definition.node.init, seen)
    )
  }
  const violation = (node, message) =>
    findings.push({ kind: 'violation', message, node })
  const unverifiable = (node, message) =>
    findings.push({ kind: 'unverifiable', message, node })
  const renderer = strict?.renderer ?? 'tailwind'
  const props = call.arguments[record.propsArgument]
  if (props === undefined) return findings

  const typedFields = node => {
    if (!analysis.hasTypes) return null
    try {
      const type = analysis.checker.getTypeAtLocation(
        analysis.services.esTreeNodeToTSNodeMap.get(node),
      )
      if ((type.flags & 1) !== 0 || (type.flags & 2) !== 0) return null
      if (analysis.checker.getIndexInfosOfType(type).length > 0) return null
      return type.getProperties().map(property => property.getName())
    } catch {
      return null
    }
  }

  const opaque = (node, entries) => {
    /* An owned source passing its own props on is the owner's contract;
       literal UI props in it are still checked. */
    if (ownProps(node)) return
    const fields = typedFields(node)
    const name = context.sourceCode.getText(node)
    if (fields === null) {
      unverifiable(
        node,
        `Props \`${name}\` passed to ${label(record)} cannot be resolved; spread a local object or give it a closed type without UI fields.`,
      )
      return
    }
    for (const field of fields) {
      if (
        FORBIDDEN_PROPS.has(field) ||
        isAppearanceSlot(field) ||
        (field === 'class' && renderer !== 'tailwind')
      )
        violation(
          node,
          `\`${field}\` reaches ${label(record)} through \`${name}\`; appearance belongs to named variants.`,
        )
      else if (field === 'class' || isLayoutSlot(field))
        unverifiable(
          node,
          `\`${field}\` reaches ${label(record)} through \`${name}\` and its value cannot be checked against the placement contract.`,
        )
    }
    entries.size
  }

  const read = (node, seen) => {
    const entries = new Map()
    if (isAssertion(node)) {
      unverifiable(
        node,
        `Props for ${label(record)} use a type assertion; asserted UI props cannot be verified.`,
      )
      return entries
    }
    node = unwrap(node)
    if (node?.type === 'Identifier') {
      const init = analysis.constInit(node)
      if (init !== null && !seen.has(init)) {
        seen.add(init)
        return read(init, seen)
      }
      opaque(node, entries)
      return entries
    }
    if (node?.type === 'ConditionalExpression') {
      /* A key missing from one branch may be absent, so a spread of the
         conditional keeps the earlier value reachable. */
      const branches = [node.consequent, node.alternate].map(branch =>
        read(branch, seen),
      )
      entries.optional = new Set()
      for (const branch of branches)
        for (const [key, values] of branch) {
          entries.set(key, [...(entries.get(key) ?? []), ...values])
          if (branch.optional?.has(key)) entries.optional.add(key)
        }
      for (const key of entries.keys())
        if (branches.some(branch => !branch.has(key))) entries.optional.add(key)
      return entries
    }
    if (node?.type !== 'ObjectExpression') {
      opaque(node, entries)
      return entries
    }
    for (const property of node.properties) {
      if (property.type === 'SpreadElement') {
        const spread = read(property.argument, seen)
        for (const [key, values] of spread) {
          if (!spread.optional?.has(key)) {
            entries.optional?.delete(key)
            entries.set(key, values)
            continue
          }
          if (!entries.has(key)) {
            entries.optional ??= new Set()
            entries.optional.add(key)
          }
          entries.set(key, [...(entries.get(key) ?? []), ...values])
        }
        continue
      }
      const key = property.computed
        ? analysis.resolveString(property.key)
        : property.key.type === 'Identifier'
          ? property.key.name
          : String(property.key.value)
      if (key === null) {
        unverifiable(
          property.key,
          `A computed prop key on ${label(record)} cannot be resolved.`,
        )
        continue
      }
      entries.optional?.delete(key)
      entries.set(key, [property.value])
    }
    return entries
  }

  const keyName = (key, computed) =>
    computed
      ? analysis.resolveString(key)
      : key.type === 'Identifier'
        ? key.name
        : typeof key.value === 'string'
          ? key.value
          : null

  /* `styles.page` where `styles = stylex.create({ page: {...} })`: the entry
     object, null when it cannot be resolved, undefined for other members. */
  const stylexEntry = member => {
    if (member.object.type !== 'Identifier') return undefined
    const init = unwrap(analysis.constInit(member.object))
    if (
      init?.type !== 'CallExpression' ||
      !isStylexCreate(analysis, init.callee)
    )
      return undefined
    const key = keyName(member.property, member.computed)
    const entries = unwrap(init.arguments[0])
    if (key === null || entries?.type !== 'ObjectExpression') return null
    const entry = entries.properties.find(
      property =>
        property.type === 'Property' &&
        keyName(property.key, property.computed) === key,
    )
    const value = unwrap(entry?.value)
    return value?.type === 'ObjectExpression' ? value : null
  }

  const checkLayoutCall = (callNode, seen) => {
    for (const argument of callNode.arguments) {
      const object = unwrap(argument)
      if (object?.type !== 'ObjectExpression') continue
      for (const property of object.properties) {
        if (property.type === 'SpreadElement') {
          unverifiable(
            property,
            `A spread inside a placement value for ${label(record)} cannot be verified.`,
          )
          continue
        }
        const key = property.computed
          ? analysis.resolveString(property.key)
          : property.key.type === 'Identifier'
            ? property.key.name
            : String(property.key.value)
        if (key === null)
          unverifiable(
            property.key,
            `A computed placement property cannot be resolved.`,
          )
        else if (
          ownsGeometry(record.contract) &&
          OWNED_GEOMETRY_PROPERTIES.has(key)
        )
          violation(
            property,
            `\`${key}\` overrides the named size of ${label(record)}; use its \`size\` option.`,
          )
        else if (SQUARE_GEOMETRY_PROPERTIES.has(key) && squareChoices === null)
          unverifiable(
            property,
            `\`size\` of ${label(record)} cannot be resolved to finite choices, so \`${key}\` may distort a square icon size.`,
          )
        else if (
          SQUARE_GEOMETRY_PROPERTIES.has(key) &&
          squareChoices.length > 0
        )
          violation(
            property,
            `\`${key}\` distorts the square \`${squareChoices.join('/')}\` size of ${label(record)}; pick another named icon size.`,
          )
        else if (key === 'display') {
          const value = unwrap(property.value)
          const resolved =
            value !== null && value !== undefined
              ? value.type === 'Literal'
                ? value.value
                : analysis.resolveString(value)
              : undefined
          if (resolved !== 'none')
            violation(
              property,
              `\`display\` in a placement value may only be \`'none'\`; parents hide a component, other display changes stay component-owned.`,
            )
        } else if (!LAYOUT_PROPERTIES.has(key))
          violation(
            property,
            `\`${key}\` is not a placement property; ${label(record)} owns its padding, gap, typography, color, border, radius, shadow, opacity and motion.`,
          )
      }
      seen.add(object)
    }
  }

  const checkLayout = (node, slot, seen = new Set()) => {
    if (isAssertion(node)) {
      unverifiable(
        node,
        `The \`${slot}\` value for ${label(record)} is forged with a type assertion.`,
      )
      return
    }
    node = unwrap(node)
    if (node === null || node === undefined || seen.has(node)) return
    seen.add(node)
    if (node.type === 'Identifier' && node.name === 'undefined') return
    if (node.type === 'Identifier') {
      const init = analysis.constInit(node)
      if (init !== null) return checkLayout(init, slot, seen)
      unverifiable(
        node,
        `The \`${slot}\` value \`${node.name}\` for ${label(record)} cannot be resolved to layoutStyle()/layoutWhen().`,
      )
      return
    }
    if (node.type === 'ConditionalExpression') {
      checkLayout(node.consequent, slot, seen)
      checkLayout(node.alternate, slot, seen)
      return
    }
    if (node.type === 'LogicalExpression') {
      if (node.operator !== '&&') checkLayout(node.left, slot, seen)
      checkLayout(node.right, slot, seen)
      return
    }
    if (node.type === 'ArrayExpression') {
      for (const element of node.elements) checkLayout(element, slot, seen)
      return
    }
    /* A curried constructor application (layoutWhen(cond, decls)(self)):
       check the inner call's declaration object, then the applied value. */
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'CallExpression'
    ) {
      checkLayout(node.callee, slot, seen)
      for (const argument of node.arguments) checkLayout(argument, slot, seen)
      return
    }
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
      const definition = analysis.variableOf(node.callee)?.defs[0]
      const imported =
        definition?.type === 'ImportBinding' &&
        definition.node.type === 'ImportSpecifier'
          ? (definition.node.imported.name ?? definition.node.imported.value)
          : undefined
      if (imported !== undefined && LAYOUT_CONSTRUCTORS.has(imported)) {
        checkLayoutCall(node, seen)
        return
      }
    }
    if (renderer === 'stylex' && node.type === 'MemberExpression') {
      const entry = stylexEntry(node)
      if (entry !== undefined) {
        if (entry === null)
          unverifiable(
            node,
            `The \`${slot}\` style \`${context.sourceCode.getText(node)}\` for ${label(record)} cannot be resolved to a stylex.create() entry.`,
          )
        else checkLayoutCall({ arguments: [entry] }, seen)
        return
      }
    }
    /* An owned source passing its own `layoutStyle` prop on. */
    if (ownProps(node)) return
    violation(
      node,
      `\`${slot}\` on ${label(record)} accepts only layoutStyle()/layoutWhen() placement values, not arbitrary style objects or factories.`,
    )
  }

  /** Finite string choices of a variant value, or null when open-ended. */
  const typedChoices = node => {
    if (!analysis.hasTypes) return null
    try {
      const type = analysis.checker.getTypeAtLocation(
        analysis.services.esTreeNodeToTSNodeMap.get(node),
      )
      const values = []
      for (const part of type.isUnion() ? type.types : [type])
        if (part.isStringLiteral()) values.push(part.value)
        else if ((part.flags & ts.TypeFlags.Undefined) !== 0)
          values.push('default')
        else return null
      return values
    } catch {
      return null
    }
  }
  const choices = (node, seen = new Set()) => {
    node = unwrap(node)
    if (node === null || node === undefined) return null
    const constant = analysis.resolveString(node)
    if (constant !== null) return [constant]
    if (node.type === 'Identifier' && node.name === 'undefined')
      return ['default']
    const branches =
      node.type === 'ConditionalExpression'
        ? [node.consequent, node.alternate]
        : node.type === 'LogicalExpression'
          ? [node.left, node.right]
          : null
    if (branches !== null) {
      const found = branches.map(branch => choices(branch, seen))
      return found.includes(null) ? null : found.flat()
    }
    if (node.type === 'Identifier') {
      const init = analysis.constInit(node)
      if (init !== null && !seen.has(init)) {
        seen.add(init)
        const found = choices(init, seen)
        if (found !== null) return found
      }
    }
    return typedChoices(node)
  }

  const entries = read(props, new Set())
  /* Square icon sizes selected by any branch of `size`; null when `size`
     is open-ended on a component that has icon sizes. */
  const sizeChoices = (() => {
    const values = entries.get('size')
    if (values === undefined) return ['default']
    const found = values.map(value => choices(value))
    return found.includes(null) ? null : found.flat()
  })()
  const squareChoices = !ownsGeometry(record.contract)
    ? []
    : sizeChoices === null
      ? (record.variants.size ?? []).some(isSquareSize)
        ? null
        : []
      : [...new Set(sizeChoices.filter(isSquareSize))]

  for (const [key, values] of entries) {
    for (const value of values) {
      if (FORBIDDEN_PROPS.has(key) || isAppearanceSlot(key)) {
        violation(
          value,
          `\`${key}\` is an appearance override on ${label(record)}; use a named variant or composition prop.`,
        )
      } else if (key === 'class') {
        if (renderer !== 'tailwind') {
          violation(
            value,
            `\`class\` is not part of the ${renderer} contract of ${label(record)}; use layoutStyle() for placement.`,
          )
          continue
        }
        const tokens = classValues(analysis, value)
        if (tokens === null) {
          if (ownProps(value)) continue
          unverifiable(
            value,
            `The \`class\` value for ${label(record)} cannot be resolved to static placement utilities.`,
          )
          continue
        }
        const appearance = tokens
          .flatMap(token => token.trim().split(/\s+/u))
          .filter(token => token !== '' && !isPlacementUtility(token))
        const geometry = ownsGeometry(record.contract)
          ? tokens
              .flatMap(token => token.trim().split(/\s+/u))
              .filter(token => isOwnedGeometryUtility(token))
          : []
        if (geometry.length > 0)
          violation(
            value,
            `\`${geometry.join(' ')}\` overrides the named size of ${label(record)}; use its \`size\` option.`,
          )
        const squareGeometry = tokens
          .flatMap(token => token.trim().split(/\s+/u))
          .filter(
            token =>
              isSquareGeometryUtility(token) && !geometry.includes(token),
          )
        if (squareGeometry.length > 0 && squareChoices === null)
          unverifiable(
            value,
            `\`size\` of ${label(record)} cannot be resolved to finite choices, so \`${squareGeometry.join(' ')}\` may distort a square icon size.`,
          )
        else if (squareGeometry.length > 0 && squareChoices.length > 0)
          violation(
            value,
            `\`${squareGeometry.join(' ')}\` distorts the square \`${squareChoices.join('/')}\` size of ${label(record)}; pick another named icon size.`,
          )
        if (appearance.length > 0)
          violation(
            value,
            `\`${appearance.join(' ')}\` on ${label(record)} is not a placement utility; parents own arrangement and named variants own appearance.`,
          )
      } else if (isLayoutSlot(key)) {
        checkLayout(value, key)
      } else if (
        key === 'children' &&
        HTML_ONLY_CHILDREN.has(record.contract)
      ) {
        const array = unwrap(value)
        for (const element of array?.type === 'ArrayExpression'
          ? array.elements
          : [])
          if (
            (element?.type === 'Literal' &&
              typeof element.value === 'string') ||
            element?.type === 'TemplateLiteral'
          )
            violation(
              element,
              `Direct string children in ${label(record)}; render text through Text or a typography helper.`,
            )
      } else if (Array.isArray(record.variants[key])) {
        const choice = analysis.resolveString(value)
        if (choice !== null && !record.variants[key].includes(choice))
          violation(
            value,
            `\`${key}: '${choice}'\` is not a ${label(record)} variant (allowed: ${record.variants[key].join(', ')}).`,
          )
      }
    }
  }
  return findings
}
