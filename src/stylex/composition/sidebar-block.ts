import { Stream } from "effect";
import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import { className } from "../style";
import { foundationTokens } from "../foundations-tokens.stylex";
import { tokens } from "../tokens.stylex";

const styles = stylex.create({
  header: {
    gap: "1rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    borderBottomColor: tokens.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    height: "4rem",
  },
  sticky: {
    backgroundColor: tokens.background,
    position: "sticky",
    zIndex: 20,
    top: 0,
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  body: {
    padding: "1rem",
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    minWidth: 0,
  },
  cards: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (min-width: 768px)": "repeat(3, minmax(0, 1fr))",
    },
  },
  calendar: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  },
  skeleton: {
    borderRadius: tokens.radius,
    backgroundColor: foundationTokens.muted,
    opacity: 0.5,
  },
  tile: { aspectRatio: "16 / 9" },
  fill: { flexGrow: 1, minHeight: "24rem" },
  row: { flexShrink: 0, height: "3rem" },
  page: { display: "flex", flexDirection: "column", minHeight: "100svh" },
  mail: {
    display: { default: "none", "@media (min-width: 768px)": "flex" },
    flexDirection: "column",
    flexShrink: 0,
    borderRightColor: tokens.border,
    borderRightStyle: "solid",
    borderRightWidth: 1,
    height: "100svh",
    overflowY: "auto",
    width: "19rem",
  },
  mailItem: {
    padding: "1rem",
    gap: "0.5rem",
    backgroundColor: {
      default: tokens.background,
      ":hover": foundationTokens.muted,
    },
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    borderBottomColor: tokens.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    width: "100%",
  },
  preview: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minHeight: "100svh",
  },
  settings: {
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (min-width: 768px)": "15rem minmax(0, 1fr)",
    },
    height: "26rem",
    minWidth: 0,
  },
  settingsNavigation: {
    display: { default: "none", "@media (min-width: 768px)": "block" },
    overflowY: "auto",
  },
  settingsMain: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflowY: "auto",
  },
});

export const blockHeader = <M>(
  children: ReadonlyArray<Html | string>,
  sticky: boolean,
  h: HtmlBuilder<M>,
): Html =>
  h.header(
    [h.Class(className(styles.header, sticky && styles.sticky))],
    children,
  );
export const blockLabel = <M>(label: string, h: HtmlBuilder<M>): Html =>
  h.span([h.Class(className(styles.label))], [label]);
export const blockPage = <M>(
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<M>,
): Html => h.div([h.Class(className(styles.page))], children);
export const blockCenter = <M>(
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<M>,
  onMount: M,
): Html =>
  h.div(
    [
      h.Class(className(styles.preview)),
      h.OnMount({
        name: "open-settings-preview",
        f: () => Stream.succeed(onMount),
      }),
    ],
    children,
  );
export const settingsLayout = <M>(
  navigation: Html,
  content: ReadonlyArray<Html>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(className(styles.settings))],
    [
      h.nav(
        [
          h.AriaLabel("Settings navigation"),
          h.Class(className(styles.settingsNavigation)),
        ],
        [navigation],
      ),
      h.main([h.Class(className(styles.settingsMain))], content),
    ],
  );
export const mailPanel = <M>(
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<M>,
): Html =>
  h.aside([h.AriaLabel("Messages"), h.Class(className(styles.mail))], children);
export const mailItem = <M>(
  children: ReadonlyArray<Html>,
  onClick: M,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [h.Type("button"), h.OnClick(onClick), h.Class(className(styles.mailItem))],
    children,
  );
export const blockSkeleton = <M>(
  variant: "cards" | "rows" | "calendar" | "document",
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.AriaHidden(true), h.Class(className(styles.body))],
    variant === "cards"
      ? [
          h.div(
            [h.Class(className(styles.cards))],
            Array.from({ length: 3 }, () =>
              h.div([h.Class(className(styles.skeleton, styles.tile))], []),
            ),
          ),
          h.div([h.Class(className(styles.skeleton, styles.fill))], []),
        ]
      : variant === "calendar"
        ? [
            h.div(
              [h.Class(className(styles.calendar))],
              Array.from({ length: 20 }, () =>
                h.div([h.Class(className(styles.skeleton, styles.tile))], []),
              ),
            ),
          ]
        : variant === "document"
          ? [
              h.div([h.Class(className(styles.skeleton, styles.row))], []),
              h.div([h.Class(className(styles.skeleton, styles.fill))], []),
            ]
          : Array.from({ length: 14 }, () =>
              h.div([h.Class(className(styles.skeleton, styles.row))], []),
            ),
  );
