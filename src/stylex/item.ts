import * as stylex from "@stylexjs/stylex";
import type { StaticStyles } from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import type { ComponentLayoutStyle } from "./contracts";
import { foundationTokens } from "./foundations-tokens.stylex";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
type SlotProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  layoutStyle?: ComponentLayoutStyle;
}>;
export type ItemVariants = Readonly<{
  variant?: "default" | "outline" | "muted" | null;
  size?: "default" | "sm" | null;
}>;
export type ItemMediaVariants = Readonly<{
  variant?: "default" | "icon" | "image" | null;
}>;
const styles = stylex.create({
  item: {
    padding: "0.75rem",
    borderColor: foundationTokens.transparent,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
    outlineStyle: "none",
  },
  outline: { borderColor: tokens.border },
  muted: { backgroundColor: foundationTokens.mutedSoft },
  sm: { gap: "0.625rem", paddingBlock: "0.625rem", paddingInline: "0.75rem" },
  media: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
  },
  mediaIcon: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusSm,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: foundationTokens.muted,
    height: "2rem",
    width: "2rem",
  },
  mediaImage: {
    borderRadius: foundationTokens.radiusSm,
    overflow: "hidden",
    height: "2.5rem",
    width: "2.5rem",
  },
  content: {
    flex: "1",
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  contentMd: { gap: "0.75rem" },
  title: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.375,
    width: "fit-content",
  },
  description: {
    color: tokens.mutedForeground,
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  actions: { gap: "0.5rem", alignItems: "center", display: "flex" },
  header: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexBasis: "100%",
    justifyContent: "space-between",
  },
  footer: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexBasis: "100%",
    justifyContent: "space-between",
  },
  group: { display: "flex", flexDirection: "column" },
  groupSm: { gap: "0.625rem" },
  groupMd: { gap: "0.75rem" },
  separator: { backgroundColor: tokens.border, height: "1px", width: "100%" },
});
const slotDiv =
  (slot: string, style: StaticStyles) =>
  <Msg>(p: SlotProps, h: HtmlBuilder<Msg>): Html =>
    h.div(
      [h.DataAttribute("slot", slot), h.Class(className(style, p.layoutStyle))],
      [...p.children],
    );
export const itemVariants = (o: ItemVariants = {}): string =>
  className(
    styles.item,
    o.variant === "outline" && styles.outline,
    o.variant === "muted" && styles.muted,
    o.size === "sm" && styles.sm,
  );
export type ItemProps = SlotProps &
  Readonly<{
    variant?: ItemVariants["variant"];
    size?: ItemVariants["size"];
    element?: "div" | "li" | "article";
  }>;
export const item = <Msg>(p: ItemProps, h: HtmlBuilder<Msg>): Html => {
  const variant = p.variant ?? "default",
    size = p.size ?? "default",
    attrs = [
      h.Role("listitem"),
      h.DataAttribute("slot", "item"),
      h.DataAttribute("variant", variant),
      h.DataAttribute("size", size),
      h.Class(
        className(
          styles.item,
          variant === "outline" && styles.outline,
          variant === "muted" && styles.muted,
          size === "sm" && styles.sm,
          p.layoutStyle,
        ),
      ),
    ],
    children = [...p.children];
  return p.element === "li"
    ? h.li(attrs, children)
    : p.element === "article"
      ? h.article(attrs, children)
      : h.div(attrs, children);
};
export const itemMediaVariants = (o: ItemMediaVariants = {}): string =>
  className(
    styles.media,
    o.variant === "icon" && styles.mediaIcon,
    o.variant === "image" && styles.mediaImage,
  );
export type ItemMediaProps = SlotProps &
  Readonly<{ variant?: ItemMediaVariants["variant"] }>;
export const itemMedia = <Msg>(p: ItemMediaProps, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.DataAttribute("slot", "item-media"),
      h.DataAttribute("variant", p.variant ?? "default"),
      h.Class(
        className(
          styles.media,
          p.variant === "icon" && styles.mediaIcon,
          p.variant === "image" && styles.mediaImage,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
export type ItemContentProps = SlotProps & Readonly<{ spacing?: "default" | "md" }>;
export const itemContent = <Msg>(p: ItemContentProps, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute("slot", "item-content"), h.Class(className(styles.content, p.spacing === "md" && styles.contentMd, p.layoutStyle))], [...p.children]);
export const itemTitle = slotDiv("item-title", styles.title);
export const itemDescription = <Msg>(p: SlotProps, h: HtmlBuilder<Msg>): Html =>
  h.p(
    [
      h.DataAttribute("slot", "item-description"),
      h.Class(className(styles.description, p.layoutStyle)),
    ],
    [...p.children],
  );
export const itemActions = slotDiv("item-actions", styles.actions);
export const itemHeader = slotDiv("item-header", styles.header);
export const itemFooter = slotDiv("item-footer", styles.footer);
export type ItemGroupProps = SlotProps & Readonly<{ spacing?: "none" | "sm" | "md" }>;
export const itemGroup = <Msg>(p: ItemGroupProps, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.Role("list"),
      h.DataAttribute("slot", "item-group"),
      h.Class(className(styles.group, p.spacing === "sm" && styles.groupSm, p.spacing === "md" && styles.groupMd, p.layoutStyle)),
    ],
    [...p.children],
  );
export type ItemSeparatorProps = Readonly<{
  layoutStyle?: ComponentLayoutStyle;
}>;
export const itemSeparator = <Msg>(
  p: ItemSeparatorProps = {},
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.Role("none"),
      h.DataAttribute("slot", "item-separator"),
      h.DataAttribute("orientation", "horizontal"),
      h.Class(className(styles.separator, p.layoutStyle)),
    ],
    [],
  );

