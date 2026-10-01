import { authoredPage } from '@/docs/components/pages/authored-page';
import { segmentedControlExamples } from '@/docs/components/pages/segmented-control/shared';
import { segmentedControlTailwindPreviewProgram } from '@/docs/components/pages/segmented-control/tailwind';

export const segmentedControlPage = authoredPage({
  slug: 'segmented-control',
  title: 'Segmented Control',
  kind: 'submodel',
  previewProgram: segmentedControlTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description: 'Single-selection segmented control for mutually exclusive views, modes, or levels within one page or context.',
    architecture: 'Bind the value type once with SegmentedControl.create<Value>(). The parent owns the selected value; the child Model owns only the roving-focus cursor. Fold the SelectedValue OutMessage to write back the new selection.',
    apiHref: 'https://foldkit.dev/ui/radio-group',
    styling: 'Segments sit on a neutral plate with a 2px gap and the selected option floats as a raised surface chip. Use isLabelHidden with an icon for dense toolbars and layout fill to stretch segments across a fixed container.',
    accessibility: 'Each option is a native button with role radio inside an aria-labelled radiogroup. Arrow keys move and select in one step, matching the platform control; a hidden label still supplies the accessible name.',
    keyboard: [
      ['Arrow keys', 'Moves focus to the next or previous segment and selects it (selection follows focus).'],
      ['Home / End', 'Selects the first or last segment.'],
      ['Page Up / Page Down', 'Selects the first or last segment.'],
      ['Space / Enter', 'Selects the focused segment.'],
    ],
    examples: segmentedControlExamples('tailwind'),
    stylexExamples: segmentedControlExamples('stylex'),
  },
});
