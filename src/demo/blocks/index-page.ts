import type { Html, HtmlBuilder } from "foldkit/html";
import { blockPreviewPath, blocksStyleXTablePath } from "@/route";
import { cn } from "@/lib/utils";
import { BLOCKS, type BlockCategory } from "./catalog";
export { BLOCKS } from "./catalog";
export type Props<M> = Readonly<{
  renderer: "tailwind" | "stylex";
  category: BlockCategory;
  isDark: boolean;
  onCategory: (category: BlockCategory) => M;
}>;
const categories = [
  ["all", "All blocks"],
  ["dashboard", "Dashboards"],
  ["sidebar", "Sidebars"],
  ["login", "Authentication"],
] as const;
export const view = <M>(props: Props<M>, h: HtmlBuilder<M>): Html =>
  h.main(
    [
      h.DataAttribute("page", "blocks"),
      h.DataAttribute("renderer", props.renderer),
      h.Class(
        "mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-8 md:px-8",
      ),
    ],
    [
      h.div(
        [h.Class("flex flex-col items-start gap-4")],
        [
          h.h1(
            [
              h.Class(
                "max-w-3xl text-3xl leading-tight font-semibold tracking-tight text-balance xl:text-5xl",
              ),
            ],
            ["Building Blocks for Foldkit"],
          ),
          h.p(
            [
              h.Class(
                "max-w-3xl text-base text-pretty text-muted-foreground sm:text-lg",
              ),
            ],
            [
              "Complete sidebars, dashboards and login layouts. Explore the same blocks in Tailwind or StyleX, with live previews you can open full screen.",
            ],
          ),
        ],
      ),
      h.div(
        [
          h.Class(
            "flex flex-wrap items-center justify-between gap-4 border-b pb-3",
          ),
        ],
        [
          h.div(
            [
              h.Role("group"),
              h.AriaLabel("Block categories"),
              h.Class("flex flex-wrap gap-1"),
            ],
            categories.map(([category, label]) =>
              h.button(
                [
                  h.Type("button"),
                  h.OnClick(props.onCategory(category)),
                  h.AriaPressed(props.category === category ? "true" : "false"),
                  h.Class(
                    cn(
                      "min-h-9 rounded-full px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      props.category === category
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ),
                  ),
                ],
                [label],
              ),
            ),
          ),
          h.a(
            [
              h.Href(blocksStyleXTablePath()),
              h.Class("text-sm underline-offset-4 hover:underline"),
            ],
            ["Table playground ↗"],
          ),
        ],
      ),
      h.p(
        [h.Role("status"), h.Class("text-sm text-muted-foreground")],
        [
          `${BLOCKS.filter((b) => props.category === "all" || b.category === props.category).length} blocks · ${props.renderer === "tailwind" ? "Tailwind" : "StyleX"}`,
        ],
      ),
      ...BLOCKS.filter(
        (b) => props.category === "all" || b.category === props.category,
      ).map((block) =>
        h.section(
          [
            h.Id(block.name),
            h.DataAttribute("block", block.name),
            h.Class("flex scroll-mt-20 flex-col gap-3"),
          ],
          [
            h.div(
              [h.Class("flex items-center justify-between gap-4")],
              [
                h.div(
                  [h.Class("flex min-w-0 flex-col gap-1")],
                  [
                    h.h2([h.Class("text-sm font-semibold")], [block.name]),
                    h.p(
                      [h.Class("text-sm text-muted-foreground")],
                      [block.description],
                    ),
                  ],
                ),
                h.a(
                  [
                    h.Href(blockPreviewPath(props.renderer, block.name)),
                    h.Target("_blank"),
                    h.Rel("noopener noreferrer"),
                    h.AriaLabel(
                      `Open ${block.name} in ${props.renderer === "tailwind" ? "Tailwind" : "StyleX"}`,
                    ),
                    h.Class(
                      "inline-flex h-9 shrink-0 items-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                    ),
                  ],
                  ["Open ↗"],
                ),
              ],
            ),
            h.keyed("iframe")(
              `${props.renderer}-${block.name}-${props.isDark}`,
              [
                h.Src(blockPreviewPath(props.renderer, block.name)),
                h.Title(
                  `${block.name} — ${props.renderer === "tailwind" ? "Tailwind" : "StyleX"} preview`,
                ),
                h.Attribute("loading", "lazy"),
                h.Class("h-[800px] w-full rounded-xl border bg-background"),
              ],
              [],
            ),
          ],
        ),
      ),
    ],
  );
