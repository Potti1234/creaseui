import { type Html, html } from "foldkit/html";

import * as Icon from "@/lib/icon";
import { cn } from "@/lib/utils";

type Slot = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export type BreadcrumbProps = Slot;

export const breadcrumb = <Msg>(props: BreadcrumbProps): Html => {
  const h = html<Msg>();

  return h.nav(
    [
      h.AriaLabel("breadcrumb"),
      h.DataAttribute("slot", "breadcrumb"),
      h.Class(cn(props.class)),
    ],
    [...props.children],
  );
};

export const breadcrumbList = <Msg>(props: Slot): Html => {
  const h = html<Msg>();

  return h.ol(
    [
      h.DataAttribute("slot", "breadcrumb-list"),
      h.Class(
        cn(
          "flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5",
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export const breadcrumbItem = <Msg>(props: Slot): Html => {
  const h = html<Msg>();

  return h.li(
    [
      h.DataAttribute("slot", "breadcrumb-item"),
      h.Class(cn("inline-flex items-center gap-1.5", props.class)),
    ],
    [...props.children],
  );
};

export type BreadcrumbLinkProps = Slot &
  Readonly<{
    href: string;
  }>;

export const breadcrumbLink = <Msg>(props: BreadcrumbLinkProps): Html => {
  const h = html<Msg>();

  return h.a(
    [
      h.DataAttribute("slot", "breadcrumb-link"),
      h.Href(props.href),
      h.Class(cn("transition-colors hover:text-foreground", props.class)),
    ],
    [...props.children],
  );
};

export const breadcrumbPage = <Msg>(props: Slot): Html => {
  const h = html<Msg>();

  return h.span(
    [
      h.DataAttribute("slot", "breadcrumb-page"),
      h.Role("link"),
      h.AriaDisabled(true),
      h.AriaCurrent("page"),
      h.Class(cn("font-normal text-foreground", props.class)),
    ],
    [...props.children],
  );
};

export type BreadcrumbSeparatorProps = Readonly<{
  class?: string;
  children?: ReadonlyArray<Html | string>;
}>;

export const breadcrumbSeparator = <Msg>(
  props: BreadcrumbSeparatorProps = {},
): Html => {
  const h = html<Msg>();

  return h.li(
    [
      h.DataAttribute("slot", "breadcrumb-separator"),
      h.Role("presentation"),
      h.AriaHidden(true),
      h.Class(cn("[&>svg]:size-3.5", props.class)),
    ],
    props.children === undefined
      ? [Icon.chevronRight<Msg>()]
      : [...props.children],
  );
};

export type BreadcrumbEllipsisProps = Readonly<{
  class?: string;
}>;

export const breadcrumbEllipsis = <Msg>(
  props: BreadcrumbEllipsisProps = {},
): Html => {
  const h = html<Msg>();

  return h.span(
    [
      h.DataAttribute("slot", "breadcrumb-ellipsis"),
      h.Role("presentation"),
      h.AriaHidden(true),
      h.Class(cn("flex size-9 items-center justify-center", props.class)),
    ],
    [
      Icon.moreHorizontal<Msg>({ class: "size-4" }),
      h.span([h.Class("sr-only")], ["More"]),
    ],
  );
};
