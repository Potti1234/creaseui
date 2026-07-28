import { type Html, html } from "foldkit/html";

import { cn } from "@/lib/utils";

export type SeparatorProps = Readonly<{
  orientation?: "horizontal" | "vertical";
  class?: string;
}>;

export const separator = <Msg>(props: SeparatorProps = {}): Html => {
  const h = html<Msg>();
  const orientation = props.orientation ?? "horizontal";

  return h.div(
    [
      h.DataAttribute("slot", "separator"),
      h.DataAttribute("orientation", orientation),
      h.Role("none"),
      h.Class(
        cn(
          "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
          props.class,
        ),
      ),
    ],
    [],
  );
};
