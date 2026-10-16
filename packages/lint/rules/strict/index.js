import {
  analyzeCall,
  createComponentIndex,
} from '../../lib/strict/component-calls.js'
import {
  docsUrl,
  fileRecord,
  replacementFor,
  strictContextOf,
} from '../../lib/strict/context.js'
import {
  CLASS_HELPER_PACKAGES,
  RENDERER_AUTHORING_PACKAGES,
  STYLE_MODULE,
} from '../../lib/strict/contracts.js'
import {
  EXTERNAL_RENDERERS,
  NAMED_ATTRIBUTE_MEMBERS,
  STYLE_ATTRIBUTE_NAMES,
  STYLE_ESCAPE_MEMBERS,
  TAG_CONTRACTS,
  TRANSPORT_MEMBERS,
  isFoldkitUiRenderExport,
  tagCategory,
} from '../../lib/strict/inventory.js'
import { createFileAnalysis, unwrap } from '../../lib/strict/resolver.js'

const meta = (rule, description) => ({
  type: 'problem',
  docs: { description, url: docsUrl(rule) },
  schema: [],
})

const IMPLEMENTATION_ROLES = new Set(['renderer', 'theme', 'adapter', 'setup'])
const isTagLike = name =>
  name !== null &&
  /^[a-z]/u.test(name) &&
  name !== 'keyed' &&
  !TRANSPORT_MEMBERS.has(name)

const valueSpecifiers = declaration =>
  declaration.importKind === 'type'
    ? []
    : declaration.specifiers.filter(
        specifier => specifier.importKind !== 'type',
      )

const rawRule = (rule, category, description) => ({
  meta: meta(rule, description),
  create(context) {
    const strict = strictContextOf(context)
    const record = fileRecord(strict, context.filename)
    const granted = record?.rawRendering === true ? record.rawElements : null
    if (granted === undefined) return {}
    const analysis = createFileAnalysis(context)
    const report = (node, tag) => {
      if (tagCategory(tag) !== category) return
      if (granted?.has(tag)) return
      const contract = TAG_CONTRACTS.get(tag)
      context.report({
        message:
          granted === null
            ? `Raw \`${tag}\` rendering is forbidden in application views (${rule}, contract ${contract}). ${replacementFor(strict, contract, context.filename)} Raw rendering is only allowed in exact implementation files registered in crease.lock.json.`
            : `Raw \`${tag}\` is outside this implementation's rawElements grant (${[...granted].join(', ')}) in crease.lock.json (${rule}, contract ${contract}). ${replacementFor(strict, contract, context.filename)}`,
        node,
      })
    }
    const visit = member => {
      if (member !== null && isTagLike(member.name))
        report(member.node, member.name)
    }
    return {
      CallExpression(node) {
        const member = analysis.calleeMember(node.callee)
        if (member?.name !== 'keyed') return
        const tag = analysis.resolveString(node.arguments[0])
        if (tag !== null) report(node, tag)
      },
      ...(category === 'composition'
        ? {
            ImportDeclaration(node) {
              if (node.source.value !== 'foldkit/html') return
              for (const specifier of valueSpecifiers(node))
                if (
                  (specifier.imported?.name ?? specifier.imported?.value) ===
                  'customElement'
                )
                  context.report({
                    message: `Custom element constructors render outside the component contracts (${rule}). Wrap the element in a registered adapter (crease.lock.json role "adapter").`,
                    node: specifier,
                  })
            },
          }
        : {}),
      MemberExpression(node) {
        visit(analysis.builderMember(node))
        if (
          category === 'composition' &&
          !node.computed &&
          node.property.name === 'customElement' &&
          node.object.type === 'Identifier' &&
          analysis.isHtmlNamespace(node.object)
        )
          context.report({
            message: `Custom element constructors render outside the component contracts (${rule}). Wrap the element in a registered adapter.`,
            node,
          })
      },
      Property(node) {
        if (node.parent.type === 'ObjectPattern')
          visit(analysis.destructuredMember(node))
      },
    }
  },
})

