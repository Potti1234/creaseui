import type { Html, HtmlBuilder } from "foldkit/html";
import { blockPreviewPath, blocksStyleXTablePath } from "@/route";
import * as Icon from "@/lib/icon";
import { cn } from "@/lib/utils";
import { blockSourcePath } from "./block-source";
import { BLOCKS, type BlockCategory } from "./catalog";
export { BLOCKS } from "./catalog";
export { blockSourcePath, loadBlockSource } from "./block-source";
export type Props<M> = Readonly<{
  renderer: "tailwind" | "stylex";
  category: BlockCategory;
  isDark: boolean;
  codeBlock: string;
  codeSource: string | null;
  copiedCode: string | null;
  onCategory: (category: BlockCategory) => M;
  onToggleCode: (name: string) => M;
  onCopyCode: (code: string) => M;
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
      ).map((block) => {
        const codeOpen = props.codeBlock === block.name;
        const codeSource = codeOpen ? props.codeSource : null;
        const isCopied =
          codeSource !== null && props.copiedCode === codeSource;
        return h.section(
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
                h.div(
                  [h.Class("flex shrink-0 items-center gap-2")],
                  [
                    h.button(
                      [
                        h.Type("button"),
                        h.OnClick(props.onToggleCode(block.name)),
                        h.AriaPressed(codeOpen ? "true" : "false"),
                        h.AriaLabel(
                          codeOpen
                            ? `Hide code for ${block.name}`
                            : `View code for ${block.name}`,
                        ),
                        h.DataAttribute("code-toggle", block.name),
                        h.Class(
                          cn(
                            "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring",
                            codeOpen
                              ? "border-foreground bg-foreground text-background"
                              : "bg-background hover:bg-accent",
                          ),
                        ),
                      ],
                      ["Code"],
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
              ],
            ),
            codeOpen
              ? h.div(
                  [
                    h.DataAttribute("block-code", block.name),
                    h.Class(
                      "flex h-200 w-full flex-col overflow-hidden rounded-xl border bg-muted/35",
                    ),
                  ],
                  [
                    h.div(
                      [
                        h.Class(
                          "flex items-center justify-between gap-2 border-b bg-background px-3 py-1.5",
                        ),
                      ],
                      [
                        h.span(
                          [
                            h.Class(
                              "truncate font-mono text-xs text-muted-foreground",
                            ),
                          ],
                          [
                            blockSourcePath(props.renderer, block.name).slice(
                              1,
                            ),
                          ],
                        ),
                        codeSource === null
                          ? h.empty
                          : h.button(
                              [
                                h.Type("button"),
                                h.OnClick(props.onCopyCode(codeSource)),
                                h.AriaLabel(
                                  isCopied
                                    ? `${block.name} source copied`
                                    : `Copy ${block.name} source`,
                                ),
                                h.Title(
                                  isCopied ? "Copied" : "Copy code",
                                ),
                                h.Class(
                                  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                                ),
                              ],
                              [
                                Icon.icon<M>(
                                  isCopied ? "check" : "copy",
                                  { class: "size-4" },
                                  h,
                                ),
                              ],
                            ),
                      ],
                    ),
                    codeSource === null
                      ? h.div(
                          [
                            h.Role("status"),
                            h.Class(
                              "flex flex-1 items-center justify-center text-sm text-muted-foreground",
                            ),
                          ],
                          [`Loading ${block.name} source…`],
                        )
                      : h.pre(
                          [
                            h.Attribute("tabindex", "0"),
                            h.Class(
                              "m-0 min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-6 text-foreground",
                            ),
                          ],
                          [
                            h.code(
                              [h.Class("block w-max min-w-full")],
                              [codeSource],
                            ),
                          ],
                        ),
                  ],
                )
              : h.keyed("iframe")(
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
        );
      }),
    ],
  );
