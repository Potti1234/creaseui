import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';
import type { LightboxMedia } from '@/ui/lightbox';

export type LightboxKind = 'showcase' | 'gallery' | 'video' | 'zoom';

export type LightboxFixture = Readonly<{
  title: string;
  description?: string;
  kind: LightboxKind;
  triggerLabel: string;
}>;

/* Example set ported from Meta Astryx
   packages/cli/assets/templates/blocks/components/Lightbox/*.tsx — same
   demos, same labels/captions; astryx's template-assets stand in as stable
   public URLs (picsum photos, MDN's CC0 flower video). */
export const lightboxFixtures: ReadonlyArray<LightboxFixture> = [
  {
    title: 'Lightbox',
    description: 'A fullscreen image viewer with caption.',
    kind: 'showcase',
    triggerLabel: 'View image',
  },
  {
    title: 'Lightbox — Gallery',
    description:
      'A thumbnail grid that opens a fullscreen gallery. Clicking any thumbnail opens the lightbox at that index. Prev/next navigation lets users browse all images without closing.',
    kind: 'gallery',
    triggerLabel: 'Open gallery',
  },
  {
    title: 'Lightbox — Video',
    description:
      'Opens a video in the lightbox. Native browser controls are available. Zoom and pan are disabled for video items.',
    kind: 'video',
    triggerLabel: 'Play video',
  },
  {
    title: 'Lightbox — Zoom',
    description:
      'A lightbox with zoom and pan enabled. Double-click the image to zoom in; drag to pan around. Double-click again or use the close button to exit.',
    kind: 'zoom',
    triggerLabel: 'Open zoomable image',
  },
];

export const coastMedia: LightboxMedia = {
  src: 'https://picsum.photos/seed/coastline/1280/720',
  alt: 'Coastal shoreline with ocean waves',
  caption:
    'A scenic coastline with waves rolling onto a sandy beach beneath a clear sky.',
};

export const zoomMedia: LightboxMedia = {
  src: 'https://picsum.photos/seed/coastline/1280/720',
  alt: 'Coastal shoreline with ocean waves',
  caption:
    'A scenic coastline. Double-click to zoom in and drag to pan.',
};

export const videoMedia: LightboxMedia = {
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  alt: 'Flower blooming in time-lapse',
  type: 'video',
  caption: 'A flower blooming in time-lapse',
};

export const galleryMedia: ReadonlyArray<LightboxMedia> = [
  {
    src: 'https://picsum.photos/seed/backpack/640/640',
    alt: 'Backpack',
    caption: 'A backpack displayed on a neutral background.',
  },
  {
    src: 'https://picsum.photos/seed/building/640/640',
    alt: 'Modern building',
    caption: 'A modern building with a contemporary architectural design.',
  },
  {
    src: 'https://picsum.photos/seed/coastline/1280/720',
    alt: 'Coastal shoreline with ocean waves',
    caption:
      'A scenic coastline with waves rolling onto a sandy beach beneath a clear sky.',
  },
  {
    src: 'https://picsum.photos/seed/lakeside/640/640',
    alt: 'Illustrated lakeside landscape at sunset',
    caption:
      'A stylized landscape illustration featuring pink clouds reflected over a calm lake at sunset.',
  },
];

export const mediaFor = (kind: LightboxKind): LightboxMedia | ReadonlyArray<LightboxMedia> => {
  switch (kind) {
    case 'showcase':
      return coastMedia;
    case 'gallery':
      return galleryMedia;
    case 'video':
      return videoMedia;
    case 'zoom':
      return zoomMedia;
  }
};

export const mediaCountFor = (kind: LightboxKind): number =>
  kind === 'gallery' ? galleryMedia.length : 1;

const sq = (value: string): string => value.replaceAll("'", "\\'");

const emitMedia = (items: ReadonlyArray<LightboxMedia>): string =>
  `[
${items
  .map(
    item =>
      `    { src: '${item.src}', alt: '${sq(item.alt)}',${item.type === undefined ? '' : ` type: '${item.type}',`}${item.caption === undefined ? '' : ` caption: '${sq(item.caption)}'` } },`,
  )
  .join('\n')}
  ]`;

const emitStyles = `const styles = stylex.create({
  thumbGrid: { display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', width: '8.5rem' },
  thumb: { borderRadius: '0.375rem', cursor: 'pointer', overflow: 'hidden', padding: 0 },
  thumbImg: { aspectRatio: '1 / 1', display: 'block', height: '100%', objectFit: 'cover', width: '100%' },
})`;