export const noRawControls = rawRule(
  'no-raw-controls',
  'control',
  'Disallow native controls (button, input, textarea, select, option) in application views.',
)
export const noRawComposition = rawRule(
  'no-raw-composition',
  'composition',
  'Disallow raw layout, text, link, list, form, table, media and custom element rendering in application views.',
)

export const noUnapprovedRenderer = {
  meta: meta(
    'no-unapproved-renderer',
    'Disallow external render providers, headless @foldkit/ui views and implementation-only render exports in application views.',
  ),
  create(context) {
    const strict = strictContextOf(context)
    if (fileRecord(strict, context.filename)?.rawRendering === true) return {}
    const analysis = createFileAnalysis(context)
    const index = createComponentIndex(context, strict, analysis)
    const headless = new Map()
    const report = (node, message) =>
      context.report({ message: `${message} (no-unapproved-renderer)`, node })
    const implementationOnly = (node, record) =>
      report(
        node,
        `\`${record.name}\` is an implementation-only render export of ${record.owner} (${record.contract}); application views must use the public styled component`,
      )
    const camel = name => name.charAt(0).toLowerCase() + name.slice(1)
    const keyOf = member =>
      member.computed
        ? analysis.resolveString(member.property)
        : member.property.type === 'Identifier'
          ? member.property.name
          : null
    /* Headless origins: a @foldkit/ui module name, '*' for the package
       namespace, `{ barrel }` for a local namespace import, `{ view }` for
       an unstyled render export and `{ unresolved }` for an unknown key. */
    /* `export * as key from` in a local barrel: another barrel, the
       package namespace or a @foldkit/ui module. */
    const namespaceOwner = (barrel, key) => {
      const target = strict.modules.namespaceTarget(barrel, key)
      if (target === null) return undefined
      if (target.file !== undefined) return { barrel: target.file }
      const match = /^@foldkit\/ui(?:\/([^/]+))?$/u.exec(target.source)
      return match === null ? undefined : (match[1] ?? '*')
    }
    const memberOf = (owner, key) => {
      if (owner === undefined || owner.view || owner.unresolved)
        return undefined
      if (owner === '*') return key === null ? undefined : camel(key)
      if (typeof owner === 'string') {
        if (key === null) return { unresolved: true }
        return isFoldkitUiRenderExport(owner, key) ? { view: true } : undefined
      }
      if (key === null || strict === null) return undefined
      const origin = strict.modules.externalOrigin(owner.barrel, key)
      if (origin === null) return namespaceOwner(owner.barrel, key)
      const match =
        origin === null
          ? null
          : /^@foldkit\/ui(?:\/([^/]+))?$/u.exec(origin.source)
      if (match === null) return undefined
      if (match[1] === undefined) return camel(origin.name)
      return isFoldkitUiRenderExport(match[1], origin.name)
        ? { view: true }
        : undefined
    }
    /** Follows immutable aliases, destructuring and constant members. */
    const headlessOf = (node, depth = 0) => {
      node = unwrap(node)
      if (node === null || node === undefined || depth > 12) return undefined
      if (node.type === 'MemberExpression')
        return memberOf(headlessOf(node.object, depth + 1), keyOf(node))
      if (node.type !== 'Identifier') return undefined
      const variable = analysis.variableOf(node)
      if (headless.has(variable)) return headless.get(variable)
      const destructured = index.destructuring(variable)
      if (destructured !== null)
        return memberOf(
          headlessOf(destructured.init, depth + 1),
          destructured.key,
        )
      const init = analysis.constInit(node)
      return init === null ? undefined : headlessOf(init, depth + 1)
    }
    const headlessAccess = (node, outcome) => {
      if (outcome?.unresolved)
        report(
          node,
          `\`${context.sourceCode.getText(node)}\` reads a headless @foldkit/ui module with a key that cannot be resolved; it could select an unstyled view`,
        )
      else if (outcome?.view)
        report(
          node,
          `\`${context.sourceCode.getText(node)}\` is an unstyled headless view; use the installed Crease component that wraps it`,
        )
    }
    return {
      ImportDeclaration(node) {
        const source = node.source.value
        const specifiers = valueSpecifiers(node)
        if (node.importKind === 'type') return
        if (EXTERNAL_RENDERERS.some(pattern => pattern.test(source)))
          report(
            node,
            `'${source}' renders outside Foldkit's builder; register an adapter for it instead`,
          )
        const headlessImport = (specifier, origin, name) => {
          const match = /^@foldkit\/ui(?:\/([^/]+))?$/u.exec(origin)
          if (match === null) return
          const variable = analysis.variableOf(specifier.local)
          if (name === '*') {
            headless.set(variable, match[1] ?? '*')
            return
          }
          if (match[1] === undefined) headless.set(variable, camel(name))
          else if (isFoldkitUiRenderExport(match[1], name))
            report(
              specifier,
              `\`${name}\` from '${origin}' is an unstyled headless view; use the installed Crease component that wraps it`,
            )
        }
        const local =
          strict === null
            ? null
            : strict.modules.resolve(source, context.filename)
        for (const specifier of specifiers) {
          const name =
            specifier.type === 'ImportNamespaceSpecifier'
              ? '*'
              : (specifier.imported?.name ??
                specifier.imported?.value ??
                'default')
          if (local === null) {
            headlessImport(specifier, source, name)
            continue
          }
          if (name === '*') {
            headless.set(analysis.variableOf(specifier.local), {
              barrel: local,
            })
            continue
          }
          const origin = strict.modules.externalOrigin(local, name)
          if (origin !== null)
            headlessImport(specifier, origin.source, origin.name)
          else {
            const owner = namespaceOwner(local, name)
            if (owner !== undefined)
              headless.set(analysis.variableOf(specifier.local), owner)
          }
        }
      },
      MemberExpression(node) {
        const record = index.memberRecord(node)
        if (record?.visibility === 'implementation')
          implementationOnly(node, record)
        headlessAccess(node, headlessOf(node))
      },
      Property(node) {
        const pattern = node.parent
        const declarator = pattern.parent
        if (
          pattern.type !== 'ObjectPattern' ||
          declarator?.type !== 'VariableDeclarator' ||
          declarator.id !== pattern ||
          declarator.init === null
        )
          return
        const key = node.computed
          ? analysis.resolveString(node.key)
          : node.key.type === 'Identifier'
            ? node.key.name
            : String(node.key.value)
        headlessAccess(node, memberOf(headlessOf(declarator.init), key))
      },
      Program(node) {
        index.collect(node)
        for (const { record, specifier } of index.imports)
          if (record.visibility === 'implementation')
            implementationOnly(specifier, record)
      },
    }
  },
}

