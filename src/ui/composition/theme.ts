import type { Html, HtmlBuilder } from "foldkit/html";
import type { SemanticThemeName } from "@/stylex/composition/theme";
export type { SemanticThemeName } from "@/stylex/composition/theme";
export const themeScope = <M>(
  props: Readonly<{
    children: ReadonlyArray<Html | string>;
    theme?: SemanticThemeName | undefined;
  }>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.DataAttribute("semantic-theme", props.theme ?? "default"),
      h.Class(
        props.theme === "compact"
          ? "[--block-space-md:0.75rem] [--block-space-sm:0.5rem] [--block-space-lg:1rem]"
          : props.theme === "expressive"
            ? "[--block-space-md:1.25rem] [--block-space-sm:0.75rem] [--block-space-lg:2rem]"
            : "[--block-space-md:1rem] [--block-space-sm:0.75rem] [--block-space-lg:1.5rem]",
      ),
    ],
    props.children,
  );