const emitView = (fixture: LightboxFixture, isStyleX: boolean): string => {
  const cls = (tailwind: string, stylexRef: string) =>
    isStyleX ? `className(${stylexRef})` : `'${tailwind}'`;
  const media = mediaFor(fixture.kind);
  const mediaItems = Array.isArray(media) ? media : [media];
  const mediaLiteral = emitMedia(mediaItems);
  const trigger =
    fixture.kind === 'gallery'
      ? `h.div([h.Class(${cls('grid w-[136px] grid-cols-2 gap-2', 'styles.thumbGrid')})],
      (${emitMedia(galleryMedia)}).map((item, index) =>
        h.button([
          h.Type('button'),
          h.AriaLabel(item.alt),
          h.OnClick(ClickedOpenLightboxAt({ index })),
          h.Class(${cls('rounded-md overflow-hidden', 'styles.thumb')}),
        ], [
          h.img([h.Src(item.src), h.Alt(item.alt), h.Class(${cls('aspect-square w-full object-cover', 'styles.thumbImg')})]),
        ]),
      ),
    )`
      : `Button.button({ variant: 'outline', onClick: ClickedOpenLightbox(), children: ['${sq(fixture.triggerLabel)}'] }, h)`;
  return `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Lightbox — ${sq(fixture.title)}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    ${trigger},
    Lightbox.lightbox({
      model: model.lightbox,
      toParentMessage: message => GotLightboxMessage({ message }),
      media: ${mediaLiteral},${fixture.kind === 'zoom' ? '\n      hasZoom: true,' : ''}${fixture.kind === 'video' ? '\n      hasAutoPlay: true,' : ''}
    }, h),
  ]),
})`;
};

const source = (
  fixture: LightboxFixture,
  _index: number,
  renderer: 'tailwind' | 'stylex',
): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  const isGallery = fixture.kind === 'gallery';
  const imports = `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\nimport { className } from '@/stylex/style'\n" : ''}
import * as Button from '@/${isStyleX ? 'stylex' : 'ui'}/button'
import * as Lightbox from '@/${isStyleX ? 'stylex' : 'ui'}/lightbox'${isStyleX ? `\n\n${emitStyles}` : ''}`;
  return foldkitApplication({
    title: `Lightbox — ${fixture.title}`,
    imports,
    model: `export const Model = S.Struct({ lightbox: Lightbox.Model })
export type Model = typeof Model.Type`,
    messages: `import { taggedStruct } from 'foldkit/schema'
export const ClickedOpenLightbox = taggedStruct('ClickedOpenLightbox${tag}');
${isGallery ? `export const ClickedOpenLightboxAt = taggedStruct('ClickedOpenLightboxAt${tag}', { index: S.Number });\n` : ''}export const GotLightboxMessage = taggedStruct('GotLightboxMessage${tag}', { message: Lightbox.Message });
export const Message = S.Union([${isGallery ? 'ClickedOpenLightboxAt, ' : ''}ClickedOpenLightbox, GotLightboxMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: { lightbox: Lightbox.init({ id: 'lightbox-${tag.toLowerCase()}', mediaCount: ${String(mediaCountFor(fixture.kind))} }) } })`,
    update: `const mapLightbox = (
  model: Model,
  result: ReturnType<typeof Lightbox.update>,
): Update.Return<Model, Message> => {
  return { model: { ...model, lightbox: result.model }, commands: Command.mapMessages(result.commands, next => GotLightboxMessage({ message: next })) }
}

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ClickedOpenLightbox${tag}':
      return mapLightbox(model, Lightbox.open(model.lightbox))${isGallery ? `
    case 'ClickedOpenLightboxAt${tag}':
      return mapLightbox(model, Lightbox.open(model.lightbox, message.index))` : ''}
    case 'GotLightboxMessage${tag}':
      return mapLightbox(model, Lightbox.update(model.lightbox, message.message))
  }
}`,
    view: emitView(fixture, isStyleX),
  });
};

export const lightboxExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => lightboxFixtures.map((fixture, index) => ({
  title: fixture.title,
  keepIdsCanonical: index === 0,
  ...(fixture.description === undefined ? {} : { description: fixture.description }),
  code: source(fixture, index, renderer),
}));
