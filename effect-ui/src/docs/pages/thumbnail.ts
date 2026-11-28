import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Thumbnail } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './thumbnail.css'

const NIGHT_FOREST =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAwFBMVEX18+H08uDy8d/y8N/v7t/m5NXl49Tk4tPc3NDX1cnW1cnW1cjW1MjV1MjV1MfR0cXIyLzEw7m8vLC3t68wM0QvM0MvM0IvMkIuMkEtMEErLz8iJjkhJTggJTcgJDcfJDYfIzYeIjUcITMbHzIWHiwYGzIXGjEWGjAWGTAVGS8VGC8UGC4UGC0UFy4TFy0TFywTFi0SFiwRFSsQFSkNFR4QFCoPFCkPFCgPEykOEygOEigNEicNEScMESYIDw8ECgr+gzZIAAABqElEQVR42uWQ61aCQBRGD5GylNBMKS9FZgNdNE0cyUvB+79VM8MoF9Fgplau2j/8nO8c9hqAD0ngDwjeJYH1lrfBWoCtYDboNu/Zv7qQYNap1bpCN1gxFh1dNe5WAsCScWqoWttbChAKvHZZ0W6XQoIFpW8ooFmLCG2Rl1BgaZAU5Ac8yg0RlC9nngCRQDFuhQRzinWmkCuYk3lxQoFrlskVqlcTMcEFvYIKoFbNfmEFuIypWaGGkt66tqZuEbjAHZl6SQVF1WqNvpDAHVktXTvR9JbgDZii1+tZI7cYMJXkCASvksB4L5VxHmAsibzgRRIYbjgfCgFDSeBZkh8W1HMIniSBR0mOQPCQA3RgBk4M5DhNZwdEcbKgLXy5iDiZg5gApRYbqTql2FZgMxAKeEWSNUFYx3s2SfU28HPWItrpySSwE2cEdqrYtxgmxgHGScFmHrAGk8SxczIxZnNC1McFOGshShyb4yxB9sI3CXDGnH0MLsD7F5LvvptEgH12Zg1Pn2WuHsjvrwt8308t+nwxT38sgiAE8/RTeagH+vx/F8SeF0Ja8Ak14ia/LgmpZQAAAABJRU5ErkJggg=='
const MISTY_VALLEY =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAwFBMVEWPnaqJmKSIlaKHlaGGlaKGk6CEkp6Ckp+Cj5uAj51/jZp6i5h8ipd7iZZ4hpR1g5FzhpdzhJN0g5FuhZdsgpVqgZRpgJNpf5JmfpFufYxufYtlfJBpe4tke49neo1ieo5kd4tndoZidopheY1geIxfd4tmdYVddYpcdIlbc4hgcoNebn5ZcodYcYZXb4VVboRUbYNTbIJaantWaXxRa4FQaYBPaH9NZ35UZXZQY3dMZn1LZXxKZHxMYHRKXnIoOEh3WzsBAAABeElEQVR42u3T11oCQQyG4R9FEREFqVJEgh17xbZ7/3cl29gpmQGeeOh7OF+Ss8G3EL6E8CmEdyG8CeFVCC9CeBTCgxDuhXAnhFsh3AjhSgiXQrgQwtlayHrB6TqIyHzCREMTH4rpbxip5nnkRintEUNF0oc8yqnP6Oey3ueQSnlHN6P0ro0Mi4BOSu8dA1mygnbC7G0NMdKEVszuLQXx4oZmhO3NDLlEEY05R280PDGbgD0RaBeI/Bdg7weBMkDLwF4PtBOcwH0gCJZf0DPYdd8Jo8K177hgZbjW+RN2hWffusBVnMR+XE5yfMRx5MPtOOOI0Xd+9ot/rTOiVrtepuabwcDwNFgP6przSH0dqKiOUhUfvaKcO8yVncyM0sK+psSyK4qpPUvRwlUUYrusgoaviG27YMFXNz38I0nc8PNPAFtC2BFClRFWV4cDU5g4WEE0hJ4q1PU8sgmMF0LOmKN2TBOh21RjRsxms3C5WYwrCIX+D/zBgV8HCFv4gVKf1AAAAABJRU5ErkJggg=='
const GOLDEN_SUNSET =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAkFBMVEX/+uv/7sj6tFr3sVn1r1nzrVjxq1jvqVftp1frpVbpo1bnoVXln1XjnVThm1TfmVPdl1PblVLZk1LXkVLVj1HTjVHRi1DPiVDNh0/LhU/Jg07HgU7Ff03DfU3Be0y/eUy9d0u7dUu5c0u2cEq0bkqybEmwakmuaEisZkiqZEeoYkemYEakXkaiXEVgLjQ8HCjaJlMkAAABI0lEQVR42u3Mx3qDMBSE0Z/03nsvdhxjcnn/twsYjISR5MUkO5+V9N2ZYUPEpogtEdsidkTsitgTsS/iQMShiCMRxyJORJyKOBNxLuJCxKWIKxHXIm5E3Iq4E3Ev4kHEo4gnEc8iXkS8inhLymrJBO8J2UIiw0dc5sRDfEbVRWr1o/pbMMWox9yz6zcLIzMbBTD2VaHu7fr1gjXGA3w5baj5+H0w6x09TDpdaP7rDZhn0sd3y89Y9fcHbPnoYdroZ2w6dQNmg6OHfG4QyrsBC8gdZpVQxtqF4M1mjepFURThTLNgMYsePxaX2WqY6D8GSm2grK2slbGBciHZ9hOE2smNpTuxenhieCdeH06E7qTqvYnImWTbbUSPlKL1wHrgTwZ+AWq+3H5MpRkwAAAAAElFTkSuQmCC'
const SNOWY_PEAKS =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAwFBMVEX////6/P/4+//g7vjf7fbf7fTe7fje7fTe7PTd7Pjc7Pfd7PTc6/Xc6/Pb6/fb6/Xb6vTa6/fa6/Xa6vfZ6vfZ6vba6vTZ6fXY6vfY6vbY6ffY6fXX6fbX6fTW6fbX6PXW6PbW6PTV6PbV6PXU6PbV5/XU5/bU5/TU5vXT5/bS5/XT5vTS5vXS5vTR5vXR5fXQ5fXP5fXP5PXO5PXO5PTN5PTN4/TM4/TL4/TM4vTL4vTK4vTO3OqqvtKbrsFcfGgMVnjaAAAC7klEQVR42u2Ta3eaQBCGp0kbTbBBMWDMoiCWEOsFtV4SdcP//1edYQUWwSye9kNOT58POVlm3mdmUWG/3+9et5vVYj6bjoMgGE9n88Vqs33d7SsBcX67WmI+EKBhudpWNcBu94bzlyGO9weEj0uES9zhbVcFSPMYdxzmOKi4xACbNa0/DgY91rGIDusNgjFdY72tAKzXq0U4pTyGm80m/iXDNFys1psqApwf4nwc32x+J9DRYbhDuMRrqIF5vD+zKK0R5LBYfIvFcqUEBZPRsNex9IaW0NCtTm84mqDglxIIQ3z/uEBDqydoDVrBH4d4CyUwowUsA+fXa4I67mBYtAJeQglM4jeg0wLfBLSCLt5COFcC4xffYVZ8gVSABos5/sskVAOjYNjvWrqWxGOFplvd/jD4OZkpgSAYiA1yAtpgGIzGEyW0wYCZeqOeGer1hm6yQUXBD8+1uySofU2okaBre97zSA34nuswk74GqYC+CCZzXM9/VgO+77o2M+LPUcTpUzSYXS3/DB7m4ztomrhEjb7LeAPbdb0KgOe5fTIY6Y8B51O+Xynvgeu6js2Yaep6Q6DrpsmY7biVABthXdPEFfRj3sBTl9nl8JNzLMANSGEahm5QGuNn8/zEAE8xD0g7hrfbdHgqhxO5J/B4BEMtBOv43+M5YkHuCTxk0HwuDGfgvNAAbZljQ/sMnEOhAVoSPKFVCuYBThvgXiKdcF8GlwRZB+Tz8IEhLhca4C6F8yusH0TDXYFjPjEkj+E2gecm8NsT+IkgaQBVQ6F80gA3Ai4uANkl+I0ElYlDjNwAhXyp4Zg/Cg4FAS+dwAsLiPq7PAGuEc5LJ3B+LUjLSf2Q1aGk4V1uyJVTQdYAqgZ5v7T+nu0IuXwmkAwf1yE3IJuQjZDLkiBpAK5o4BUEV6UNh5J8SR1y9VzDoZgvqasFV2frByFQNCgFX/6Q/4J/SxDJTy84/DVBFEmlSw6fRhBFUumiw2cRRJFUuuzwG+qew9oBo+n5AAAAAElFTkSuQmCC'

