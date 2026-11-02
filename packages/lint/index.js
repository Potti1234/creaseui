import { plugin as shadcn } from '@shadcn/lint'
import stylexPlugin from '@stylexjs/eslint-plugin'

import { defensiveAutoFillNotFit } from './rules/defensive-auto-fill-not-fit.js'
import { defensiveBackgroundRepeat } from './rules/defensive-background-repeat.js'
import { defensiveBgImageFallback } from './rules/defensive-bg-image-fallback.js'
import { defensiveCssVarFallback } from './rules/defensive-css-var-fallback.js'
import { defensiveFlexMinSize } from './rules/defensive-flex-min-size.js'
import { defensiveHoverMedia } from './rules/defensive-hover-media.js'
import { defensiveImageObjectFit } from './rules/defensive-image-object-fit.js'
import { defensiveInputFontSize } from './rules/defensive-input-font-size.js'
import { defensiveNoSpaceBetweenWrap } from './rules/defensive-no-space-between-wrap.js'
import { defensiveOverscrollContain } from './rules/defensive-overscroll-contain.js'
import { defensivePreferMinSize } from './rules/defensive-prefer-min-size.js'
import { defensivePreferOverflowAuto } from './rules/defensive-prefer-overflow-auto.js'
import { defensiveStickyGridAlign } from './rules/defensive-sticky-grid-align.js'
import { formAssociation } from './rules/form-association.js'
import { noComponentRestyle } from './rules/no-component-restyle.js'
import { noNativeGlyphs } from './rules/no-native-glyphs.js'
import { noFoldkitInlineStyle } from './rules/no-foldkit-inline-style.js'
import { noStylexEscape } from './rules/no-stylex-escape.js'
import { pleatPropLimits } from './rules/pleat-prop-limits.js'
import { preferCompositionPrimitives } from './rules/prefer-composition-primitives.js'
import { requireStaticClass } from './rules/require-static-class.js'
import { strictRules } from './rules/strict/index.js'
import { stylexComponentContract } from './rules/stylex-component-contract.js'

export { STRICT_RULE_IDS, creaseui } from './creaseui.js'
export { CreaseConfigError } from './lib/strict/ownership.js'
export { createStrictContext } from './lib/strict/context.js'

export const DEFENSIVE_ERROR_RULE_IDS = [
  'defensive-prefer-overflow-auto',
  'defensive-no-space-between-wrap',
  'defensive-auto-fill-not-fit',
  'defensive-hover-media',
  'defensive-bg-image-fallback',
  'defensive-background-repeat',
  'defensive-css-var-fallback',
]

export const DEFENSIVE_WARN_RULE_IDS = [
  'defensive-flex-min-size',
  'defensive-image-object-fit',
  'defensive-input-font-size',
  'defensive-sticky-grid-align',
  'defensive-overscroll-contain',
  'defensive-prefer-min-size',
]

/* The fourteenth defensive check (scrollbar-gutter on html/body/:root) is
   expressible only in stylesheet selectors; it lives in the css audit. */
export const DEFENSIVE_CSS_RULE_IDS = ['defensive-scrollbar-gutter']

/* options.defensive: false disables the whole family; { off: [...rule-ids] }
   disables individual rules (e.g. prefer-min-size in a component library
   whose control geometry is intentionally fixed). */
export const defensiveEntries = (severity, options = {}, shared = {}) => {
  const defensive = options.defensive
  if (defensive === false) return {}
  const off = new Set(defensive?.off ?? [])
  return {
    ...Object.fromEntries(
      DEFENSIVE_ERROR_RULE_IDS.filter(id => !off.has(id)).map(id => [
        `crease/${id}`,
        [severity, shared],
      ]),
    ),
    ...Object.fromEntries(
      DEFENSIVE_WARN_RULE_IDS.filter(id => !off.has(id)).map(id => [
        `crease/${id}`,
        ['warn', shared],
      ]),
    ),
  }
}

