import { authoredPage } from '@/docs/components/pages/authored-page';
import { commandExamples } from '@/docs/components/pages/command/shared';
import { commandTailwindPreviewProgram } from '@/docs/components/pages/command/tailwind';

export const commandPage = authoredPage({
  slug: 'command', title: 'Command', kind: 'submodel', previewProgram: commandTailwindPreviewProgram,
  definition: {
    kind: 'submodel', description: 'Provides a searchable command surface for selecting an application action.',
    architecture: 'Bind the action union once with CommandMenu.create<Action>(). Foldkit Combobox owns query, active descendant, disclosure, and focus; shared pure filtering derives visible actions. The parent owns result data, loading policy, stale-result rejection, and the consequences of typed Selected output.',
    apiHref: 'https://foldkit.dev/ui/combobox',
    composition: 'Command child Model\n├── search input + toggle\n├── filtered action list\n│   ├── label\n│   ├── shortcut hint\n│   └── disabled/group metadata\n└── typed OutMessage to parent',
    styling: 'Command can render inline or be composed inside a Dialog for a global palette. Shortcut text is a visual hint; register global keyboard shortcuts separately in the parent program.',
    accessibility: 'The primitive supplies combobox/listbox semantics and keyboard navigation. Shortcuts do not replace accessible action labels.',
    keyboard: [['Type', 'Filters commands by their configured search text.'], ['Arrow Up / Down', 'Moves the active command.'], ['Enter', 'Emits the selected action to the parent.'], ['Escape', 'Closes the list without running an action.']],
    examples: commandExamples('tailwind'),
    stylexExamples: commandExamples('stylex'),
  },
});
