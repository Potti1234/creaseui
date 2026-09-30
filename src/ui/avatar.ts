import { Schema as S } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { cn } from '@/lib/utils';

export const Model = S.Struct({
  status: S.Literals(['loading', 'loaded', 'error']),
  // The source the current status was resolved for. Base UI resets the
  // status to 'loading' whenever the requested source changes; recording it
  // here lets the views derive that reset without a DOM read. Absent means
  // unresolved, so legacy `{ status }` models keep their status as-is.
  resolvedSrc: S.optional(S.String),
});
export type Model = typeof Model.Type;


export const Message = defineMessageUnion({
  Loaded: { src: S.String },
  Failed: { src: S.String },
});
export type Message = typeof Message.Type;
export const init = (): Model => ({ status: 'loading' });
export const update = (_model: Model, message: Message): Model => ({
  status: message._tag === 'Loaded' ? 'loaded' : 'error',
  resolvedSrc: message.src,
});

const effectiveStatus = (
  model: Model | undefined,
  src: string | undefined,
  fallback: 'loading' | 'loaded',
): 'loading' | 'loaded' | 'error' => {
  if (model === undefined) return fallback;
  if (
    model.resolvedSrc !== undefined &&
    src !== undefined &&
    model.resolvedSrc !== src
  )
    return 'loading';
  return model.status;
};

export type AvatarProps = Readonly<{
  size?: 'default' | 'sm' | 'lg';
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export const avatar = <Msg>(props: AvatarProps, h: HtmlBuilder<Msg>): Html => {
  return h.span(
    [
      h.DataAttribute('slot', 'avatar'),
      h.DataAttribute('size', props.size ?? 'default'),
      h.Class(
        cn(
          'group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export type AvatarImageProps = Readonly<{
  src: string;
  alt: string;
  class?: string;
  model?: Model;
  /** Base UI parity: keep the img mounted while the source resolves, reporting data-loading/data-error/aria-hidden. */
  keepMounted?: boolean;
}>;

export const avatarImage = <Msg>(
  props: AvatarImageProps &
    Readonly<{ toParentMessage?: (message: Message) => Msg }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const status = effectiveStatus(props.model, props.src, 'loaded');
  const wiring =
    props.toParentMessage === undefined
      ? []
      : [
          h.OnLoad(props.toParentMessage(Message.Loaded({ src: props.src }))),
          h.OnError(props.toParentMessage(Message.Failed({ src: props.src }))),
        ];

  if (props.keepMounted === true)
    return h.img([
      h.DataAttribute('slot', 'avatar-image'),
      h.Src(props.src),
      h.Alt(props.alt),
      ...wiring,
      ...(status === 'loading' ? [h.DataAttribute('loading', '')] : []),
      ...(status === 'error' ? [h.DataAttribute('error', '')] : []),
      // Until the image is displayable the fallback owns the accessible name.
      ...(status === 'loaded' ? [] : [h.AriaHidden(true)]),
      h.Class(
        cn(
          'relative z-10 aspect-square size-full data-[loading]:opacity-0 data-[error]:opacity-0',
          props.class,
        ),
      ),
    ]);

  if (status === 'loaded')
    return h.img([
      h.DataAttribute('slot', 'avatar-image'),
      h.Src(props.src),
      h.Alt(props.alt),
      ...wiring,
      h.Class(
        cn('relative z-10 aspect-square size-full', props.class),
      ),
    ]);

  // Base UI's detached `new Image()` preload: the real <img> stays unmounted
  // until the source resolves, while a hidden probe loads in its place and
  // reports load/error so the app's Model advances. Once 'loaded' the real
  // element mounts already cached.
  if (props.toParentMessage === undefined) return h.empty;

  return h.img([
    h.DataAttribute('slot', 'avatar-image-probe'),
    h.Src(props.src),
    h.Alt(''),
    h.AriaHidden(true),
    h.Hidden(true),
    ...wiring,
  ]);
};

export type AvatarFallbackProps = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
  model?: Model;
  /** Source the sibling image is resolving; a stale 'loaded' status re-hides the fallback. */
  src?: string;
}>;

export const avatarFallback = <Msg>(
  props: AvatarFallbackProps,
  h: HtmlBuilder<Msg>,
): Html => {
  if (effectiveStatus(props.model, props.src, 'loading') === 'loaded')
    return h.empty;

  return h.span(
    [
      h.DataAttribute('slot', 'avatar-fallback'),
      h.Class(
        cn(
          'absolute inset-0 flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export type AvatarBadgeProps = Readonly<{
  class?: string;
  children?: ReadonlyArray<Html | string>;
}>;

export const avatarBadge = <Msg>(
  props: AvatarBadgeProps,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.span(
    [
      h.DataAttribute('slot', 'avatar-badge'),
      h.Class(
        cn(
          'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none',
          'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
          'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
          'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
          props.class,
        ),
      ),
    ],
    [...(props.children ?? [])],
  );
};

export type AvatarGroupProps = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export const avatarGroup = <Msg>(
  props: AvatarGroupProps,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'avatar-group'),
      h.Class(
        cn(
          'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export type AvatarGroupCountProps = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export const avatarGroupCount = <Msg>(
  props: AvatarGroupCountProps,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'avatar-group-count'),
      h.Class(
        cn(
          'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};