export const rules = {
  'defensive-auto-fill-not-fit': defensiveAutoFillNotFit,
  'defensive-background-repeat': defensiveBackgroundRepeat,
  'defensive-bg-image-fallback': defensiveBgImageFallback,
  'defensive-css-var-fallback': defensiveCssVarFallback,
  'defensive-flex-min-size': defensiveFlexMinSize,
  'defensive-hover-media': defensiveHoverMedia,
  'defensive-image-object-fit': defensiveImageObjectFit,
  'defensive-input-font-size': defensiveInputFontSize,
  'defensive-no-space-between-wrap': defensiveNoSpaceBetweenWrap,
  'defensive-overscroll-contain': defensiveOverscrollContain,
  'defensive-prefer-min-size': defensivePreferMinSize,
  'defensive-prefer-overflow-auto': defensivePreferOverflowAuto,
  'defensive-sticky-grid-align': defensiveStickyGridAlign,
  'form-association': formAssociation,
  'no-component-restyle': noComponentRestyle,
  'no-foldkit-inline-style': noFoldkitInlineStyle,
  'no-native-glyphs': noNativeGlyphs,
  'no-stylex-escape': noStylexEscape,
  'pleat-prop-limits': pleatPropLimits,
  'prefer-composition-primitives': preferCompositionPrimitives,
  'require-static-class': requireStaticClass,
  'stylex-component-contract': stylexComponentContract,
  ...strictRules,
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
        note:
          options.note ??
          'See the Crease design-system lint documentation for approved exceptions.',
      },
    },
    rules: {
      'crease/form-association': severity,
      'crease/no-native-glyphs':
        options.nativeGlyphs === false ? 'off' : severity,
      'crease/no-component-restyle':
        options.restyle === false
          ? 'off'
          : [
              severity,
              {
                ...shared,
                allow: options.allow ?? ['layout'],
                contracts: options.contracts ?? [],
              },
            ],
      'crease/require-static-class':
        options.staticClasses === false ? 'off' : [severity, shared],
      'crease/no-foldkit-inline-style':
        options.inlineStyles === 'forbid' ? severity : 'off',
      'shadcn/no-raw-colors':
        options.rawColors === false
          ? 'off'
          : [severity, { scanAllStrings: true }],
      'shadcn/no-arbitrary-values':
        options.arbitraryValues === false
          ? 'off'
          : [
              severity,
              {
                allow: options.arbitraryValueAllow ?? [],
                scanAllStrings: true,
              },
            ],
      ...defensiveEntries(severity, options, shared),
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
      'crease/form-association': severity,
      'crease/no-native-glyphs':
        options.nativeGlyphs === false ? 'off' : severity,
      '@stylexjs/enforce-extension': [
        severity,
        {
          enforceDefineConstsExtension: true,
          legacyAllowMixedExports: false,
          themeFileExtension: '.stylex',
        },
      ],
      '@stylexjs/no-legacy-contextual-styles': severity,
      '@stylexjs/no-lookahead-selectors': severity,
      '@stylexjs/no-nonstandard-styles': severity,
      '@stylexjs/no-conflicting-props': severity,
      '@stylexjs/no-unused': severity,
      '@stylexjs/sort-keys': [
        severity,
        {
          allowLineSeparatedGroups: false,
          minKeys: 2,
          order: 'default',
        },
      ],
      '@stylexjs/valid-shorthands': [
        severity,
        {
          allowImportant: false,
          preferInline: true,
        },
      ],
      '@stylexjs/valid-styles': [
        severity,
        {
          allowOuterPseudoAndMedia: false,
          allowRawCSSVars: false,
          banPropsForLegacy: false,
          propLimits: options.propLimits ?? {},
          styleResolution: options.styleResolution ?? 'property-specificity',
        },
      ],
      'crease/no-foldkit-inline-style':
        options.inlineStyles === 'forbid' ? severity : 'off',
      'crease/stylex-component-contract': [
        severity,
        {
          componentImports: options.componentImports ?? ['^@/stylex(?:/|$)'],
          ignoreImports: options.ignoreImports ?? [],
          layoutProperties: options.layoutProperties ?? [
            'layoutStyle',
            '*LayoutStyle',
          ],
        },
      ],
      'crease/no-stylex-escape': [
        severity,
        {
          allowCreateIn: options.allowCreateIn ?? ['.*'],
          allowPropsIn: options.allowPropsIn ?? ['.*'],
        },
      ],
      ...defensiveEntries(severity, options, {
        componentImports: options.componentImports ?? ['^@/stylex(?:/|$)'],
        ignoreImports: options.ignoreImports ?? [],
      }),
    },
  }
}

export const pleat = (options = {}) => {
  const severity = severityOf(options.severity)
  return {
    name: '@creaseui/lint/pleat',
    files: options.files ?? ['**/*.{js,jsx,ts,tsx}'],
    ignores: options.ignores ?? [],
    plugins: { crease: plugin },
    rules: {
      'crease/form-association': severity,
      'crease/no-native-glyphs':
        options.nativeGlyphs === false ? 'off' : severity,
      'crease/no-foldkit-inline-style':
        options.inlineStyles === 'forbid' ? severity : 'off',
      'crease/pleat-prop-limits': [
        severity,
        {
          propLimits: options.propLimits ?? {},
          tokenFiles: options.tokenFiles ?? [],
        },
      ],
      'crease/stylex-component-contract': [
        severity,
        {
          componentImports: options.componentImports ?? ['^@/pleat(?:/|$)'],
          ignoreImports: options.ignoreImports ?? [],
          layoutConstructors: options.layoutConstructors ?? ['layoutStyle'],
          layoutProperties: options.layoutProperties ?? [
            'layoutStyle',
            '*LayoutStyle',
          ],
        },
      ],
      ...defensiveEntries(severity, options, {
        componentImports: options.componentImports ?? ['^@/pleat(?:/|$)'],
        ignoreImports: options.ignoreImports ?? [],
      }),
    },
  }
}

export const constrainedStylex = (options = {}) => ({
  name: '@creaseui/lint/stylex-constrained',
  files: options.files ?? [],
  plugins: { crease: plugin },
  rules: {
    'crease/no-stylex-escape': [
      'error',
      { allowCreateIn: [], allowPropsIn: [] },
    ],
    'crease/no-foldkit-inline-style': 'error',
    'crease/prefer-composition-primitives': 'error',
  },
})

export default plugin
