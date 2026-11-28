import { AspectRatio } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './aspect-ratio.css'

const IMAGE_URL = 'https://avatar.vercel.sh/creaseui'

type Fixture = Readonly<{
  title: string
  ratio: number
  frameClass: string
  rtl?: boolean
  caption?: string
}>

const fixtures: ReadonlyArray<Fixture> = [
  { title: 'Square', ratio: 1, frameClass: 'aspect-ratio-docs-square' },
  {
    title: 'Portrait',
    ratio: 9 / 16,
    frameClass: 'aspect-ratio-docs-portrait',
  },
  {
    title: 'RTL',
    ratio: 16 / 9,
    frameClass: 'aspect-ratio-docs-rtl',
    rtl: true,
    caption: 'منظر طبيعي جميل',
  },
]

const render = (fixture: Fixture): DocsExampleImplementation['view'] => {
  return h =>
    h.figure
      .class('aspect-ratio-docs-frame', fixture.frameClass)
      .attrs(fixture.rtl === true ? { dir: 'rtl' } : {})
      .children(
        AspectRatio(h, {
          ratio: fixture.ratio,
          children: [
            h.img.class('aspect-ratio-docs-image').attrs({
              src: IMAGE_URL,
              alt: 'Photo',
            }),
          ],
        }),
        fixture.caption === undefined
          ? undefined
          : h.figcaption
              .class('aspect-ratio-docs-caption')
              .children(fixture.caption),
      )
}

export const componentDocs = defineComponentDocs({
  usage: `import { AspectRatio } from '@/ui/effect/ui'

AspectRatio(h, {
  ratio: 16 / 9,
  children: [h.img.attrs({ src, alt }).class('aspect-ratio-docs-image')],
})`,
  examples: fixtures.map(fixture => ({
    title: fixture.title,
    view: render(fixture),
    source: exampleApplicationSource({
      imports: `import { AspectRatio } from '@/ui/effect/ui'
import './aspect-ratio.css'

const imageUrl = ${JSON.stringify(IMAGE_URL)}`,
      body: `h.figure.class('aspect-ratio-docs-frame', '${fixture.frameClass}')${fixture.rtl === true ? ".attrs({ dir: 'rtl' })" : ''}.children(
  AspectRatio(h, {
    ratio: ${String(fixture.ratio)},
    children: [h.img.class('aspect-ratio-docs-image').attrs({ src: imageUrl, alt: 'Photo' })],
  }),${
    fixture.caption === undefined
      ? ''
      : `
  h.figcaption.class('aspect-ratio-docs-caption').children(${JSON.stringify(fixture.caption)}),`
  }
)`,
    }),
  })),
})
