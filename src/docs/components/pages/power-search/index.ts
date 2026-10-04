import { authoredPage } from '@/docs/components/pages/authored-page'
import { powerSearchExamples } from '@/docs/components/pages/power-search/shared'
import { powerSearchTailwindPreviewProgram } from '@/docs/components/pages/power-search/tailwind'

export const powerSearchPage = authoredPage({
  slug: 'power-search',
  title: 'Power Search',
  kind: 'submodel',
  previewProgram: powerSearchTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description:
      'A faceted search bar that turns filters into removable tokens — the input is a combobox suggesting fields, operators, and values, and each committed filter opens a dedicated popover editor covering strings, numbers, dates, enums, entity lists, and nested conditions.',
    architecture:
      'Power Search is a submodel component. Its Model holds the query, the open/closed surface state, the draft filter being edited, and which menu inside the editor is open; the caller owns the controlled `filters` array and maps ChangedPowerSearch out messages back into state. A mounted stream watches document pointerdown to dismiss open surfaces, and focus restoration after commits is delegated to commands.',
    apiHref:
      'https://github.com/facebook/astryx/blob/main/packages/core/src/PowerSearch/PowerSearch.tsx',
    styling:
      'Tokens render as compact chips beside the input; the editor popover wraps to two rows below a 24.9rem container query and goes single-line above it. The suggestion menu, token editors, and entity-list search all reuse the same listbox styling with accent-tinted active options.',
    accessibility:
      'The input is a combobox with a labelled listbox of suggestions; each token is a labelled group with a remove button. Filter editors expose form controls for field, operator, and value, and a polite live region announces result-count updates.',
    keyboard: [
      ['Enter', 'Pick the highlighted suggestion or commit the open editor'],
      ['Backspace', 'With an empty query, remove the last editable token'],
      ['Escape', 'Close the suggestion menu or cancel the open editor'],
    ],
    examples: powerSearchExamples('tailwind'),
    stylexExamples: powerSearchExamples('stylex'),
  },
})
