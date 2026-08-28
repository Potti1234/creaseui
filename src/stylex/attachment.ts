import * as stylex from "@stylexjs/stylex";
import type { StaticStyles } from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import type { ComponentLayoutStyle } from "./contracts";
import { foundationTokens } from "./foundations-tokens.stylex";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
import { interactionTokens } from './interaction-tokens.stylex.const'
export type AttachmentState =
  "idle" | "uploading" | "processing" | "error" | "done";
type Size = "default" | "sm" | "xs";
type Orientation = "horizontal" | "vertical";
type ChildrenProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  layoutStyle?: ComponentLayoutStyle;
}>;
const styles = stylex.create({
  root: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusXl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    alignItems: "center",
    backgroundColor: tokens.card,
    boxShadow: {
      default: tokens.shadowNone,
      ':focus-within': tokens.focusRingShadow,
    },
    color: tokens.cardForeground,
    display: "flex",
    flexShrink: 0,
    flexWrap: "wrap",
    position: "relative",
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: "background-color",
    maxWidth: "100%",
    minWidth: 0,
    width: "fit-content",
  },
  sm: { gap: "0.625rem", fontSize: "0.75rem" },
  xs: {
    borderRadius: foundationTokens.radiusLg,
    gap: "0.375rem",
    fontSize: "0.75rem",
  },
  horizontal: { minWidth: "10rem" },
  vertical: { alignItems: "stretch", flexDirection: "column", width: "6rem" },
  error: { borderColor: tokens.destructive },
  idle: { borderStyle: "dashed" },
  media: {
    borderRadius: foundationTokens.radiusLg,
    overflow: "hidden",
    alignItems: "center",
    aspectRatio: "1",
    backgroundColor: foundationTokens.muted,
    color: tokens.foreground,
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    position: "relative",
    height: "2.5rem",
    width: "2.5rem",
  },
  mediaImage: { opacity: 0.6 },
  content: { flex: "1", lineHeight: 1.25, maxWidth: "100%", minWidth: 0 },
  actions: {
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    position: "relative",
    zIndex: 20,
  },
  group: {
    gap: "0.75rem",
    paddingBlock: "0.25rem",
    display: "flex",
    minWidth: 0,
    overflowX: "auto",
  },
  title: {
    overflow: "hidden",
    display: "block",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
    minWidth: 0,
  },
  description: {
    overflow: "hidden",
    color: tokens.mutedForeground,
    display: "block",
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "0.125rem",
    maxWidth: "100%",
    minWidth: 0,
  },
  trigger: { inset: 0, outlineStyle: "none", position: "absolute", zIndex: 10 },
});
export const attachmentVariants = (
  o: Readonly<{ size?: Size | null; orientation?: Orientation | null }> = {},
): string =>
  className(
    styles.root,
    o.size !== undefined && o.size !== null && o.size !== "default" && styles[o.size],
    styles[o.orientation ?? "horizontal"],
  );
export const attachment = <Msg>(
  p: ChildrenProps &
    Readonly<{
      state?: AttachmentState;
      size?: Size;
      orientation?: Orientation;
    }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const state = p.state ?? "done",
    size = p.size ?? "default",
    orientation = p.orientation ?? "horizontal";
  return h.div(
    [
      h.DataAttribute("slot", "attachment"),
      h.DataAttribute("state", state),
      h.DataAttribute("size", size),
      h.DataAttribute("orientation", orientation),
      h.Class(
        className(
          styles.root,
          size !== "default" && styles[size],
          styles[orientation],
          state === "error" && styles.error,
          state === "idle" && styles.idle,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
};
export const attachmentMedia = <Msg>(
  p: ChildrenProps & Readonly<{ variant?: "icon" | "image" }>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.DataAttribute("slot", "attachment-media"),
      h.DataAttribute("variant", p.variant ?? "icon"),
      h.Class(
        className(
          styles.media,
          p.variant === "image" && styles.mediaImage,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
const part =
  (slot: string, style: StaticStyles) =>
  <Msg>(p: ChildrenProps, h: HtmlBuilder<Msg>): Html =>
    h.div(
      [h.DataAttribute("slot", slot), h.Class(className(style, p.layoutStyle))],
      [...p.children],
    );
export const attachmentContent = part("attachment-content", styles.content);
export const attachmentActions = part("attachment-actions", styles.actions);
export const attachmentGroup = part("attachment-group", styles.group);
export const attachmentTitle = <Msg>(
  p: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.span(
    [
      h.DataAttribute("slot", "attachment-title"),
      h.Class(className(styles.title, p.layoutStyle)),
    ],
    [...p.children],
  );
export const attachmentDescription = <Msg>(
  p: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.span(
    [
      h.DataAttribute("slot", "attachment-description"),
      h.Class(className(styles.description, p.layoutStyle)),
    ],
    [...p.children],
  );
export const attachmentTrigger = <Msg>(
  p: Readonly<{
    onClick: Msg;
    label: string;
    layoutStyle?: ComponentLayoutStyle;
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.button(
    [
      h.Type("button"),
      h.OnClick(p.onClick),
      h.DataAttribute("slot", "attachment-trigger"),
      h.AriaLabel(p.label),
      h.Class(className(styles.trigger, p.layoutStyle)),
    ],
    [],
  );


