import * as stylex from "@stylexjs/stylex";
import type { StaticStyles } from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import type { ComponentLayoutStyle } from "./contracts";
import { attachmentScope } from "./attachment.markers.stylex";
import { buttonVisualStyles } from "./button";
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
    backgroundColor: {
      default: tokens.card,
      ':has(> a):hover': `color-mix(in oklab, ${tokens.muted} 50%, transparent)`,
      ':has(> button):hover': `color-mix(in oklab, ${tokens.muted} 50%, transparent)`,
    },
    boxShadow: {
      default: tokens.shadowNone,
      ':focus-within': '0 0 0 1px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    color: tokens.cardForeground,
    display: "flex",
    flexShrink: 0,
    flexWrap: "wrap",
    fontSize: "0.875rem",
    lineHeight: '1.25rem',
    position: "relative",
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    paddingInline: {
      default: null,
      ':has([data-slot=attachment-media])': '0.5rem',
      ':has([data-slot=attachment-content]):not(:has([data-slot=attachment-media]))': '0.625rem',
    },
    paddingBlock: {
      default: null,
      ':has([data-slot=attachment-media])': '0.5rem',
      ':has([data-slot=attachment-content]):not(:has([data-slot=attachment-media]))': '0.5rem',
    },
    maxWidth: "100%",
    minWidth: 0,
    width: "fit-content",
  },
  sm: {
    gap: "0.625rem",
    fontSize: "0.75rem",
    lineHeight: '1rem',
    paddingInline: {
      default: null,
      ':has([data-slot=attachment-media])': '0.375rem',
      ':has([data-slot=attachment-content]):not(:has([data-slot=attachment-media]))': '0.5rem',
    },
    paddingBlock: {
      default: null,
      ':has([data-slot=attachment-media])': '0.375rem',
      ':has([data-slot=attachment-content]):not(:has([data-slot=attachment-media]))': '0.375rem',
    },
  },
  xs: {
    borderRadius: foundationTokens.radiusLg,
    gap: "0.375rem",
    fontSize: "0.75rem", lineHeight: '1rem',
    paddingInline: {
      default: null,
      ':has([data-slot=attachment-media])': '0.25rem',
      ':has([data-slot=attachment-content]):not(:has([data-slot=attachment-media]))': '0.375rem',
    },
    paddingBlock: {
      default: null,
      ':has([data-slot=attachment-media])': '0.25rem',
      ':has([data-slot=attachment-content]):not(:has([data-slot=attachment-media]))': '0.25rem',
    },
  },
  horizontal: { alignItems: "center", minWidth: "10rem" },
  vertical: {
    flexDirection: "column",
    width: {
      default: '6rem',
      ':has([data-slot=attachment-content])': '7.5rem',
    },
  },
  error: {
    borderColor: `color-mix(in oklab, ${tokens.destructive} 30%, transparent)`,
  },
  idle: { borderStyle: "dashed" },
  media: {
    borderRadius: {
      default: foundationTokens.radiusLg,
      [stylex.when.ancestor('[data-size=xs]', attachmentScope)]:
        foundationTokens.radiusMd,
    },
    overflow: "hidden",
    alignItems: "center",
    aspectRatio: "1",
    backgroundColor: {
      default: foundationTokens.muted,
      [stylex.when.ancestor('[data-state=error]', attachmentScope)]:
        `color-mix(in oklab, ${tokens.destructive} 10%, transparent)`,
    },
    color: {
      default: tokens.foreground,
      [stylex.when.ancestor('[data-state=error]', attachmentScope)]:
        tokens.destructive,
    },
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    position: "relative",
    height: {
      default: '2.5rem',
      [stylex.when.ancestor('[data-orientation=vertical]', attachmentScope)]:
        'auto',
      [stylex.when.ancestor('[data-size=sm]', attachmentScope)]: '2rem',
      [stylex.when.ancestor('[data-size=xs]', attachmentScope)]: '1.75rem',
    },
    width: {
      default: '2.5rem',
      [stylex.when.ancestor('[data-orientation=vertical]', attachmentScope)]:
        '100%',
      [stylex.when.ancestor('[data-size=sm]', attachmentScope)]: '2rem',
      [stylex.when.ancestor('[data-size=xs]', attachmentScope)]: '1.75rem',
    },
  },
  mediaImage: {
    opacity: {
      default: 0.6,
      [stylex.when.ancestor('[data-state=done]', attachmentScope)]: 1,
    },
  },
  content: {
    flex: "1",
    lineHeight: 1.25,
    maxWidth: "100%",
    minWidth: 0,
    paddingInline: {
      default: null,
      [stylex.when.ancestor('[data-orientation=vertical]', attachmentScope)]:
        '0.25rem',
    },
  },
  actions: {
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    gap: {
      default: null,
      [stylex.when.ancestor('[data-orientation=vertical]', attachmentScope)]:
        '0.25rem',
    },
    position: {
      default: 'relative',
      [stylex.when.ancestor('[data-orientation=vertical]', attachmentScope)]:
        'absolute',
    },
    top: {
      default: null,
      [stylex.when.ancestor('[data-orientation=vertical]', attachmentScope)]:
        '0.75rem',
    },
    right: {
      default: null,
      [stylex.when.ancestor('[data-orientation=vertical]', attachmentScope)]:
        '0.75rem',
    },
    zIndex: 20,
  },
  group: {
    gap: "0.75rem",
    paddingBlock: "0.25rem",
    display: "flex",
    minWidth: 0,
    overflowX: "auto",
    overscrollBehaviorX: 'contain',
    scrollPaddingInline: '0.25rem',
    scrollSnapType: 'x mandatory',
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
    color: {
      default: tokens.mutedForeground,
      [stylex.when.ancestor('[data-state=error]', attachmentScope)]:
        `color-mix(in oklab, ${tokens.destructive} 80%, transparent)`,
    },
    display: "block",
    fontSize: "0.75rem", lineHeight: '1rem',
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "0.125rem",
    maxWidth: "100%",
    minWidth: 0,
  },
  trigger: {
    inset: 0,
    outlineStyle: "none",
    position: "absolute",
    zIndex: 10,
    boxShadow: {
      default: null,
      ':focus-visible': tokens.focusRingShadow,
    },
  },
  action: {
    backgroundClip: 'padding-box',
    borderColor: tokens.transparent,
    borderRadius: 'min(var(--radius-md), 8px)',
    borderStyle: 'solid',
    borderWidth: 1,
    gap: 'normal',
  },
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
          // eslint-disable-next-line no-restricted-syntax -- reason: defineMarker scopes are stylex.props-compatible but absent from the narrow StaticStyles surface.
          attachmentScope as unknown as StaticStyles,
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
export const attachmentAction = <Msg>(
  p: Readonly<{
    onClick: Msg;
    label: string;
    children: ReadonlyArray<Html | string>;
    layoutStyle?: ComponentLayoutStyle;
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.button(
    [
      h.Type("button"),
      h.OnClick(p.onClick),
      h.DataAttribute("slot", "attachment-action"),
      h.AriaLabel(p.label),
      h.Class(
        className(
          ...buttonVisualStyles({ variant: "ghost", size: "icon-xs" }),
          styles.action,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
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


