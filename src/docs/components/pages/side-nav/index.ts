import { authoredPage } from '@/docs/components/pages/authored-page'
import { sideNavExamples } from '@/docs/components/pages/side-nav/shared'
import { sideNavTailwindPreviewProgram } from '@/docs/components/pages/side-nav/tailwind'

export const sideNavPage = authoredPage({
  slug: 'side-nav',
  title: 'Side Nav',
  kind: 'submodel',
  previewProgram: sideNavTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description:
      'Left-side product navigation with a header, scrollable sections, a footer icon row, collapse-to-rail, and an optional drag-resize handle.',
    architecture:
      'SideNav owns collapse state, item expansion, drag-resize, and per-flyout NavMenu state in one child Model, and reports item activation and collapse changes via SelectedSideNavItem / ChangedSideNavCollapse OutMessages for parent domain logic.',
    apiHref: 'https://foldkit.dev/ui/side-nav',
    composition:
      'Parent Model\n└── SideNav Model\n    ├── isCollapsed + width + drag\n    ├── per-item expansion\n    ├── heading / flyout menu models\n    └── per-render item data\n        └── label / icon / endContent / children',
    styling:
      'Item data is a view concern; collapse, expansion, and resize follow the Model. `hasCollapseButton` controls the built-in footer toggle and `footerCollapseButton` renders the same control inside the footer icon row.',
    accessibility:
      'Renders a `nav` landmark with an aria-label; sections are `group`s labelled by their heading. Collapsed items keep icon-only controls with an aria-label, and parent rows expose a flyout menu with aria-haspopup/aria-expanded.',
    keyboard: [
      [
        'Enter / Space',
        'Activates the focused item, or opens its flyout menu.',
      ],
      [
        'Escape',
        'Closes an open flyout or heading menu and refocuses its trigger.',
      ],
      [
        'ArrowLeft / ArrowRight',
        'Nudges the resize handle 16px narrower or wider.',
      ],
    ],
    examples: sideNavExamples('tailwind'),
    stylexExamples: sideNavExamples('stylex'),
  },
})
