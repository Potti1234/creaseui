import { Schema as S } from 'effect'
import { type Html, html } from "foldkit/html";
import { m } from 'foldkit/message'

import { cn } from "@/lib/utils";

export const Model = S.Struct({ status: S.Literals(['loading', 'loaded', 'error']) })
export type Model = typeof Model.Type
export const Loaded = m('Loaded')
export const Failed = m('Failed')
export const Message = S.Union([Loaded, Failed])
export type Message = typeof Message.Type
export const init = (): Model => ({ status: 'loading' })
export const update = (_model: Model, message: Message): Model => ({ status: message._tag === 'Loaded' ? 'loaded' : 'error' })

export type AvatarProps = Readonly<{
  size?: "default" | "sm" | "lg";
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export const avatar = <Msg>(props: AvatarProps): Html => {
  const h = html<Msg>();

  return h.div(
    [
      h.DataAttribute("slot", "avatar"),
      h.DataAttribute("size", props.size ?? "default"),
      h.Class(
        cn(
          "group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
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
  model?: Model
}>;

export const avatarImage = <Msg>(props: AvatarImageProps & Readonly<{ toParentMessage?: (message: Message) => Msg }>): Html => {
  const h = html<Msg>();

  if (props.model?.status === 'error') return h.empty

  return h.img([
    h.DataAttribute("slot", "avatar-image"),
    h.Src(props.src),
    h.Alt(props.alt),
    ...(props.toParentMessage === undefined ? [] : [h.OnLoad(props.toParentMessage(Loaded())), h.OnError(props.toParentMessage(Failed()))]),
    ...(props.model?.status === 'loaded' ? [] : [h.DataAttribute('loading', '')]),
    h.Class(cn("relative z-10 aspect-square size-full data-[loading]:opacity-0", props.class)),
  ]);
};

export type AvatarFallbackProps = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
  model?: Model
}>;

export const avatarFallback = <Msg>(props: AvatarFallbackProps): Html => {
  const h = html<Msg>();

  if (props.model?.status === 'loaded') return h.empty

  return h.div(
    [
      h.DataAttribute("slot", "avatar-fallback"),
      h.Class(
        cn(
          "absolute inset-0 flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};
