import { RuleTester } from 'eslint'

import { noNativeGlyphs } from '../rules/no-native-glyphs.js'

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
})

const view = children => `export const view = h => h.div([], [${children}])`

tester.run('crease/no-native-glyphs', noNativeGlyphs, {
  valid: [
    // Plain text.
    view(`'Next page'`),
    // Keyboard modifiers are kbd text, not icons.
    view(`'Press ⌘K to search'`),
    view(`'⌥⇧⌃⌫⎋'`),
    // Box-drawing diagrams in docs strings.
    view(`'Child\\n├── Grandchild\\n└── Last'`),
    // Icons via the component are the point of the rule.
    view(`Icon.arrowUpRight({ class: 'size-4' }, h)`),
    // Numeric and text content.
    view(`'+2'`),
    view(`'a -> b'`),
  ],
  invalid: [
    {
      code: view(`'Next page →'`),
      errors: [{ messageId: 'nativeGlyph' }],
    },
    {
      code: view(`'Open ↗'`),
      errors: [{ messageId: 'nativeGlyph' }],
    },
    {
      code: view(`'Jump to latest ↓'`),
      errors: [{ messageId: 'nativeGlyph' }],
    },
    {
      code: view(`'🚀 Deploy now'`),
      errors: [{ messageId: 'nativeGlyph' }],
    },
    {
      code: view(`'Settings ⚙'`),
      errors: [{ messageId: 'nativeGlyph' }],
    },
    {
      code: view(`'Sort ↑'`),
      errors: [{ messageId: 'nativeGlyph' }],
    },
    {
      code: view(`'✓ Done'`),
      errors: [{ messageId: 'nativeGlyph' }],
    },
    {
      code: 'export const view = h => h.div([], [`Page ${n} → next`])',
      errors: [{ messageId: 'nativeGlyph' }],
    },
  ],
})
