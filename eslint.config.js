import tseslint from 'typescript-eslint'
import stylexPlugin from '@stylexjs/eslint-plugin'

import { stylexStyleResolution } from './stylex.config.js'

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
  {
    files: [
      'src/stylex/**/*.{ts,tsx}',
      'src/demo/board-stylex.{ts,tsx}',
        'src/demo/stylex-cards/**/*.{ts,tsx}',
        'src/demo/blocks-stylex/**/*.{ts,tsx}',
    ],
    plugins: {
      '@stylexjs': stylexPlugin,
    },
    rules: {
      '@stylexjs/enforce-extension': [
        'error',
        {
          enforceDefineConstsExtension: true,
          legacyAllowMixedExports: false,
          themeFileExtension: '.stylex',
        },
      ],
      '@stylexjs/no-legacy-contextual-styles': 'error',
      '@stylexjs/no-lookahead-selectors': 'error',
      '@stylexjs/no-nonstandard-styles': 'error',
      '@stylexjs/no-conflicting-props': 'error',
      '@stylexjs/no-unused': 'error',
      '@stylexjs/sort-keys': [
        'error',
        {
          allowLineSeparatedGroups: false,
          minKeys: 2,
          order: 'default',
        },
      ],
      '@stylexjs/valid-shorthands': [
        'error',
        {
          allowImportant: false,
          preferInline: true,
        },
      ],
      '@stylexjs/valid-styles': [
        'error',
        {
          allowOuterPseudoAndMedia: false,
          allowRawCSSVars: false,
          banPropsForLegacy: false,
          propLimits: {
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
          },
          styleResolution: stylexStyleResolution,
        },
      ],
    },
  },
)
