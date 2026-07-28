import { type Html, html } from "foldkit/html";

import { cn } from "@/lib/utils";

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
}>;

export const avatarImage = <Msg>(props: AvatarImageProps): Html => {
  const h = html<Msg>();

  return h.img([
    h.DataAttribute("slot", "avatar-image"),
    h.Src(props.src),
    h.Alt(props.alt),
    h.Class(cn("relative z-10 aspect-square size-full", props.class)),
  ]);
};

export type AvatarFallbackProps = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export const avatarFallback = <Msg>(props: AvatarFallbackProps): Html => {
  const h = html<Msg>();

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

// PORT NOTE: Radix tracks image loading and swaps in the fallback. Without that
// primitive, the fallback is layered behind the image so it remains visible
// until the image paints and whenever the image source cannot render.
