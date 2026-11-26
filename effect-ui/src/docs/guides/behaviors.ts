import type { Html } from '@effect/ui/html'

import { behaviors as foldkitBehaviors } from '../../../../src/docs/generated-behavior-docs'
import type { DocsGuide, DocsMessage } from '../types'
import { section } from './setup'

type Reference = {
  readonly api?: string
  readonly components: readonly string[]
  readonly explanation: string
}

const references: Readonly<Record<string, Reference>> = {
  'roving-focus': {
    api: 'ListNavigation from @effect/ui-kit',
    components: ['tabs', 'toolbar', 'radio-group'],
    explanation:
      'Give the composite one tab stop and let arrow keys move between its items. Use the kit part builders to attach focus attributes and navigation handlers.',
  },
  'grid-focus': {
    components: ['data-grid'],
    explanation:
      'The Data Grid behavior coordinates the active row and column with its visible window. Grid focus is available through the Data Grid behavior item.',
  },
  typeahead: {
    api: 'Typeahead from @effect/ui-kit',
    components: ['select', 'dropdown-menu', 'tree-list'],
    explanation:
      'Typeahead collects sequential key presses for matching labels. The kit Select and menu parts apply the match to the currently available options.',
  },
  parts: {
    api: 'Html.component from @effect/ui/html',
    components: ['accordion', 'popover'],
    explanation:
      'Define headless parts with p.part inside a component. Attach the returned functions to native element builders. Use p.child to compose another behavior and forward its events.',
  },
  'text-match': {
    components: ['command', 'multi-selector'],
    explanation:
      'Command supplies ordered fuzzy results from the label, value, and keywords. Multi Selector filters its own selectable groups.',
  },
  selection: {
    components: ['select', 'multi-selector', 'transfer-list', 'data-grid'],
    explanation:
      'Keep committed values in the parent for a controlled view. Each behavior emits its requested change for the parent to accept, reject, or persist.',
  },
  listbox: {
    api: 'Select from @effect/ui-kit',
    components: ['select', 'multi-selector'],
    explanation:
      'Apply the headless item builder to each option. The kit tracks the active option, selected values, keyboard movement, and form contribution.',
  },
  'anchored-listbox': {
    api: 'Select and Combobox from @effect/ui-kit',
    components: ['select', 'combobox', 'multi-selector'],
    explanation:
      'The trigger and option list use the same behavior instance. The positioner anchors the list and reacts to the available space.',
  },
  'cell-range': {
    components: ['data-grid'],
    explanation:
      'The grid behavior owns the current selection rectangle. It extends the range when navigating with Shift or dragging across cells.',
  },
  virtualizer: {
    api: 'VirtualList from @effect/ui-kit',
    components: ['data-grid'],
    explanation:
      'Render a visible window while preserving scrolling and item identity. The CreaseUI Data Grid implements virtualization together with row and column focus.',
  },
  'stick-to-bottom': {
    components: ['message-scroller'],
    explanation:
      'The Message Scroller behavior follows the latest message while the reader is near the bottom and exposes a control for returning to the newest entry.',
  },
  popup: {
    api: 'Popover from @effect/ui-kit',
    components: ['popover', 'dropdown-menu', 'hover-card'],
    explanation:
      'Compose a trigger, portal, positioner, and visible popup. Place the panel content in the popup part so the kit can coordinate focus, dismissal, and positioning.',
  },
  'popup-behavior': {
    api: 'Popover from @effect/ui-kit',
    components: ['popover', 'select', 'combobox'],
    explanation:
      'The kit owns trigger identity, popup placement, and dismissal. The CreaseUI Popover adapter can hold local open state or expose it to a parent.',
  },
  modal: {
    api: 'Dialog and Drawer from @effect/ui-kit',
    components: ['dialog', 'alert-dialog', 'drawer', 'sheet'],
    explanation:
      'Supply a title and description and use the kit portal and popup parts. The behavior manages modal focus, Escape and pointer dismissal, and focus restoration.',
  },
  portal: {
    api: 'Dialog and Popover from @effect/ui-kit',
    components: ['dialog', 'popover'],
    explanation:
      'The portal part owns the outer top-layer element. Apply panel styling and content to the inner popup part.',
  },
  'popup-controller': {
    api: 'Popover from @effect/ui-kit',
    components: ['popover', 'dialog'],
    explanation:
      'Set controlled open state in props and map requested open or close events into parent messages. The adapter also supports default open state for local disclosure.',
  },
  'hover-intent': {
    api: 'PreviewCard and Tooltip from @effect/ui-kit',
    components: ['hover-card', 'tooltip', 'info-tip'],
    explanation:
      'Hover delay and close delay remain attached to the trigger. Hover Card and Info Tip also support keyboard focus on button triggers.',
  },
  layer: {
    api: 'Dialog and Popover from @effect/ui-kit',
    components: ['dialog', 'popover', 'sheet'],
    explanation:
      'The kit portal handles the top layer. Use the kit overlay parts in their documented order so nested overlays dismiss and restore focus in sequence.',
  },
  position: {
    api: 'Positioning from @effect/ui-kit',
    components: ['popover', 'tooltip', 'dropdown-menu'],
    explanation:
      'Pass side, alignment, and offsets through the kit props. Positioner parts expose the resolved side and alignment for styling.',
  },
  disclosure: {
    api: 'Collapsible and Accordion from @effect/ui-kit',
    components: ['collapsible', 'accordion'],
    explanation:
      'Use the trigger and panel parts to link controls and content. The CreaseUI adapters support both local defaults and controlled open state.',
  },
  'drag-and-drop': {
    api: 'FileDrop from @effect/ui-kit',
    components: ['file-input', 'transfer-list', 'tree-list'],
    explanation:
      'File Drop validates an incoming file batch and emits accepted or rejected events. Transfer List and Tree List use their own drag and keyboard reordering behaviors.',
  },
  reorder: {
    components: ['list-input', 'transfer-list', 'tree-list'],
    explanation:
      'Give items stable keys. Apply the ordered sequence reported by the behavior to the parent-owned collection.',
  },
  'tree-reorder': {
    components: ['tree-list'],
    explanation:
      'The Tree List behavior emits a placement for a moved node. Update the nested collection in the parent using stable node identifiers.',
  },
  transfer: {
    components: ['transfer-list'],
    explanation:
      'The Transfer List behavior reports the next ordered set of selected values. The parent supplies item labels, disabled rules, and committed values.',
  },
  resize: {
    components: ['resizable', 'sidebar', 'data-grid'],
    explanation:
      'Use the accessible resize handles. Resizable and Sidebar keep panel sizes within the given limits, and Data Grid handles column widths.',
  },
  'swipe-actions': {
    components: ['swipe-actions', 'drawer', 'toast'],
    explanation:
      'Swipe Actions provides a foreground row and revealed action controls. Drawer and Toast use the gesture behavior appropriate to their overlays.',
  },
  'hold-repeat': {
    api: 'NumberField from @effect/ui-kit',
    components: ['number-input'],
    explanation:
      'The Number Field increment and decrement parts provide repeated stepping while pressed. Supply bounds, step size, and the accessible input label.',
  },
  findable: {
    api: 'Collapsible and Accordion from @effect/ui-kit',
    components: ['collapsible', 'accordion'],
    explanation:
      'Set hiddenUntilFound when collapsed content should remain available to browser Find in Page.',
  },
  'inline-edit': {
    components: ['inline-edit', 'data-grid'],
    explanation:
      'The inline editor tracks its current draft and lets the parent decide how to apply a committed edit. The grid applies the same distinction between navigation and editing.',
  },
  'file-drop': {
    api: 'FileDrop from @effect/ui-kit',
    components: ['file-input'],
    explanation:
      'Attach the root and trigger parts for file selection and drop. The CreaseUI adapter adds file count and size limits and can mirror approved files in a named multipart form control.',
  },
  announce: {
    api: 'Toast from @effect/ui-kit',
    components: ['toast'],
    explanation:
      'Use the Toast provider for status announcements. The kit owns the announcement region and updates it as notifications change.',
  },
  'avoid-keyboard': {
    api: 'VirtualKeyboard from @effect/ui-kit',
    components: ['avoid-keyboard'],
    explanation:
      'Use Avoid Keyboard to keep affected UI above the on-screen keyboard. Browser viewport behavior affects which geometry is available.',
  },
}