const CLASS_LIST_MUTATIONS = new Set(['add', 'remove', 'replace', 'toggle'])
const STYLE_MUTATIONS = new Set(['removeProperty', 'setProperty'])

export const noApplicationStyles = {
  meta: meta(
    'no-application-styles',
    'Disallow ad hoc class/style authoring, raw HTML, stylesheet imports and DOM style mutation in application views.',
  ),
  create(context) {
    const strict = strictContextOf(context)
    const role = fileRecord(strict, context.filename)?.role
    if (IMPLEMENTATION_ROLES.has(role)) return {}
    const behavior = role === 'behavior'
    const analysis = createFileAnalysis(context)
    const report = (node, message) =>
      context.report({
        message: `${message} Appearance belongs to installed components, named variants and theme tokens (no-application-styles).`,
        node,
      })
    const escapeMember = member => {
      if (member !== null && STYLE_ESCAPE_MEMBERS.has(member.name))
        report(member.node, `\`${member.name}\` authors appearance directly.`)
    }
    const handlers = {
      ImportDeclaration(node) {
        const source = node.source.value
        if (STYLE_MODULE.test(source)) {
          report(
            node,
            `Stylesheet '${source}' may only be imported from a registered setup file (crease.lock.json role "setup").`,
          )
          return
        }
        if (node.importKind === 'type') return
        if (node.specifiers.length > 0 && valueSpecifiers(node).length === 0)
          return
        if (RENDERER_AUTHORING_PACKAGES.some(pattern => pattern.test(source)))
          report(
            node,
            `'${source}' is a renderer authoring API reserved for registered component and theme files.`,
          )
        else if (
          !behavior &&
          CLASS_HELPER_PACKAGES.some(pattern => pattern.test(source))
        )
          report(node, `'${source}' composes ad hoc class names.`)
      },
    }
    if (behavior) return handlers
    return {
      ...handlers,
      AssignmentExpression(node) {
        const target = node.left
        if (target.type !== 'MemberExpression') return
        const name = target.computed
          ? analysis.resolveString(target.property)
          : target.property.name
        const parent =
          target.object.type === 'MemberExpression' && !target.object.computed
            ? target.object.property.name
            : undefined
        if (
          (['innerHTML', 'outerHTML', 'className', 'style'].includes(name) ||
            parent === 'style') &&
          analysis.isDomMember(parent === 'style' ? target.object : target)
        )
          report(
            node,
            `Assigning \`${parent === 'style' ? `style.${name}` : name}\` mutates DOM appearance outside the component contracts.`,
          )
        else if (
          parent !== 'style' &&
          analysis.domReceiverKind(target.object) === 'style'
        )
          report(
            node,
            `Assigning \`${context.sourceCode.getText(target)}\` mutates a DOM style declaration outside the component contracts.`,
          )
      },
      CallExpression(node) {
        const member = analysis.calleeMember(node.callee)
        if (member !== null && NAMED_ATTRIBUTE_MEMBERS.has(member.name)) {
          const name = analysis.resolveString(node.arguments[0])
          if (name === null)
            report(
              node,
              `\`${member.name}\` is called with an attribute name that cannot be resolved; it could set class or style.`,
            )
          else if (STYLE_ATTRIBUTE_NAMES.has(name.toLowerCase()))
            report(
              node,
              `\`${member.name}('${name}', …)\` recreates a styling attribute.`,
            )
          return
        }
        const callee = node.callee
        if (callee.type !== 'MemberExpression' || callee.computed) return
        const method = callee.property.name
        if (method === 'setAttribute') {
          if (!analysis.isDomMember(callee)) return
          const name = analysis.resolveString(node.arguments[0])
          if (name === null || STYLE_ATTRIBUTE_NAMES.has(name.toLowerCase()))
            report(
              node,
              '`setAttribute` with a class/style (or unresolvable) name mutates DOM appearance.',
            )
        } else if (method === 'insertAdjacentHTML') {
          report(node, '`insertAdjacentHTML` injects raw HTML.')
        } else if (
          CLASS_LIST_MUTATIONS.has(method) &&
          analysis.domReceiverKind(callee.object) === 'classList'
        ) {
          report(
            node,
            '`classList` mutation restyles DOM outside the component contracts.',
          )
        } else if (
          STYLE_MUTATIONS.has(method) &&
          analysis.domReceiverKind(callee.object) === 'style'
        ) {
          report(
            node,
            `\`${method}\` on a DOM style declaration restyles DOM outside the component contracts.`,
          )
        } else if (
          ['createElement', 'createElementNS'].includes(method) &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'document' &&
          analysis.variableOf(callee.object)?.defs.length === 0
        ) {
          report(
            node,
            '`document.createElement` builds DOM outside Foldkit; use an adapter.',
          )
        }
      },
      MemberExpression(node) {
        escapeMember(analysis.builderMember(node))
      },
      Property(node) {
        if (node.parent.type === 'ObjectPattern')
          escapeMember(analysis.destructuredMember(node))
      },
    }
  },
}

