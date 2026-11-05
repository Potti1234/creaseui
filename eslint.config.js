import tseslint from 'typescript-eslint'
import {
  constrainedStylex,
  pleat as creasePleat,
  stylex as creaseStylex,
  tailwind as creaseTailwind,
} from '@creaseui/lint'

import { stylexStyleResolution } from './stylex.config.js'

/* Heuristic defensive-css rules kept off in demo/docs reference copies —
   those files mirror upstream examples verbatim. src/ui keeps the fixable
   subset (flex-min-size, image-object-fit, sticky-grid-align,
   overscroll-contain) on; prefer-min-size and input-font-size are exempted
   everywhere creaseui ships components (compact controls are deliberate). */
const DEFENSIVE_WARN_RULES = [
  'defensive-flex-min-size',
  'defensive-image-object-fit',
  'defensive-input-font-size',
  'defensive-overscroll-contain',
  'defensive-prefer-min-size',
  'defensive-sticky-grid-align',
]

export const stylexPropLimits = {
  '*Color': {
    limit: ['transparent', 'currentColor'],
    reason: 'Use a semantic token from tokens.stylex.ts for colors.',
  },
  color: {
    limit: ['transparent', 'currentColor'],
    reason: 'Use a semantic token from tokens.stylex.ts for colors.',
  },
  fill: {
    limit: ['none', 'transparent', 'currentColor'],
    reason: 'Use a semantic token from tokens.stylex.ts for SVG paint.',
  },
  stroke: {
    limit: ['none', 'transparent', 'currentColor'],
    reason: 'Use a semantic token from tokens.stylex.ts for SVG paint.',
  },
  borderRadius: {
    limit: ['0px', '50%'],
    reason: 'Use a shared radius token from tokens.stylex.ts.',
  },
  boxShadow: {
    limit: ['none'],
    reason: 'Use a shared shadow token from tokens.stylex.ts.',
  },
  animationDuration: {
    limit: [],
    reason:
      'Use a semantic motion token from interaction-tokens.stylex.const.ts.',
  },
  animationTimingFunction: {
    limit: [],
    reason:
      'Use a semantic easing token from interaction-tokens.stylex.const.ts.',
  },
  transitionDuration: {
    limit: [],
    reason:
      'Use a semantic motion token from interaction-tokens.stylex.const.ts.',
  },
  transitionTimingFunction: {
    limit: [],
    reason:
      'Use a semantic easing token from interaction-tokens.stylex.const.ts.',
  },
  cursor: {
    limit: [],
    reason:
      'Use a semantic cursor token from interaction-tokens.stylex.const.ts.',
  },
}

export const pleatPropLimits = Object.fromEntries(
  Object.entries(stylexPropLimits).map(([property, spec]) => [
    property,
    {
      ...spec,
      reason: spec.reason
        .replace(
          'interaction-tokens.stylex.const.ts',
          'src/pleat/interaction-tokens.ts',
        )
        .replace('tokens.stylex.ts', 'src/pleat/tokens.ts'),
    },
  ]),
)

export default tseslint.config(
  {
    ignores: [
      '.registry/**',
      '.registry-validation/**',
      'dist/**',
      'node_modules/**',
      // Vendored tutorial essay source (see src/docs/tutorial): ported
      // verbatim, includes generated artifacts like a sample eslint.config.js.
      'src/docs/tutorial/guide/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "TSAsExpression > TSAsExpression[typeAnnotation.type='TSUnknownKeyword']",
          message:
            'Do not bypass type safety with `as unknown as`; model the conversion explicitly.',
        },
      ],
    },
  },
  creaseTailwind({
    files: ['src/ui/**/*.{ts,tsx}'],
    arbitraryValues: false,
    restyle: false,
    staticClasses: false,
    /* creaseui's compact controls intentionally use sub-16px text
       (input-font-size) and fixed control geometry (prefer-min-size). */
    defensive: {
      off: ['defensive-input-font-size', 'defensive-prefer-min-size'],
    },
  }),
  creaseTailwind({
    files: [
      'src/demo/**/*.{ts,tsx}',
      'src/docs/components/pages/**/tailwind.{ts,tsx}',
    ],
    ignores: [
      'src/demo/**/*stylex*/**',
      'src/demo/**/*stylex*.{ts,tsx}',
      'src/demo/**/*pleat*/**',
      'src/demo/**/*pleat*.{ts,tsx}',
      'src/demo/board-constrained.{ts,tsx}',
    ],
    severity: 'warn',
    /* Reference copies: the heuristic warn tier is advisory-only here. */
    defensive: { off: DEFENSIVE_WARN_RULES },
    contracts: [
      {
        pattern: '(Content|Footer|Header|Group|Item|Panel|Row)$',
        allow: ['layout', 'spacing'],
      },
      { pattern: '^(Avatar|Icon)', allow: ['layout', 'size-*'] },
    ],
  }),
  creaseStylex({
    files: ['src/stylex/**/*.{ts,tsx}'],
    /* creaseui's compact controls intentionally use sub-16px text
       (input-font-size) and fixed control geometry (prefer-min-size). */
    defensive: {
      off: ['defensive-input-font-size', 'defensive-prefer-min-size'],
    },
    propLimits: stylexPropLimits,
    styleResolution: stylexStyleResolution,
  }),
  creaseStylex({
    files: [
      'src/demo/board-stylex.{ts,tsx}',
      'src/demo/stylex-cards/**/*.{ts,tsx}',
      'src/demo/blocks-stylex/**/*.{ts,tsx}',
      'src/demo/charts-stylex/**/*.{ts,tsx}',
    ],
    propLimits: stylexPropLimits,
    severity: 'warn',
    styleResolution: stylexStyleResolution,
    defensive: { off: DEFENSIVE_WARN_RULES },
  }),
  creaseStylex({
    files: ['src/docs/components/pages/**/stylex.{ts,tsx}'],
    propLimits: {},
    severity: 'warn',
    styleResolution: stylexStyleResolution,
    defensive: { off: DEFENSIVE_WARN_RULES },
  }),
  creasePleat({
    files: ['src/pleat/**/*.{ts,tsx}'],
    defensive: {
      off: ['defensive-input-font-size', 'defensive-prefer-min-size'],
    },
    propLimits: pleatPropLimits,
    tokenFiles: [
      '/foundations',
      '/tokens',
      '/theme',
      '/markers',
      '/reset',
      '/composition/',
    ],
  }),
  creasePleat({
    files: [
      'src/demo/board-pleat.{ts,tsx}',
      'src/demo/pleat-cards/**/*.{ts,tsx}',
      'src/demo/blocks-pleat/**/*.{ts,tsx}',
      'src/demo/charts-pleat/**/*.{ts,tsx}',
    ],
    propLimits: pleatPropLimits,
    severity: 'warn',
    tokenFiles: [
      '/foundations',
      '/tokens',
      '/theme',
      '/markers',
      '/reset',
      '/composition/',
    ],
    defensive: { off: DEFENSIVE_WARN_RULES },
  }),
  creasePleat({
    files: ['src/docs/components/pages/**/pleat.{ts,tsx}'],
    propLimits: {},
    severity: 'warn',
    defensive: { off: DEFENSIVE_WARN_RULES },
  }),
  constrainedStylex({ files: ['src/demo/board-constrained.{ts,tsx}'] }),
)