const displayName = (slug: string) =>
  slug
    .split('-')
    .map(word => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')
const componentLink = (h: Html.H<DocsMessage>, slug: string) =>
  h.a.attr('href', `/docs/components/${slug}`).children(displayName(slug))

const primitives = foldkitBehaviors.filter(
  behavior => behavior.kind === 'primitive',
)
const groups = Array.from(new Set(primitives.map(behavior => behavior.group)))

const overview: DocsGuide = {
  title: 'Behaviors',
  description:
    'Install interaction logic separately or use the same behavior through a styled CreaseUI component.',
  view: h =>
    h.div.children(
      section(
        h,
        'install',
        'Install a behavior',
        h.p.children(
          'Behavior items provide native element parts and typed interaction events. The styled components use the same behavior source.',
        ),
        h.pre.children(
          h.code.children(
            'npx shadcn@latest add @crease-effect/effect-popover-behavior',
          ),
        ),
        h.p.children(
          'Import ',
          h.code.children('PopoverBehavior'),
          ' from ',
          h.code.children('@/ui/effect/behaviors/popover'),
          ' and decorate your own element builders with the supplied parts.',
        ),
      ),
      ...groups.map(group =>
        section(
          h,
          group.toLowerCase().replaceAll(' ', '-'),
          group,
          h.ul.children(
            primitives
              .filter(behavior => behavior.group === group)
              .map(behavior =>
                h.li.children(
                  h.a.attr('href', behavior.docs).children(behavior.title),
                ),
              ),
          ),
        ),
      ),
    ),
}

export const behaviorGuides: Readonly<Record<string, DocsGuide>> = {
  '/docs/behaviors': overview,
  ...Object.fromEntries(
    foldkitBehaviors.map(behavior => {
      const reference = references[behavior.slug]
      return [
        behavior.docs,
        {
          title: behavior.title,
          description: behavior.description,
          view: h =>
            h.div.children(
              reference === undefined
                ? behavior.owner === undefined
                  ? h.p.children(
                      'An Effect UI reference for this Foldkit behavior is pending.',
                    )
                  : h.p.children(
                      'See the Effect UI component page for ',
                      componentLink(h, behavior.owner),
                      '.',
                    )
                : section(
                    h,
                    'effect-ui',
                    'Effect UI',
                    h.p.children(reference.explanation),
                    reference.api === undefined
                      ? undefined
                      : h.p.children(h.code.children(reference.api)),
                    h.ul.children(
                      reference.components.map(slug =>
                        h.li.children(componentLink(h, slug)),
                      ),
                    ),
                  ),
              h.p.children(
                h.a.attr('href', '/docs/behaviors').children('All behaviors'),
              ),
            ),
        } satisfies DocsGuide,
      ]
    }),
  ),
}
