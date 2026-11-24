import { authoredPages } from '@/docs/components/pages'
import {
  componentsUsing,
  type BehaviorEntry,
  type BehaviorRenderer,
} from '@/docs/behavior-metadata'
import { toSlug } from '@/docs/component-metadata'
import { componentDocsPath, gettingStartedPath } from '@/route'
import spansSource from './spans-demo.ts?raw'
import historySource from './behavior-demo.ts?raw'

type Example = Readonly<{
  title: string
  href: string
  explanation: string
  code?: string
  preview?: string
  previewHeight?: number
}>

const sources = import.meta.glob<string>('./examples/*/main.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const standalone = (
  folder: string,
  title: string,
  explanation: string,
  previewHeight: number,
): Example => {
  const code = sources[`./examples/${folder}/main.ts`]
  return {
    title,
    href: `/src/docs/examples/${folder}/index.html`,
    preview: `/src/docs/examples/${folder}/index.html`,
    explanation,
    previewHeight,
    ...(code === undefined ? {} : { code }),
  }
}

const transfer = standalone(
  'transfer',
  'Schedule field checks',
  'The parent holds the Transfer Model, applies a capacity rule, and records the previous order from a Transferred OutMessage. It maps the behavior’s focus Commands back into the parent Message. The mounted surface supplies pointer and keyboard input.',
  385,
)
const popup = standalone(
  'anchored-popup',
  'Open order details',
  'A Foldkit Port delivers a correlated request. The parent keeps the request in its Schema Model, and a Command returns the result when the popup closes. The panel Mount owns positioning and dismissal.',
  365,
)
const swipe = standalone(
  'swipe-actions',
  'Reveal row actions',
  'The Model tracks drag progress. The Mount owns pointer input and the parent handles requests emitted by the behavior.',
  440,
)
const virtualizer = standalone(
  'virtualizer',
  'Jump through 10,000 rows',
  'The parent lifts the scroll and measurement Subscription. A button dispatches a Message that produces a scroll Command, and the view projects the visible window from the Model.',
  405,
)

const demos: Readonly<Record<string, Example>> = {
  transfer,
  'popup-behavior': popup,
  'popup-controller': popup,
  portal: popup,
  virtualizer,
  'swipe-actions': swipe,
  move: standalone(
    'move',
    'Move a tile across a board',
    'The parent maps pointer and keyboard Messages into Move.update and renders the resulting position.',
    455,
  ),
  viewport: standalone(
    'viewport',
    'Pan and zoom a canvas',
    'The parent holds the camera Model. Scoped input sends messages that update the viewport, while view attributes project its transform.',
    470,
  ),
  spans: {
    title: 'Change a room booking',
    href: '/src/docs/spans-demo.html',
    preview: '/src/docs/spans-demo.html',
    previewHeight: 420,
    code: spansSource,
    explanation:
      'Draw or resize a draft on a track. The parent receives the committed range after release and the Mount owns pointer geometry.',
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

const observed: Example = {
  title: 'Preview and record a workspace setting',
  href: gettingStartedPath() + '#observe-behavior-demo',
  preview: '/src/docs/examples/component/index.html?demo=history',
  previewHeight: 535,
  code: historySource,
  explanation:
    'The parent routes accepted changes into History. Try a preview, keep or roll it back, and inspect the recorded changes.',
}

const themeDemo = standalone(
  'values',
  'Change the preview color scheme',
  'The parent routes a preference Message into Color Scheme. It maps the returned Command back into its Message and the Command updates the document.',
  185,
)
const themes: Example = {
  ...themeDemo,
  href: themeDemo.href + '?demo=theme',
  preview: themeDemo.href + '?demo=theme',
}
const gesture = standalone(
  'values',
  'Compare release and spring distances',
  'The slider writes a release speed to the Model. The view calculates the projected travel, the resisted distance, and the spring displacement without running DOM effects.',
  235,
)
const findable = standalone(
  'values',
  'Find text in collapsed notes',
  'The browser’s beforematch event sends a Foldkit Message. The update opens the notes, and the same Model controls the visible state and the trigger’s ARIA attributes.',
  195,
)

const otherExamples: Readonly<Record<string, Example>> = {
  preference: themes,
  'color-scheme': themes,
  storage: themes,
  history: observed,
  observe: observed,
  agent: observed,
  change: observed,
  gesture,
  findable: {
    ...findable,
    href: findable.href + '?demo=findable',
    preview: findable.href + '?demo=findable',
  },
  'rubber-band': {
    ...swipe,
    title: 'Pull past the edge of a row',
    explanation:
      'Drag beyond the action area to feel the resistance curve. Swipe Actions applies Rubber Band to the draft offset before rendering the row.',
  },
}

export const examplesFor = (
  entry: BehaviorEntry,
  renderer: BehaviorRenderer,
): readonly Example[] => {
  const dedicated = demos[entry.slug] ?? otherExamples[entry.slug]
  if (dedicated) return [dedicated]
  const override = componentExamples[entry.slug]
  const slugs = override ? [override[0]] : componentsUsing(entry.slug, renderer)
  for (const slug of slugs) {
    const page = authoredPages[slug]
    if (!page?.previewProgram) continue
    const examples =
      (renderer === 'stylex'
        ? page.definition.stylexExamples
        : renderer === 'pleat'
          ? page.definition.pleatExamples
          : undefined) ?? page.definition.examples
    const named = examples.filter(example => !example.heroOnly)
    const example =
      named.find(candidate => candidate.title === override?.[1]) ??
      named.find(candidate =>
        candidate.code.includes('@/' + entry.source.slice(4, -3)),
      ) ??
      named[0] ??
      examples[0]
    if (!example) continue
    const consumer = {
      title: `${page.title} · ${example.title}`,
      href:
        componentDocsPath(slug) +
        (example.heroOnly
          ? ''
          : '#' + (example.sectionId ?? toSlug(example.title))),
      preview:
        '/src/docs/examples/component/index.html?' +
        new URLSearchParams({
          component: slug,
          example: String(examples.indexOf(example)),
        }),
      previewHeight: 405,
      explanation:
        example.description ??
        'Run the component preview and inspect how its example wires behavior into the Foldkit application.',
      code: example.code,
    }
    return entry.slug === 'drag-and-drop' ? [consumer, transfer] : [consumer]
  }
  return []
}