type Item = Readonly<{
  src?: string
  alt?: string
  label: string
  caption?: string
  loading?: boolean
  disabled?: boolean
  remove?: boolean
  always?: boolean
  click?: boolean
}>

const itemView = <Msg>(h: Html.H<Msg>, item: Item, interaction?: Msg) =>
  h.div.class('thumbnail-docs-item').children(
    Thumbnail(h, {
      ...(item.src === undefined ? {} : { src: item.src }),
      ...(item.alt === undefined ? {} : { alt: item.alt }),
      label: item.label,
      ...(item.loading === true ? { loading: true } : {}),
      ...(item.disabled === true ? { disabled: true } : {}),
      ...(item.click === true && interaction !== undefined
        ? { onClick: interaction }
        : {}),
      ...(item.remove === true && interaction !== undefined
        ? { onRemove: interaction }
        : {}),
      ...(item.always === true ? { showRemoveOn: 'always' as const } : {}),
    }),
    item.caption === undefined
      ? undefined
      : h.span.class('thumbnail-docs-caption').children(item.caption),
  )

const row = <Msg>(
  h: Html.H<Msg>,
  heading: string | undefined,
  items: ReadonlyArray<Item>,
  interaction?: Msg,
) =>
  h.div
    .class('thumbnail-docs-column')
    .children(
      heading === undefined
        ? undefined
        : h.span.class('thumbnail-docs-caption').children(heading),
      h.div
        .class('thumbnail-docs-row')
        .children(items.map(item => itemView(h, item, interaction))),
    )

