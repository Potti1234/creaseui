import type { Html } from '@effect/ui/html'

import { CodeBlock, Markdown } from '#components'
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

const guides = import.meta.glob<string>('../../../../src/lib/behaviors/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const exampleSources = import.meta.glob<string>(
  '../../../../src/docs/examples/*/main.ts',
  { eager: true, query: '?raw', import: 'default' },
)
const guideFor = (name: string) =>
  (guides[`../../../../src/lib/behaviors/${name}.md`] ?? '')
    .replace(/^# .+\r?\n+/, '')
    .replaceAll('Foldkit', 'Effect UI')
    .replaceAll('foldkit', 'effect-ui')
const demoExamples: Readonly<
  Record<string, { title: string; folder: string; explanation: string }>
> = {
  transfer: {
    title: 'Schedule field checks',
    folder: 'transfer',
    explanation:
      'The parent holds the Transfer Model, applies a capacity rule, and records the previous order from a Transferred event.',
  },
  'popup-behavior': {
    title: 'Open order details',
    folder: 'anchored-popup',
    explanation:
      'A correlated request stays in the parent Model, and a Command returns the result when the popup closes.',
  },
  'popup-controller': {
    title: 'Open order details',
    folder: 'anchored-popup',
    explanation:
      'A correlated request stays in the parent Model, and a Command returns the result when the popup closes.',
  },
  portal: {
    title: 'Open order details',
    folder: 'anchored-popup',
    explanation:
      'A correlated request stays in the parent Model, and a Command returns the result when the popup closes.',
  },
  virtualizer: {
    title: 'Jump through 10,000 rows',
    folder: 'virtualizer',
    explanation:
      'The parent lifts scroll and measurement input and projects the visible window from the Model.',
  },
  'swipe-actions': {
    title: 'Reveal row actions',
    folder: 'swipe-actions',
    explanation:
      'The Model tracks drag progress while the Mount owns pointer input.',
  },
  move: {
    title: 'Move a tile across a board',
    folder: 'move',
    explanation:
      'The parent maps pointer and keyboard messages into Move.update and renders the resulting position.',
  },
  viewport: {
    title: 'Pan and zoom a canvas',
    folder: 'viewport',
    explanation:
      'The parent holds the camera Model while scoped input updates the viewport.',
  },
}
const componentExamples: Readonly<Record<string, readonly [string, string?]>> =
  {
    'drag-and-drop': ['transfer-list'],
    'grid-focus': ['data-grid'],
    'cell-range': ['data-grid'],
    'spatial-focus': ['grid', 'Grid — Spatial Focus'],
    'input-history': ['textarea', 'Chat History'],
    'message-scroller': ['message-scroller'],
    lasso: ['grid', 'Grid — Lasso Selection'],
    'scroll-picker': ['time-input', 'Hour and Minute Picker'],
    motion: ['collapsible', 'Motion presence'],
  }
const codeBlock = (h: Html.H<DocsMessage>, id: string, code: string) =>
  h.details.class('docs-behavior-code').children(
    h.summary.children('Example source'),
    CodeBlock(h, {
      id,
      language: 'typescript',
      props: { code },
      width: '100%',
      container: 'section',
    }) as never,
  )
const behaviorDetail = (
  h: Html.H<DocsMessage>,
  behavior: (typeof foldkitBehaviors)[number],
  reference: Reference | undefined,
) => {
  const guide = behavior.guides.map(guideFor).join('\n\n')
  const demo = demoExamples[behavior.slug]
  const componentExample = componentExamples[behavior.slug]
  const demoCode =
    demo === undefined
      ? undefined
      : exampleSources[`../../../../src/docs/examples/${demo.folder}/main.ts`]
  return h.div.children(
    h.nav
      .class('docs-breadcrumb')
      .attr('aria-label', 'Breadcrumb')
      .children(
        h.a.attr('href', '/docs/behaviors').children('Behaviors'),
        h.span.attr('aria-hidden', 'true').children('/'),
        h.span.attr('aria-current', 'page').children(behavior.title),
      ),
    h.section
      .attr('id', 'effect-ui')
      .class('docs-section')
      .children(
        h.h2.children('Effect UI'),
        h.p
          .class('docs-muted')
          .children(
            reference?.explanation ??
              'Use the corresponding Effect UI behavior or component composition where available.',
          ),
        reference?.api === undefined
          ? undefined
          : h.p.children(h.code.children(reference.api)),
        (reference?.components ?? []).length === 0
          ? undefined
          : h.ul
              .class('docs-compact-list')
              .children(
                (reference?.components ?? []).map(slug =>
                  h.li.children(componentLink(h, slug)),
                ),
              ),
      ),
    demo === undefined && componentExample === undefined
      ? undefined
      : h.section
          .attr('id', 'examples')
          .class('docs-section')
          .children(
            h.h2.children('Examples'),
            demo === undefined
              ? undefined
              : h.article.children(
                  h.h3.children(demo.title),
                  h.p.class('docs-muted').children(demo.explanation),
                  demoCode === undefined
                    ? undefined
                    : codeBlock(h, `${behavior.slug}-example`, demoCode),
                ),
            componentExample === undefined
              ? undefined
              : h.article.children(
                  h.h3.children(componentExample[1] ?? 'Component example'),
                  h.p.children(componentLink(h, componentExample[0])),
                ),
          ),
    guide === ''
      ? undefined
      : h.section
          .attr('id', 'usage-guide')
          .class('docs-section')
          .children(
            Markdown(h, {
              id: `${behavior.slug}-guide`,
              source: guide,
              headingLevelStart: 2,
            }) as never,
          ),
    h.section
      .attr('id', 'source-exports')
      .class('docs-section')
      .children(
        h.h2.children('Source exports'),
        h.p
          .class('docs-muted')
          .children(h.code.children(`@/${behavior.source.slice(4, -3)}`)),
        h.ul
          .class('docs-compact-list')
          .children(
            behavior.exports.map(name => h.li.children(h.code.children(name))),
          ),
      ),
    h.p.children(h.a.attr('href', '/docs/behaviors').children('All behaviors')),
  )
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
    'Compose these headless Foldkit primitives to build existing and custom components.',
  toc: [
    ...groups.map(
      group => [group.toLowerCase().replaceAll(' ', '-'), group] as const,
    ),
  ],
  view: h =>
    h.div.class('behavior-overview').children(
      h.nav.attr('aria-label', 'Behavior categories').children(
        h.ul.class('behavior-docs-link-list').children(
          groups.map(group =>
            h.li.key(group).children(
              h.a
                .class('behavior-docs-link')
                .attr('href', `#${group.toLowerCase().replaceAll(' ', '-')}`)
                .children(group),
            ),
          ),
        ),
      ),
      ...groups.map(group =>
        section(
          h,
          group.toLowerCase().replaceAll(' ', '-'),
          group,
          h.ul
            .class('behavior-docs-index-list')
            .children(
              primitives
                .filter(behavior => behavior.group === group)
                .map(behavior =>
                  h.li
                    .key(behavior.slug)
                    .children(
                      h.a
                        .class('behavior-docs-link')
                        .attr('href', behavior.docs)
                        .children(behavior.title),
                      h.p
                        .class('behavior-docs-muted')
                        .children(behavior.description),
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
          toc: [
            ['effect-ui', 'Effect UI'],
            ...(demoExamples[behavior.slug] !== undefined ||
            componentExamples[behavior.slug] !== undefined
              ? [['examples', 'Examples'] as const]
              : []),
            ['usage-guide', 'Usage guide'],
            ['source-exports', 'Source exports'],
          ],
          view: h => behaviorDetail(h, behavior, reference),
        } satisfies DocsGuide,
      ]
    }),
  ),
}