const contractRule = (rule, kind, description) => ({
  meta: meta(rule, description),
  create(context) {
    const strict = strictContextOf(context)
    const analysis = createFileAnalysis(context)
    const index = createComponentIndex(context, strict, analysis)
    const raw = fileRecord(strict, context.filename)?.rawRendering === true
    const report = (node, message) =>
      context.report({ message: `${message} (${rule})`, node })
    const handlers = {
      MemberExpression(node) {
        if (kind === 'unverifiable' && index.unresolvedMember(node))
          report(
            node,
            `\`${context.sourceCode.getText(node)}\` selects a component with a key that cannot be resolved; its UI contract cannot be verified.`,
          )
      },
      Property(node) {
        if (
          kind === 'unverifiable' &&
          node.parent.type === 'ObjectPattern' &&
          node.value?.type === 'Identifier' &&
          index.unresolvedDestructuring(node.value)
        )
          report(
            node,
            `\`${context.sourceCode.getText(node)}\` destructures a component with a key that cannot be resolved; its UI contract cannot be verified.`,
          )
      },
      CallExpression(node) {
        const record = index.callRecord(node.callee)
        if (record !== undefined && record.renderKind === 'helper')
          for (const finding of analyzeCall({
            analysis,
            call: node,
            context,
            record,
            strict,
          }))
            if (finding.kind === kind) report(finding.node, finding.message)
      },
      Program(node) {
        index.collect(node)
        if (kind !== 'unverifiable') return
        if (strict === null)
          report(
            node,
            'Crease strict settings are missing; configure this rule through creaseui() from @creaseui/lint.',
          )
        else if (strict.typeInformation === 'required' && !analysis.hasTypes)
          report(
            node,
            `Type information is unavailable for this file, so builder and component bindings cannot be proven. Include it in ${strict.tsconfig ?? 'a tsconfig'} for typed linting (parserOptions.projectService).`,
          )
      },
    }
    if (kind !== 'unverifiable' || raw) return handlers
    return {
      ...handlers,
      CallExpression(node) {
        handlers.CallExpression(node)
        const member = analysis.calleeMember(node.callee)
        if (
          member?.name === 'keyed' &&
          analysis.resolveString(node.arguments[0]) === null
        )
          report(
            node,
            '`keyed` is called with a tag that cannot be resolved to a classified element.',
          )
      },
      MemberExpression(node) {
        handlers.MemberExpression(node)
        const member = analysis.builderMember(node)
        if (member === null) return
        if (member.name === null)
          report(
            node,
            `Computed builder access \`${context.sourceCode.getText(node)}\` cannot be resolved to a classified element or attribute.`,
          )
        else if (isTagLike(member.name) && tagCategory(member.name) === null)
          report(
            node,
            `\`${member.name}\` is not a classified Foldkit element.`,
          )
      },
      Property(node) {
        handlers.Property(node)
        if (node.parent.type !== 'ObjectPattern') return
        const member = analysis.destructuredMember(node)
        if (member?.rest === true)
          report(
            node,
            'A rest pattern over the builder hides which elements are rendered.',
          )
        else if (member !== null && member.name === null)
          report(
            node,
            'A computed builder destructuring key cannot be resolved.',
          )
      },
      RestElement(node) {
        handlers.Property?.(node)
        if (node.parent.type !== 'ObjectPattern') return
        const member = analysis.destructuredMember(node)
        if (member?.rest === true)
          report(
            node,
            'A rest pattern over the builder hides which elements are rendered.',
          )
      },
    }
  },
})

export const componentContract = contractRule(
  'component-contract',
  'violation',
  'Disallow appearance overrides, non-placement layout values, invalid variants and string children on installed components.',
)
export const noUnverifiableUi = contractRule(
  'no-unverifiable-ui',
  'unverifiable',
  'Report UI contracts that cannot be resolved: computed builder access, opaque or asserted props, missing type information.',
)

export const strictRules = {
  'component-contract': componentContract,
  'no-application-styles': noApplicationStyles,
  'no-raw-composition': noRawComposition,
  'no-raw-controls': noRawControls,
  'no-unapproved-renderer': noUnapprovedRenderer,
  'no-unverifiable-ui': noUnverifiableUi,
}
