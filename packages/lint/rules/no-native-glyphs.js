import { docsUrl } from '../lib/strict/context.js'

/* Native arrow, symbol and emoji glyphs rendered as UI text bypass the Icon
   component: they ignore the icon system (size, stroke, currentColor), render
   differently per platform font, and escape lint rules that audit component
   usage. This rule flags them inside string literals and template text so
   authors reach for `Icon.arrowUpRight`/`Icon.chevronDown`/... instead.

   Allowed exceptions that stay legal as text:
   - Box-drawing characters (U+2500–257F): ASCII-art trees in docs like
     `├── Child` are diagrams, not icons.
   - Keyboard modifiers (⌘ U+2318, ⌥ U+2325, ⇧ U+21E7, ⌃ U+2303,
     ⌫ U+232B, ⎋ U+238B, ↵ U+21B5): the standard kbd glyphs.
   - Comments and non-string code are never scanned. */

const isKeyboardModifier = codePoint =>
  codePoint === 0x2318 ||
  codePoint === 0x2325 ||
  codePoint === 0x2303 ||
  codePoint === 0x232b ||
  codePoint === 0x238b ||
  codePoint === 0x21b5 ||
  codePoint === 0x21e7

const isBoxDrawing = codePoint => codePoint >= 0x2500 && codePoint <= 0x257f

/* Mathematical operators (U+2200–22FF) are deliberately not banned: −, ≥,
   ≤ and ∙ are numeric typography (deltas, comparisons, bullet separators),
   not stand-in icons. */
const isBannedGlyph = codePoint =>
  !isKeyboardModifier(codePoint) &&
  !isBoxDrawing(codePoint) &&
  ((codePoint >= 0x2190 && codePoint <= 0x21ff) || // arrows
    (codePoint >= 0x2300 && codePoint <= 0x23ff) || // misc technical (⌕ …)
    (codePoint >= 0x25a0 && codePoint <= 0x27bf) || // geometric + misc + dingbats
    (codePoint >= 0x2b00 && codePoint <= 0x2bff) || // supplemental arrows/stars
    codePoint === 0xfe0f || // emoji variation selector
    (codePoint >= 0x1f000 && codePoint <= 0x1faff))

const describe = glyph =>
  `U+${glyph.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`

export const noNativeGlyphs = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow native arrow/symbol/emoji glyphs in UI text; use the Icon component instead.',
      url: docsUrl('no-native-glyphs'),
    },
    schema: [],
    messages: {
      nativeGlyph:
        "Native glyph {{glyph}} ('{{char}}') bypasses the Icon component. Use Icon.* (e.g. Icon.arrowUpRight) so size, stroke and currentColor follow the icon system.",
    },
  },
  create(context) {
    const check = (node, text) => {
      if (typeof text !== 'string') return
      for (const char of text)
        if (isBannedGlyph(char.codePointAt(0))) {
          context.report({
            node,
            messageId: 'nativeGlyph',
            data: { char, glyph: describe(char) },
          })
          return
        }
    }
    return {
      Literal(node) {
        check(node, node.value)
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) check(quasi, quasi.value.cooked)
      },
    }
  },
}
