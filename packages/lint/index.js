import { plugin as shadcn } from '@shadcn/lint'
import stylexPlugin from '@stylexjs/eslint-plugin'

import { noComponentRestyle } from './rules/no-component-restyle.js'
import { noFoldkitInlineStyle } from './rules/no-foldkit-inline-style.js'
import { noStylexEscape } from './rules/no-stylex-escape.js'
import { preferCompositionPrimitives } from './rules/prefer-composition-primitives.js'
import { requireStaticClass } from './rules/require-static-class.js'
import { stylexComponentContract } from './rules/stylex-component-contract.js'

export const rules = {
  'no-component-restyle': noComponentRestyle,
  'no-foldkit-inline-style': noFoldkitInlineStyle,
  'no-stylex-escape': noStylexEscape,
  'prefer-composition-primitives': preferCompositionPrimitives,
  'require-static-class': requireStaticClass,
  'stylex-component-contract': stylexComponentContract,
}

export const plugin = {
  meta: { name: '@creaseui/lint', version: '0.1.0' },
  rules,
}

const severityOf = severity => severity ?? 'error'

export const tailwind = (options = {}) => {
  const severity = severityOf(options.severity)
  const componentImports = options.componentImports ?? ['^@/ui(?:/|$)']
  const shared = {
    componentImports,
    ignoreImports: options.ignoreImports ?? [],
  }
  return {
    name: '@creaseui/lint/tailwind',
    files: options.files ?? ['**/*.{js,jsx,ts,tsx}'],
    ignores: options.ignores ?? [],
    plugins: { crease: plugin, shadcn },
    settings: {
      shadcn: {
        componentImports,
        note: options.note ?? 'See the Crease design-system lint documentation for approved exceptions.',
      },
    },
    rules: {
      'crease/no-component-restyle': options.restyle === false ? 'off' : [severity, {
        ...shared,
        allow: options.allow ?? ['layout'],
        contracts: options.contracts ?? [],
      }],
      'crease/require-static-class': options.staticClasses === false ? 'off' : [severity, shared],
      'crease/no-foldkit-inline-style': options.inlineStyles === 'forbid' ? severity : 'off',
      'shadcn/no-raw-colors': options.rawColors === false ? 'off' : [severity, { scanAllStrings: true }],
      'shadcn/no-arbitrary-values': options.arbitraryValues === false ? 'off' : [severity, {
        allow: options.arbitraryValueAllow ?? [],
        scanAllStrings: true,
      }],
    },
  }
}

export const stylex = (options = {}) => {
  const severity = severityOf(options.severity)
  return {
    name: '@creaseui/lint/stylex',
    files: options.files ?? ['**/*.{js,jsx,ts,tsx}'],
    ignores: options.ignores ?? [],
    plugins: { '@stylexjs': stylexPlugin, crease: plugin },
    rules: {
      '@stylexjs/enforce-extension': [severity, {
        enforceDefineConstsExtension: true,
        legacyAllowMixedExports: false,
        themeFileExtension: '.stylex',
      }],
      '@stylexjs/no-legacy-contextual-styles': severity,
      '@stylexjs/no-lookahead-selectors': severity,
      '@stylexjs/no-nonstandard-styles': severity,
      '@stylexjs/no-conflicting-props': severity,
      '@stylexjs/no-unused': severity,
      '@stylexjs/sort-keys': [severity, {
        allowLineSeparatedGroups: false,
        minKeys: 2,
        order: 'default',
      }],
      '@stylexjs/valid-shorthands': [severity, {
        allowImportant: false,
        preferInline: true,
      }],
      '@stylexjs/valid-styles': [severity, {
        allowOuterPseudoAndMedia: false,
        allowRawCSSVars: false,
        banPropsForLegacy: false,
        propLimits: options.propLimits ?? {},
        styleResolution: options.styleResolution ?? 'property-specificity',
      }],
      'crease/no-foldkit-inline-style': options.inlineStyles === 'forbid' ? severity : 'off',
      'crease/stylex-component-contract': [severity, {
        componentImports: options.componentImports ?? ['^@/stylex(?:/|$)'],
        ignoreImports: options.ignoreImports ?? [],
        layoutProperties: options.layoutProperties ?? ['layoutStyle', '*LayoutStyle'],
      }],
      'crease/no-stylex-escape': [severity, {
        allowCreateIn: options.allowCreateIn ?? ['.*'],
        allowPropsIn: options.allowPropsIn ?? ['.*'],
      }],
    },
  }
}

export const constrainedStylex = (options = {}) => ({
  name: '@creaseui/lint/stylex-constrained',
  files: options.files ?? [],
  plugins: { crease: plugin },
  rules: {
    'crease/no-stylex-escape': ['error', { allowCreateIn: [], allowPropsIn: [] }],
    'crease/no-foldkit-inline-style': 'error',
    'crease/prefer-composition-primitives': 'error',
  },
})

export default plugin
