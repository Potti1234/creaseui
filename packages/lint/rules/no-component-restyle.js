import {
  createFoldkitTracker,
  splitClasses,
  staticValues,
} from '../lib/foldkit-sites.js'

const CATEGORIES = {
  // Margin places a component in its parent and is therefore layout.
  // Padding, gap, and space alter the component's owned internal rhythm.
  spacing: /^(?:-)?(?:p[trblxy]?|gap|space-[xy])-/u,
  motion: /^(?:animate|delay|duration|ease|transition|origin|rotate|scale|skew|translate)-/u,
  effects: /^(?:shadow|opacity|mix-blend|bg-blend|filter|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|ring|outline)-/u,
  shape: /^(?:rounded|border(?:-[trblxy])?)-(?!color)/u,
  typography: /^(?:text-(?:xs|sm|base|lg|xl|[2-9]xl|left|center|right|justify|start|end|wrap|nowrap|balance|pretty)|font|leading|tracking|whitespace|break|hyphens|line-clamp|list|decoration|underline|uppercase|lowercase|capitalize|normal-case|italic|not-italic|antialiased|subpixel-antialiased)/u,
  color: /^(?:bg|text|border|divide|outline|ring|fill|stroke|caret|accent|decoration)-(?!clip|center|left|right|justify|wrap|nowrap|ellipsis)/u,
}
const categoryOf = className => {
  const base = className.split(':').at(-1)?.replace(/^!/u, '') ?? className
  for (const [category, pattern] of Object.entries(CATEGORIES)) {
    if (pattern.test(base)) return category
  }
  return 'layout'
}

const glob = entry => new RegExp(`^${entry.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&').replaceAll('\\*', '.*')}$`, 'u')

const allowed = (token, entries) => {
  const category = categoryOf(token)
  return entries.some(entry => entry === category || entry === token || (entry.includes('*') && glob(entry).test(token)))
}

const policyFor = (component, options) => {
  let policy = { allow: options.allow ?? ['layout'], deny: options.deny ?? [], message: options.message }
  for (const contract of options.contracts ?? []) {
    if (new RegExp(contract.pattern, 'u').test(component)) {
      policy = {
        allow: contract.allow ?? policy.allow,
        deny: contract.deny ?? policy.deny,
        message: contract.message ?? policy.message,
      }
    }
  }
  return policy
}

export const noComponentRestyle = {
  meta: {
    type: 'problem',
    docs: { description: 'Keep appearance inside Foldkit design-system components and named variants.' },
    schema: [{
      type: 'object',
      properties: {
        allow: { type: 'array', items: { type: 'string' } },
        deny: { type: 'array', items: { type: 'string' } },
        componentImports: { type: 'array', items: { type: 'string' } },
        ignoreImports: { type: 'array', items: { type: 'string' } },
        contracts: { type: 'array', items: { type: 'object' } },
        message: { type: 'string' },
      },
      additionalProperties: false,
    }],
    messages: {
      forbidden: '"{{className}}" is not allowed on {{component}}(). {{guidance}}',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const tracker = createFoldkitTracker(options)
    return {
      ImportDeclaration: tracker.collectImport,
      VariableDeclarator: tracker.collectVariable,
      CallExpression(node) {
        const call = tracker.componentCall(node)
        const classValue = call?.properties.get('class')
        if (call === null || classValue === undefined) return
        const policy = policyFor(call.component, options)
        const values = staticValues(classValue, tracker.variables)
        for (const token of values.strings.flatMap(splitClasses)) {
          if (allowed(token, policy.deny) || !allowed(token, policy.allow)) {
            const category = categoryOf(token)
            const guidance = policy.message ?? (
              category === 'spacing'
                ? 'Use a size prop for internal spacing, or margin/gap on the parent.'
                : category === 'layout'
                  ? `Its contract allows ${policy.allow.join(', ') || 'no class overrides'}; place layout on a parent.`
                  : `Use an existing variant or add a reviewed ${category} variant in ${call.source}.`
            )
            context.report({
              node: classValue,
              messageId: 'forbidden',
              data: { className: token, component: call.component, guidance },
            })
          }
        }
      },
    }
  },
}
