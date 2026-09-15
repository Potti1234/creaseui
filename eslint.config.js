import tseslint from 'typescript-eslint'
import {
  constrainedStylex,
  stylex as creaseStylex,
  tailwind as creaseTailwind,
} from '@creaseui/lint'

import { stylexStyleResolution } from './stylex.config.js'

const stylexPropLimits = {
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
    reason: 'Use a semantic motion token from interaction-tokens.stylex.const.ts.',
  },
  animationTimingFunction: {
    limit: [],
    reason: 'Use a semantic easing token from interaction-tokens.stylex.const.ts.',
  },
  transitionDuration: {
    limit: [],
    reason: 'Use a semantic motion token from interaction-tokens.stylex.const.ts.',
  },
  transitionTimingFunction: {
    limit: [],
    reason: 'Use a semantic easing token from interaction-tokens.stylex.const.ts.',
  },
  cursor: {
    limit: [],
    reason: 'Use a semantic cursor token from interaction-tokens.stylex.const.ts.',
  },
}

export default tseslint.config(
  {
    ignores: ['.registry/**', '.registry-validation/**', 'dist/**', 'node_modules/**'],
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
  }),
  creaseTailwind({
    files: [
      'src/demo/**/*.{ts,tsx}',
      'src/docs/components/pages/**/tailwind.{ts,tsx}',
    ],
    ignores: [
      'src/demo/**/*stylex*/**',
      'src/demo/**/*stylex*.{ts,tsx}',
      'src/demo/board-constrained.{ts,tsx}',
    ],
    severity: 'warn',
    contracts: [
      { pattern: '(Content|Footer|Header|Group|Item|Panel|Row)$', allow: ['layout', 'spacing'] },
      { pattern: '^(Avatar|Icon)', allow: ['layout', 'size-*'] },
    ],
  }),
  creaseStylex({
    files: [
      'src/stylex/**/*.{ts,tsx}',
      'src/demo/board-stylex.{ts,tsx}',
      'src/demo/stylex-cards/**/*.{ts,tsx}',
      'src/demo/blocks-stylex/**/*.{ts,tsx}',
      'src/demo/charts-stylex/**/*.{ts,tsx}',
    ],
    propLimits: stylexPropLimits,
    styleResolution: stylexStyleResolution,
  }),
  creaseStylex({
    files: ['src/docs/components/pages/**/stylex.{ts,tsx}'],
    propLimits: {},
    severity: 'warn',
    styleResolution: stylexStyleResolution,
  }),
  constrainedStylex({ files: ['src/demo/board-constrained.{ts,tsx}'] }),
)