const staticRow =
  (
    heading: string | undefined,
    items: ReadonlyArray<Item>,
  ): DocsExampleImplementation['view'] =>
  h =>
    row(h, heading, items)

const Message = UiSchema.TaggedEnum({ InteractedWithThumbnail: {} })
const InteractiveThumbnails = Html.component({
  name: 'DocsInteractiveThumbnails',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Null,
  message: Message,
}).make({
  init: () => null,
  update: { InteractedWithThumbnail: $ => $.model },
  view: h =>
    row(
      h,
      h.props.kind === 'gallery'
        ? 'Click to preview, dismiss to remove'
        : 'Remove button adapts contrast to image luminance',
      h.props.kind === 'gallery' ? galleryItems : removableItems,
      Message.InteractedWithThumbnail(),
    ),
})

const interactive =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    InteractiveThumbnails(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind },
    })

const galleryItems: ReadonlyArray<Item> = [
  {
    src: NIGHT_FOREST,
    alt: 'Forest at night under a crescent moon',
    label: 'forest-night.jpg',
    click: true,
    remove: true,
  },
  {
    src: MISTY_VALLEY,
    alt: 'Misty mountain valley',
    label: 'misty-valley.jpg',
    click: true,
    remove: true,
  },
  {
    src: GOLDEN_SUNSET,
    alt: 'Golden sunset over mountains',
    label: 'golden-sunset.jpg',
    click: true,
    remove: true,
  },
  {
    src: SNOWY_PEAKS,
    alt: 'Snowy mountain peaks',
    label: 'snowy-peaks.jpg',
    click: true,
    remove: true,
  },
]
const removableItems = galleryItems.map(item => ({
  ...item,
  click: false,
  always: true,
}))

const states: ReadonlyArray<Item> = [
  { label: 'report.pdf', caption: 'Placeholder' },
  { label: 'uploading.jpg', loading: true, caption: 'Skeleton' },
  {
    src: MISTY_VALLEY,
    alt: 'Misty mountain valley',
    loading: true,
    label: 'misty-valley.jpg',
    caption: 'Uploading',
  },
  {
    src: MISTY_VALLEY,
    alt: 'Misty mountain valley',
    label: 'misty-valley.jpg',
    caption: 'Loaded',
  },
]

const disabledView: DocsExampleImplementation['view'] = h =>
  h.div.class('thumbnail-docs-sections').children(
    h.div.class('thumbnail-docs-item').children(
      h.span.class('thumbnail-docs-caption').children('Enabled'),
      h.div.class('thumbnail-docs-row').children(
        itemView(h, {
          src: GOLDEN_SUNSET,
          alt: 'Golden sunset over mountains',
          label: 'golden-sunset.jpg',
          remove: true,
          always: true,
        }),
        itemView(h, {
          label: 'document.pdf',
          remove: true,
          always: true,
        }),
      ),
    ),
    h.div.class('thumbnail-docs-item').children(
      h.span.class('thumbnail-docs-caption').children('Disabled'),
      h.div.class('thumbnail-docs-row').children(
        itemView(h, {
          src: GOLDEN_SUNSET,
          alt: 'Golden sunset over mountains',
          label: 'golden-sunset.jpg',
          disabled: true,
          remove: true,
        }),
        itemView(h, {
          label: 'document.pdf',
          disabled: true,
          remove: true,
        }),
      ),
    ),
  )

const source = exampleApplicationSource({
  imports: `import { Thumbnail } from '@/ui/effect/ui'
import './thumbnail.css'`,
  body: `Thumbnail(h, {
  src: imageSource,
  alt: 'Snowy mountain peaks',
  label: 'snowy-peaks.jpg',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Thumbnail } from '@/ui/effect/ui'

Thumbnail(h, { src, alt: 'Image', label: 'image.jpg' })`,
  examples: [
    {
      title: 'Thumbnail',
      view: staticRow(undefined, [
        {
          src: SNOWY_PEAKS,
          alt: 'Snowy mountain peaks',
          label: 'snowy-peaks.jpg',
        },
      ]),
      source,
    },
    {
      title: 'Thumbnail — States',
      view: staticRow(
        'Lifecycle: empty → uploading → processing → loaded',
        states,
      ),
      source,
    },
    { title: 'Thumbnail — Gallery', view: interactive('gallery'), source },
    { title: 'Thumbnail — Removable', view: interactive('remove'), source },
    { title: 'Thumbnail — Disabled', view: disabledView, source },
  ],
})
