import * as stylex from "@stylexjs/stylex";
import type { StaticStyles } from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import {
  type ControlFieldProps as SharedControlFieldProps,
  type FieldError,
  fieldErrorMessages,
  renderControlField,
} from "@/lib/field";
import type { ComponentLayoutStyle } from "./contracts";
import {
  fieldDisabledScope,
  fieldGroupScope,
  fieldHorizontalScope,
  fieldLabelScope,
  fieldResponsiveScope,
  fieldVerticalScope,
} from "./field.markers.stylex";
import { foundationTokens } from "./foundations-tokens.stylex";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
export type { ControlFieldParts, FieldError } from "@/lib/field";
export type FieldVariants = Readonly<{
  orientation?: "vertical" | "horizontal" | "responsive" | null;
}>;
type Slot = Readonly<{
  layoutStyle?: ComponentLayoutStyle;
  children: ReadonlyArray<Html | string>;
}>;
const styles = stylex.create({
  set: {
    gap: {
      default: "1.5rem",
      ':has(>[data-slot=checkbox-group])': "0.75rem",
      ':has(>[data-slot=radio-group])': "0.75rem",
    },
    display: "flex",
    flexDirection: "column",
  },
  legend: { fontSize: "1rem", lineHeight: '1.5rem', fontWeight: 500, marginBottom: "0.75rem" },
  legendLabel: { fontSize: "0.875rem", lineHeight: '1.25rem' },
  group: {
    containerName: "field-group",
    containerType: "inline-size",
    gap: {
      default: "1.75rem",
      [stylex.when.ancestor(":is(*)", fieldGroupScope)]: "1rem",
    },
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  field: {
    gap: "0.5rem",
    display: "flex",
    padding: {
      default: null,
      [stylex.when.ancestor(":is(*)", fieldLabelScope)]: "1rem",
    },
    width: "100%",
  },
  vertical: { flexDirection: "column" },
  horizontal: {
    alignItems: {
      default: "center",
      ':has(>[data-slot=field-content])': "flex-start",
    },
    flexDirection: "row",
  },
  responsive: {
    alignItems: {
      "@container field-group (min-width: 28rem)": "center",
    },
    flexDirection: {
      default: "column",
      "@container field-group (min-width: 28rem)": "row",
    },
  },
  invalid: { color: tokens.destructive },
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
    flex: {
      default: null,
      [stylex.when.ancestor(":not(:has(> [data-slot=field-content]))", fieldHorizontalScope)]: "auto",
      [stylex.when.ancestor(":not(:has(> [data-slot=field-content]))", fieldResponsiveScope)]: "auto",
    },
    fontSize: "0.875rem", lineHeight: '1.25rem',
    fontWeight: 500,
  },
  controlLabel: { lineHeight: 1, userSelect: "none" },
  fieldLabel: {
    backgroundColor: {
      default: null,
      ':has([data-checked])':
        "color-mix(in oklab, var(--primary) 5%, transparent)",
    },
    borderColor: {
      default: tokens.border,
      ':has([data-checked])': tokens.primary,
    },
    borderRadius: {
      default: null,
      ':has(>[data-slot=field])': foundationTokens.radiusMd,
    },
    borderStyle: {
      default: null,
      ':has(>[data-slot=field])': "solid",
    },
    borderWidth: {
      default: null,
      ':has(>[data-slot=field])': 1,
    },
    flexDirection: {
      default: null,
      ':has(>[data-slot=field])': "column",
    },
    lineHeight: 1.375,
    userSelect: "none",
    width: {
      default: "fit-content",
      ':has(>[data-slot=field])': "100%",
      [stylex.when.ancestor(":is(*)", fieldVerticalScope)]: "100%",
      [stylex.when.ancestor(":is(*)", fieldResponsiveScope)]: "100%",
    },
  },
  labelDisabled: {
    opacity: {
      default: null,
      [stylex.when.ancestor(":is(*)", fieldDisabledScope)]: 0.5,
    },
  },
  fontNormal: { fontWeight: 400 },
  title: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.375,
    width: {
      default: "fit-content",
      [stylex.when.ancestor(":is(*)", fieldVerticalScope)]: "100%",
      [stylex.when.ancestor(":is(*)", fieldResponsiveScope)]: "100%",
    },
  },
  description: {
    color: tokens.mutedForeground,
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  separator: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    marginBlock: "-0.5rem",
    position: "relative",
    height: "1.25rem",
  },
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
  error: { color: tokens.destructive, fontSize: "0.875rem", lineHeight: '1.25rem', fontWeight: 400 },
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
      h.Class(
        className(
          styles.group,
          // eslint-disable-next-line no-restricted-syntax -- marker scopes are stylex.props-compatible but absent from the narrow StaticStyles surface.
          fieldGroupScope as unknown as StaticStyles,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
const orientationMarker = (
  orientation: NonNullable<FieldVariants["orientation"]>,
): StaticStyles =>
  (orientation === "horizontal"
    ? fieldHorizontalScope
    : orientation === "responsive"
      ? fieldResponsiveScope
      : fieldVerticalScope) as unknown as StaticStyles;
export const fieldVariants = (o: FieldVariants = {}): string =>
  className(
    styles.field,
    styles[o.orientation ?? "vertical"] as StaticStyles,
    orientationMarker(o.orientation ?? "vertical"),
  );
export type ControlFieldProps<Msg> = SharedControlFieldProps<Msg> &
  Readonly<{ layoutStyle?: ComponentLayoutStyle }>;
export const controlField = <Msg>(
  p: ControlFieldProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const orientation = p.orientation ?? "vertical";
  return renderControlField(
    p,
    {
      field: [
        h.Class(
          className(
            styles.field,
            styles[orientation] as StaticStyles,
            (p.isInvalid === true || p.error !== undefined || fieldErrorMessages(p.errors).length > 0) && styles.invalid,
            p.isDisabled && (fieldDisabledScope as unknown as StaticStyles),
            orientationMarker(orientation),
            p.layoutStyle,
          ),
        ),
      ],
      label: [
        h.Class(
          className(styles.label, styles.controlLabel, styles.labelDisabled),
        ),
      ],
      description: [h.Class(className(styles.description))],
      error: [h.Class(className(styles.error))],
      errorList: [h.Class(className(styles.errorList))],
    },
    h,
  );
};
export type FieldProps = Slot &
  Readonly<{
    orientation?: FieldVariants["orientation"];
    isInvalid?: boolean;
    isDisabled?: boolean;
    direction?: 'ltr' | 'rtl';
  }>;
export const field = <Msg>(p: FieldProps, h: HtmlBuilder<Msg>): Html => {
  const orientation = p.orientation ?? "vertical";
  return h.div(
    [
      h.Role("group"),
      h.DataAttribute("slot", "field"),
      h.DataAttribute("orientation", orientation),
      ...(p.direction === undefined ? [] : [h.Dir(p.direction)]),
      ...(p.isInvalid ? [h.DataAttribute("invalid", "true")] : []),
      ...(p.isDisabled ? [h.DataAttribute("disabled", "")] : []),
      h.Class(
        className(
          styles.field,
          styles[orientation] as StaticStyles,
          p.isInvalid && styles.invalid,
          p.isDisabled && (fieldDisabledScope as unknown as StaticStyles),
          orientationMarker(orientation),
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
export type FieldLabelProps = Slot & Readonly<{ for?: string; weight?: 'normal' | 'medium' }>;
export const fieldLabel = <Msg>(
  p: FieldLabelProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.label(
    [
      h.DataAttribute("slot", "field-label"),
      ...(p.for === undefined ? [] : [h.For(p.for)]),
      h.Class(
        className(
          styles.label,
          styles.fieldLabel,
          styles.labelDisabled,
          // eslint-disable-next-line no-restricted-syntax -- marker scopes are stylex.props-compatible but absent from the narrow StaticStyles surface.
          fieldLabelScope as unknown as StaticStyles,
          p.weight === 'normal' && styles.fontNormal,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
export const fieldTitle = <Msg>(p: Slot, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.DataAttribute("slot", "field-label"),
      h.Class(className(styles.title, styles.labelDisabled, p.layoutStyle)),
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
    messages = fieldErrorMessages(p.errors);
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
