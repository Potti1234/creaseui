import placementResults from '../../generated/06/placement.json'
import type { Layer } from './model'

/* The layers of design-system/boundaries.md at chapter-06. */

export type LayerInfo = Readonly<{
  id: Layer
  name: string
  files: string
  mayUse: ReadonlyArray<Layer>
  uses: string
  enforcedBy: string
}>

export const LAYERS: ReadonlyArray<LayerInfo> = [
  {
    id: 'features',
    name: 'Features',
    files: 'src/features/**, src/view.ts',
    mayUse: ['components'],
    uses: 'The public exports of `src/ui`, placed with margin, width and alignment only.',
    enforcedBy:
      '`no-raw-controls`, `no-raw-composition`, `no-application-styles`, `no-unapproved-renderer`, `component-contract`',
  },
  {
    id: 'components',
    name: 'Components',
    files: 'src/ui/**',
    mayUse: ['implementations'],
    uses: 'Raw elements, classes and the implementations in `src/lib`.',
    enforcedBy: 'A raw-rendering grant per file in `crease.lock.json`',
  },
  {
    id: 'implementations',
    name: 'Implementations',
    files: 'src/lib/**',
    mayUse: [],
    uses: 'Raw elements. Only components may call their render functions.',
    enforcedBy:
      '`visibility: "implementation"` on their exports in `crease.lock.json`',
  },
  {
    id: 'theme',
    name: 'Theme',
    files: 'src/styles.css, src/theme/*.css',
    mayUse: [],
    uses: 'Tokens. `geometry.css` may also target components by `data-slot`.',
    enforcedBy:
      '`creaseui-lint css`, and the theme registration in `eslint.config.js`',
  },
  {
    id: 'entry',
    name: 'Entry',
    files: 'src/main.ts',
    mayUse: ['theme', 'features'],
    uses: 'Stylesheet imports and the runtime.',
    enforcedBy: 'Its registration as the setup file in `eslint.config.js`',
  },
  {
    id: 'enforcement',
    name: 'Enforcement',
    files:
      'crease.lock.json, eslint.config.js, package.json scripts, AGENTS.md',
    mayUse: [],
    uses: 'Nothing. These files decide what the others may do, and change only in a design-system change.',
    enforcedBy: '`npm run scope`, which lists any change to them',
  },
]

export type Placement = Readonly<{
  component: string
  className: string
  allowed: boolean
  message: string
}>

export const PLACEMENT: ReadonlyArray<Placement> =
  placementResults as ReadonlyArray<Placement>
export const COMPONENTS: ReadonlyArray<string> = [
  ...new Set(PLACEMENT.map(result => result.component)),
]
export const CLASSES: ReadonlyArray<string> = [
  ...new Set(PLACEMENT.map(result => result.className)),
]

export const resultFor = (
  component: string,
  className: string,
): Placement | undefined =>
  PLACEMENT.find(
    result => result.component === component && result.className === className,
  )
