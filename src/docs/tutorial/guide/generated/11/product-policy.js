/* The product's own lint rules, on top of crease's strict rules.
 *
 * Each entry names the decision in design-system/principles.md it enforces.
 * These rules only add restrictions: nothing here may turn off or loosen a
 * crease rule. Allowed component values (variants) are not here; they are in
 * crease.lock.json, next to the components they narrow.
 */
import creaseTasks from '../tooling/eslint-plugin-crease-tasks/index.js'

export const productPolicy = [
  {
    name: 'crease-tasks/patterns-only',
    files: ['src/features/**/*.ts', 'src/view.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            // D3: every list shows issues with the same row.
            {
              name: '@/ui/item',
              message:
                'List issues with issueCollection or issueRow from src/design (decision D3).',
            },
            // D7: properties change through the picker, nowhere else.
            {
              name: '@/ui/dropdown-menu',
              message:
                'Change issue properties with propertyPicker from src/design (decision D7).',
            },
            // D8: issues are created by the composer only.
            {
              name: '@/ui/dialog',
              message:
                'Create issues with issueComposer from src/design (decision D8).',
            },
            // D9: one command menu for the whole app.
            {
              name: '@/ui/command',
              message:
                'Add entries to the one CommandMenu (src/design/command-menu.ts) instead of a second menu (decision D9).',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'crease-tasks/rules',
    files: ['src/**/*.ts'],
    plugins: { 'crease-tasks': creaseTasks },
    rules: {
      // D4: one primary action per region. A rule of our own, because no
      // configuration can count (tooling/eslint-plugin-crease-tasks).
      'crease-tasks/one-primary-action': 'error',
    },
  },
]
