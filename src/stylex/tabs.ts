import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import { Tabs as TabsPrimitive } from "@foldkit/ui";
import type { ComponentLayoutStyle } from "./contracts";
import { foundationTokens } from "./foundations-tokens.stylex";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
export const Model = TabsPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = TabsPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = TabsPrimitive.OutMessage;
export type OutMessage<Value extends string = string> = TabsPrimitive.OutMessage<Value>;
export const init = TabsPrimitive.init;
export type TabsListVariants = Readonly<{
  variant?: "default" | "line" | null;
}>;
export type TabsOrientation = "horizontal" | "vertical";
export type TabConfig<Value extends string = string> = Readonly<{
  value: Value;
  label: Html | string;
  content: Html | string;
  isDisabled?: boolean;
}>;
const styles = stylex.create({
  tabs: { gap: "0.5rem", display: "flex" },
  horizontal: { flexDirection: "column" },
  vertical: { flexDirection: "row" },
  list: {
    padding: "3px",
    borderRadius: foundationTokens.radiusLg,
    alignItems: "center",
    backgroundColor: foundationTokens.muted,
    color: tokens.mutedForeground,
    display: "inline-flex",
    justifyContent: "center",
    height: "2.25rem",
    width: "fit-content",
  },
  listVertical: { flexDirection: "column", height: "fit-content" },
  line: {
    borderRadius: "0px",
    gap: "0.25rem",
    backgroundColor: foundationTokens.transparent,
  },
  trigger: {
    borderColor: {
      default: foundationTokens.transparent,
      ":focus-visible": tokens.ring,
    },
    borderRadius: foundationTokens.radiusMd,
    borderStyle: "solid",
    borderWidth: 1,
    flex: "1",
    gap: "0.375rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: foundationTokens.transparent,
    color: {
      default: foundationTokens.foregroundMuted,
      ":hover": tokens.foreground,
    },
    display: "inline-flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    justifyContent: "center",
    outlineStyle: "none",
    whiteSpace: "nowrap",
    height: "calc(100% - 1px)",
  },
  triggerVertical: { justifyContent: "start", width: "100%" },
  selected: {
    backgroundColor: tokens.background,
    boxShadow: foundationTokens.shadowXs,
    color: tokens.foreground,
  },
  disabled: { opacity: 0.5, pointerEvents: "none" },
  content: { flex: "1", outlineStyle: "none" },
});
export const tabsListVariants = (o: TabsListVariants = {}): string =>
  className(styles.list, o.variant === "line" && styles.line);
export type TabsProps<Value extends string, Msg> = Readonly<{
  model: Model;
  selectedValue: Value;
  toParentMessage: (message: Message) => Msg;
  tabs: ReadonlyArray<TabConfig<Value>>;
  ariaLabel?: string;
  orientation?: TabsOrientation;
  direction?: 'ltr' | 'rtl';
  variant?: TabsListVariants["variant"];
  layoutStyle?: ComponentLayoutStyle;
  listLayoutStyle?: ComponentLayoutStyle;
  triggerLayoutStyle?: ComponentLayoutStyle;
  contentLayoutStyle?: ComponentLayoutStyle;
}>;
const renderTabs = <Value extends string, Msg>(
  bundle: TabsPrimitive.Bundle<Value>,
  p: TabsProps<Value, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const orientation = p.orientation ?? "horizontal",
    variant = p.variant ?? "default";
  const orderedTabs =
    p.direction === "rtl" && orientation === "horizontal"
      ? [...p.tabs].reverse()
      : p.tabs;
  return h.submodel({
    slotId: p.model.id,
    model: p.model,
    view: bundle.view,
    viewInputs: {
      tabs: orderedTabs.map((tab) => tab.value),
      selectedValue: p.selectedValue,
      ariaLabel: p.ariaLabel ?? "Tabs",
      orientation: orientation === "horizontal" ? "Horizontal" : "Vertical",
      isTabDisabled: (value) =>
        p.tabs.find((tab) => tab.value === value)?.isDisabled ?? false,
      toView: ({ tablist, tabs, activeIndex }) =>
        h.div(
          [
            h.DataAttribute("slot", "tabs"),
            h.DataAttribute("orientation", orientation),
            ...(p.direction === undefined ? [] : [h.Dir(p.direction)]),
            h.Class(className(styles.tabs, styles[orientation], p.layoutStyle)),
          ],
          [
            h.div(
              [
                ...tablist,
                h.DataAttribute("slot", "tabs-list"),
                h.DataAttribute("variant", variant),
                ...(p.direction === "rtl" && orientation === "horizontal"
                  ? [h.Dir("ltr")]
                  : []),
                h.Class(
                  className(
                    styles.list,
                    orientation === "vertical" && styles.listVertical,
                    variant === "line" && styles.line,
                    p.listLayoutStyle,
                  ),
                ),
              ],
              tabs.flatMap((tab) => {
                const config = p.tabs.find((candidate) => candidate.value === tab.value);
                return config === undefined
                  ? []
                  : [
                      h.button(
                        [
                          ...tab.tab,
                          h.DataAttribute("slot", "tabs-trigger"),
                          ...(p.direction === undefined ? [] : [h.Dir(p.direction)]),
                          h.Class(
                            className(
                              styles.trigger,
                              orientation === "vertical" &&
                                styles.triggerVertical,
                              tab.index === activeIndex && styles.selected,
                              config.isDisabled && styles.disabled,
                              p.triggerLayoutStyle,
                            ),
                          ),
                        ],
                        [config.label],
                      ),
                    ];
              }),
            ),
            ...tabs.flatMap((tab) => {
              const config = p.tabs.find((candidate) => candidate.value === tab.value);
              return config === undefined || tab.index !== activeIndex
                ? []
                : [
                    h.div(
                      [
                        ...tab.panel,
                        h.DataAttribute("slot", "tabs-content"),
                        h.Class(className(styles.content, p.contentLayoutStyle)),
                      ],
                      [config.content],
                    ),
                  ];
            }),
          ],
        ),
    },
    toParentMessage: p.toParentMessage,
  });
};

export type TabsBundle<Value extends string> = Readonly<{
  update: ReturnType<typeof TabsPrimitive.create<Value>>["update"];
  tabs: <Msg>(props: TabsProps<Value, Msg>, h: HtmlBuilder<Msg>) => Html;
}>;

export const create = <Value extends string = string>(): TabsBundle<Value> => {
  const bundle = TabsPrimitive.create<Value>();
  return {
    update: bundle.update,
    tabs: (props, h) => renderTabs(bundle, props, h),
  };
};

const StringTabs = create<string>();
export const update = StringTabs.update;
export const tabs = StringTabs.tabs;
