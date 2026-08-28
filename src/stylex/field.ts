import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import type { ComponentLayoutStyle } from "./contracts";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
export type FieldVariants = Readonly<{
  orientation?: "vertical" | "horizontal" | "responsive" | null;
}>;
type Slot = Readonly<{
  layoutStyle?: ComponentLayoutStyle;
  children: ReadonlyArray<Html | string>;
}>;
const styles = stylex.create({
  set: { gap: "1.5rem", display: "flex", flexDirection: "column" },
  legend: { fontSize: "1rem", fontWeight: 500, marginBottom: "0.75rem" },
  legendLabel: { fontSize: "0.875rem" },
  group: {
    gap: "1.75rem",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  field: { gap: "0.5rem", display: "flex", width: "100%" },
  vertical: { flexDirection: "column" },
  horizontal: { alignItems: "center", flexDirection: "row" },
  responsive: { flexDirection: "column" },
  invalid: { color: tokens.destructive },
  disabled: { opacity: 0.5 },
  content: {
    flex: "1",
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.375,
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.375,
    userSelect: "none",
    width: "fit-content",
  },
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
  separator: { position: "relative", height: "1.25rem" },
  rule: {
    inset: 0,
    backgroundColor: tokens.border,
    position: "absolute",
    height: "1px",
    top: "50%",
    width: "100%",
  },
  separatorContent: {
    marginInline: "auto",
    paddingInline: "0.5rem",
    backgroundColor: tokens.background,
    color: tokens.mutedForeground,
    display: "block",
    position: "relative",
    width: "fit-content",
  },
  error: { color: tokens.destructive, fontSize: "0.875rem", fontWeight: 400 },
  errorList: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    listStyleType: "disc",
    marginInlineStart: "1rem",
  },
});
export type FieldSetProps = Slot & Readonly<{ isDisabled?: boolean }>;
export const fieldSet = <Msg>(p: FieldSetProps, h: HtmlBuilder<Msg>): Html =>
  h.fieldset(
    [
      h.DataAttribute("slot", "field-set"),
      ...(p.isDisabled === undefined ? [] : [h.Disabled(p.isDisabled)]),
      h.Class(className(styles.set, p.layoutStyle)),
    ],
    [...p.children],
  );
export type FieldLegendProps = Slot &
  Readonly<{ variant?: "legend" | "label" }>;
export const fieldLegend = <Msg>(
  p: FieldLegendProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.legend(
    [
      h.DataAttribute("slot", "field-legend"),
      h.DataAttribute("variant", p.variant ?? "legend"),
      h.Class(
        className(
          styles.legend,
          p.variant === "label" && styles.legendLabel,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
export type FieldGroupProps = Slot &
  Readonly<{ variant?: "default" | "outline" }>;
export const fieldGroup = <Msg>(
  p: FieldGroupProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.DataAttribute("slot", "field-group"),
      ...(p.variant === undefined
        ? []
        : [h.DataAttribute("variant", p.variant)]),
      h.Class(className(styles.group, p.layoutStyle)),
    ],
    [...p.children],
  );
export const fieldVariants = (o: FieldVariants = {}): string =>
  className(styles.field, styles[o.orientation ?? "vertical"]);
export type FieldProps = Slot &
  Readonly<{
    orientation?: FieldVariants["orientation"];
    isInvalid?: boolean;
    isDisabled?: boolean;
  }>;
export const field = <Msg>(p: FieldProps, h: HtmlBuilder<Msg>): Html => {
  const orientation = p.orientation ?? "vertical";
  return h.div(
    [
      h.Role("group"),
      h.DataAttribute("slot", "field"),
      h.DataAttribute("orientation", orientation),
      ...(p.isInvalid ? [h.DataAttribute("invalid", "true")] : []),
      ...(p.isDisabled ? [h.DataAttribute("disabled", "")] : []),
      h.Class(
        className(
          styles.field,
          styles[orientation],
          p.isInvalid && styles.invalid,
          p.isDisabled && styles.disabled,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
};
export const fieldContent = <Msg>(p: Slot, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.DataAttribute("slot", "field-content"),
      h.Class(className(styles.content, p.layoutStyle)),
    ],
    [...p.children],
  );
export type FieldLabelProps = Slot & Readonly<{ for?: string }>;
export const fieldLabel = <Msg>(
  p: FieldLabelProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.label(
    [
      h.DataAttribute("slot", "field-label"),
      ...(p.for === undefined ? [] : [h.For(p.for)]),
      h.Class(className(styles.label, p.layoutStyle)),
    ],
    [...p.children],
  );
export const fieldTitle = <Msg>(p: Slot, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.DataAttribute("slot", "field-label"),
      h.Class(className(styles.title, p.layoutStyle)),
    ],
    [...p.children],
  );
export const fieldDescription = <Msg>(p: Slot, h: HtmlBuilder<Msg>): Html =>
  h.p(
    [
      h.DataAttribute("slot", "field-description"),
      h.Class(className(styles.description, p.layoutStyle)),
    ],
    [...p.children],
  );
export type FieldSeparatorProps = Readonly<{
  layoutStyle?: ComponentLayoutStyle;
  children?: ReadonlyArray<Html | string>;
}>;
export const fieldSeparator = <Msg>(
  p: FieldSeparatorProps = {},
  h: HtmlBuilder<Msg>,
): Html => {
  const has = (p.children?.length ?? 0) > 0;
  return h.div(
    [
      h.DataAttribute("slot", "field-separator"),
      h.DataAttribute("content", String(has)),
      h.Class(className(styles.separator, p.layoutStyle)),
    ],
    [
      h.div(
        [
          h.DataAttribute("slot", "separator"),
          h.DataAttribute("orientation", "horizontal"),
          h.Role("none"),
          h.Class(className(styles.rule)),
        ],
        [],
      ),
      ...(has
        ? [
            h.span(
              [
                h.DataAttribute("slot", "field-separator-content"),
                h.Class(className(styles.separatorContent)),
              ],
              [...(p.children ?? [])],
            ),
          ]
        : []),
    ],
  );
};
export type FieldError = Readonly<{ message?: string }> | undefined;
export type FieldErrorProps = Readonly<{
  layoutStyle?: ComponentLayoutStyle;
  children?: ReadonlyArray<Html | string>;
  errors?: ReadonlyArray<FieldError>;
}>;
export const fieldError = <Msg>(
  p: FieldErrorProps = {},
  h: HtmlBuilder<Msg>,
): Html => {
  const children = p.children ?? [],
    messages = [
      ...new Set(
        (p.errors ?? []).flatMap((error) =>
          error?.message === undefined ? [] : [error.message],
        ),
      ),
    ];
  if (children.length === 0 && messages.length === 0) return h.empty;
  const content =
    children.length > 0
      ? children
      : messages.length === 1
        ? [messages[0] ?? ""]
        : [
            h.ul(
              [h.Class(className(styles.errorList))],
              messages.map((message) => h.li([], [message])),
            ),
          ];
  return h.div(
    [
      h.Role("alert"),
      h.DataAttribute("slot", "field-error"),
      h.Class(className(styles.error, p.layoutStyle)),
    ],
    content,
  );
};

