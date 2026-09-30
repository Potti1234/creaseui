import { Command, type Update } from "foldkit";
import { Effect, Option, Queue, Schema as S, Stream } from "effect";
import * as Mount from "foldkit/mount";
import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import { defineMessageUnion } from "foldkit/message";

import * as Icon from "@/lib/icon";
import type { ComponentLayoutStyle } from "./contracts";
import { className } from "./style";
import { interactionTokens } from "./interaction-tokens.stylex.const";
import { tokens } from "./tokens.stylex";

/* Ported from Meta Astryx TransferList.tsx (packages/lab) — dual-panel
   collection input. Behavior logic mirrors ui/transfer-list.ts; only the
   styling surface differs (stylex tokens + container queries). */

// =============================================================================
// Model
// =============================================================================

export type TransferListOption = Readonly<{
  /** Stable value written to the controlled value array. */
  value: string;
  /** Visible option name and the basis of action labels. */
  label: string;
  /** Optional searchable metadata. Not rendered in the default row. */
  description?: string;
  /** Optional group heading on the available side. */
  group?: string;
  /** Prevents moving the option between the selected and available lists. */
  isTransferDisabled?: boolean;
  /** Prevents reordering the selected option and keeps its position fixed. */
  isReorderDisabled?: boolean;
  /** Explains why a transfer or reorder action is unavailable. */
  disabledMessage?: string;
}>;

const ReorderSession = S.Struct({
  value: S.String,
  label: S.String,
  mode: S.Literals(["keyboard", "pointer"]),
  originalValue: S.Array(S.String),
  fromIndex: S.Number,
  toIndex: S.Number,
  pointerId: S.NullOr(S.Number),
  pointerStartY: S.NullOr(S.Number),
  hasPointerMoved: S.Boolean,
});
export type ReorderSession = typeof ReorderSession.Type;

export const Model = S.Struct({
  id: S.String,
  /** Ordered selected values — the single source of truth (astryx `value`). */
  value: S.Array(S.String),
  query: S.String,
  reorder: S.NullOr(ReorderSession),
  /** Latest text for the polite aria-live region (astryx useAnnounce). */
  announcement: S.String,
  /** Swallows the click that follows a pointer drag's pointerup. */
  suppressNextHandleClick: S.Boolean,
});
export type Model = typeof Model.Type;

export const init = (config: {
  id: string;
  value?: ReadonlyArray<string>;
}): Model => ({
  id: config.id,
  value: [...(config.value ?? [])],
  query: "",
  reorder: null,
  announcement: "",
  suppressNextHandleClick: false,
});

export const Message = defineMessageUnion({
  SearchedTransferList: { query: S.String },
  ClickedTransferListAdd: {
    value: S.String,
    label: S.String,
    index: S.Number,
  },
  ClickedTransferListRemove: {
    value: S.String,
    label: S.String,
    index: S.Number,
  },
  ClickedTransferListAddAll: {},
  ClickedTransferListClear: {},
  ClickedReorderHandle: { value: S.String, label: S.String },
  PressedReorderHandle: {
    value: S.String,
    label: S.String,
    pointerId: S.Number,
    clientY: S.Number,
  },
  MovedReorderPointer: {
    value: S.String,
    pointerId: S.Number,
    clientY: S.Number,
  },
  ReleasedReorderPointer: {},
  CancelledReorderPointer: {},
  PressedReorderKey: { value: S.String, key: S.String },
  CompletedMeasurePointerTarget: { clientY: S.Number, targetIndex: S.Number },
  CompletedFocusAfterTransfer: {},
});

/* Window-level pointer tracking for the drag session: foldkit's element
   OnPointerMove reports screen coordinates, but astryx hit-tests rows with
   viewport clientY, so drags are observed here instead (only while a mouse
   button is held). */
const ObserveReorderPointer = Mount.defineStream("ObserveReorderPointer", {
  messages: [Message.MovedReorderPointer, Message.ReleasedReorderPointer],
  execute: () =>
    Stream.callback<
      | typeof Message.MovedReorderPointer.Type
      | typeof Message.ReleasedReorderPointer.Type
    >((queue) =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const onMove = (event: PointerEvent) => {
              if (event.buttons === 0) {
                return;
              }
              Queue.offerUnsafe(
                queue,
                Message.MovedReorderPointer({
                  value: "",
                  pointerId: event.pointerId,
                  clientY: event.clientY,
                }),
              );
            };
            const onUp = () => {
              Queue.offerUnsafe(queue, Message.ReleasedReorderPointer());
            };
            window.addEventListener("pointermove", onMove, { passive: true });
            window.addEventListener("pointerup", onUp);
            window.addEventListener("pointercancel", onUp);
            return { onMove, onUp };
          }),
          (resource) =>
            Effect.sync(() => {
              window.removeEventListener("pointermove", resource.onMove);
              window.removeEventListener("pointerup", resource.onUp);
              window.removeEventListener("pointercancel", resource.onUp);
            }),
        );
        return yield* Effect.never;
      }),
    ),
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  ChangedTransferList: { value: S.Array(S.String) },
});
export type OutMessage = typeof OutMessage.Type;

/** Focuses the next enabled row action after a transfer (astryx rAF focus). */
const FocusAfterTransfer = Command.define("FocusAfterTransfer", {
  args: { rootId: S.String, side: S.String, index: S.Number },
  messages: [Message.CompletedFocusAfterTransfer],
  execute: ({ rootId, side, index }) =>
    Effect.sync(() => {
      const panel = document.getElementById(`${rootId}-panel-${side}`);
      const actions = panel?.querySelectorAll<HTMLButtonElement>(
        `[data-transfer-list-action="${side}"]:not(:disabled):not([aria-disabled="true"])`,
      );
      if (actions !== undefined && actions !== null && actions.length > 0) {
        actions[Math.min(index, actions.length - 1)]?.focus();
      } else {
        document.getElementById(`${rootId}-search`)?.focus();
      }
    }).pipe(Effect.as(Message.CompletedFocusAfterTransfer())),
});

/** Reads each selected row's midpoint and resolves the drop target index
    (astryx reads live getBoundingClientRect on every pointermove; rows are
    static during a session so a per-move read is equivalent). */
const MeasurePointerTarget = Command.define("MeasurePointerTarget", {
  args: {
    rootId: S.String,
    clientY: S.Number,
    candidateValues: S.Array(S.String),
  },
  messages: [Message.CompletedMeasurePointerTarget],
  execute: ({ rootId, clientY, candidateValues }) =>
    Effect.sync(() => {
      let targetIndex = candidateValues.length;
      for (const [position, value] of candidateValues.entries()) {
        const row = document.querySelector<HTMLElement>(
          `#${rootId} [data-transfer-list-row="${CSS.escape(value)}"]`,
        );
        if (row === null) {
          continue;
        }
        const bounds = row.getBoundingClientRect();
        if (clientY < bounds.top + bounds.height / 2) {
          targetIndex = position;
          break;
        }
      }
      return targetIndex;
    }).pipe(
      Effect.map((targetIndex) =>
        Message.CompletedMeasurePointerTarget({ clientY, targetIndex }),
      ),
    ),
});

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const commit = (
  model: Model,
  nextValue: ReadonlyArray<string>,
  announcement: string,
  commands: Update.Commands<Message> = [],
): UpdateReturn => ({
  model: { ...model, value: [...nextValue], announcement },
  commands,
  outMessage: OutMessage.ChangedTransferList({ value: [...nextValue] }),
});

const announceAdded = (label: string, count: number): string =>
  `${label} added. ${String(count)} selected.`;
const announceRemoved = (label: string, count: number): string =>
  `${label} removed. ${String(count)} selected.`;
const announceBulkAdded = (count: number): string =>
  `${String(count)} options added.`;
const announceBulkRemoved = (count: number): string =>
  `${String(count)} options removed.`;
const announceGrabbed = (
  label: string,
  position: number,
  total: number,
): string =>
  `${label} grabbed. Current position ${String(position)} of ${String(total)}. Use arrow keys to move, Enter or Space to drop, Escape to cancel.`;
const announceDropped = (
  label: string,
  position: number,
  total: number,
): string =>
  `${label} dropped. Position ${String(position)} of ${String(total)}.`;
const announceReturned = (label: string, position: number): string =>
  `${label} returned to position ${String(position)}.`;
const announceMoveCancelled = (label: string): string =>
  `${label} move cancelled.`;
const announceMovedToPosition = (
  label: string,
  position: number,
  total: number,
): string =>
  `${label} moved to position ${String(position)} of ${String(total)}.`;
const announceSearchResults = (count: number): string =>
  `${String(count)} results.`;

const movableRange = (
  optionValue: string,
  orderedValue: ReadonlyArray<string>,
  optionByValue: ReadonlyMap<string, TransferListOption>,
): { index: number; start: number; end: number } => {
  const index = orderedValue.indexOf(optionValue);
  let start = 0;
  let end = orderedValue.length - 1;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const option = optionByValue.get(orderedValue[cursor] ?? "");
    if (option === undefined || option.isReorderDisabled === true) {
      start = cursor + 1;
      break;
    }
  }
  for (let cursor = index + 1; cursor < orderedValue.length; cursor += 1) {
    const option = optionByValue.get(orderedValue[cursor] ?? "");
    if (option === undefined || option.isReorderDisabled === true) {
      end = cursor - 1;
      break;
    }
  }
  return { index, start, end };
};

const moveItem = (
  value: ReadonlyArray<string>,
  fromIndex: number,
  toIndex: number,
): ReadonlyArray<string> => {
  const nextValue = [...value];
  const item = nextValue.splice(fromIndex, 1)[0];
  if (item === undefined) {
    return nextValue;
  }
  nextValue.splice(toIndex, 0, item);
  return nextValue;
};

const beginReorder = (
  model: Model,
  option: { value: string; label: string; isReorderDisabled?: boolean },
  mode: "keyboard" | "pointer",
  isReorderable: boolean,
  pointer?: { pointerId: number; clientY: number },
): Model => {
  if (option.isReorderDisabled === true || !isReorderable) {
    return model;
  }
  const index = model.value.indexOf(option.value);
  if (index < 0 || (mode === "pointer" && pointer === undefined)) {
    return model;
  }
  return {
    ...model,
    reorder: {
      value: option.value,
      label: option.label,
      mode,
      originalValue: [...model.value],
      fromIndex: index,
      toIndex: index,
      pointerId: pointer?.pointerId ?? null,
      pointerStartY: pointer?.clientY ?? null,
      hasPointerMoved: false,
    },
    announcement:
      mode === "keyboard"
        ? announceGrabbed(option.label, index + 1, model.value.length)
        : model.announcement,
  };
};

/** update needs the option catalog for movableRange + isReorderable — the
    view supplies both through the messages that can start a gesture. */
export const update = (
  model: Model,
  message: Message,
  options: ReadonlyArray<TransferListOption> = [],
  isReorderable = true,
): UpdateReturn => {
  const optionByValue = new Map(
    options.map((option) => [option.value, option]),
  );
  const finishKeyboard = (cancelled: boolean): UpdateReturn => {
    const session = model.reorder;
    if (session === null) {
      return { model };
    }
    if (cancelled) {
      return {
        model: {
          ...model,
          value: session.originalValue,
          reorder: null,
          announcement: announceMoveCancelled(session.label),
        },
        outMessage: OutMessage.ChangedTransferList({
          value: [...session.originalValue],
        }),
      };
    }
    const index = model.value.indexOf(session.value);
    return {
      model: {
        ...model,
        reorder: null,
        announcement: announceDropped(
          session.label,
          index + 1,
          model.value.length,
        ),
      },
    };
  };
  switch (message._tag) {
    case "SearchedTransferList": {
      const normalized = message.query.trim().toLowerCase();
      return {
        model: {
          ...model,
          query: message.query,
          announcement:
            normalized === ""
              ? ""
              : announceSearchResults(
                  options.filter((option) => matchesQuery(option, normalized))
                    .length,
                ),
        },
      };
    }
    case "ClickedTransferListAdd": {
      const option = optionByValue.get(message.value);
      if (
        option?.isTransferDisabled === true ||
        model.value.includes(message.value)
      ) {
        return { model };
      }
      const nextValue = [...model.value, message.value];
      return commit(
        { ...model, reorder: model.reorder },
        nextValue,
        announceAdded(message.label, nextValue.length),
        [
          FocusAfterTransfer({
            rootId: model.id,
            side: "available",
            index: message.index,
          }),
        ],
      );
    }
    case "ClickedTransferListRemove": {
      const option = optionByValue.get(message.value);
      if (option?.isTransferDisabled === true) {
        return { model };
      }
      const nextValue = model.value.filter((item) => item !== message.value);
      return commit(
        model,
        nextValue,
        announceRemoved(message.label, nextValue.length),
        [
          FocusAfterTransfer({
            rootId: model.id,
            side: "selected",
            index: message.index,
          }),
        ],
      );
    }
    case "ClickedTransferListAddAll": {
      const additions = options
        .filter(
          (option) =>
            option.isTransferDisabled !== true &&
            !model.value.includes(option.value),
        )
        .map((option) => option.value);
      if (additions.length === 0) {
        return { model };
      }
      return commit(
        model,
        [...model.value, ...additions],
        announceBulkAdded(additions.length),
      );
    }
    case "ClickedTransferListClear": {
      const nextValue = model.value.filter((optionValue) => {
        const option = optionByValue.get(optionValue);
        return option === undefined || option.isTransferDisabled === true;
      });
      const removed = model.value.length - nextValue.length;
      if (removed === 0) {
        return { model };
      }
      return commit(model, nextValue, announceBulkRemoved(removed));
    }
    case "ClickedReorderHandle": {
      const session = model.reorder;
      if (model.suppressNextHandleClick) {
        return { model: { ...model, suppressNextHandleClick: false } };
      }
      if (session !== null && session.mode === "pointer") {
        return { model };
      }
      if (session?.value === message.value) {
        return finishKeyboard(false);
      }
      const option = optionByValue.get(message.value);
      return {
        model: beginReorder(
          model,
          {
            value: message.value,
            label: message.label,
            ...(option?.isReorderDisabled === undefined
              ? {}
              : { isReorderDisabled: option.isReorderDisabled }),
          },
          "keyboard",
          isReorderable,
        ),
      };
    }
    case "PressedReorderHandle": {
      const option = optionByValue.get(message.value);
      return {
        model: {
          ...beginReorder(
            model,
            {
              value: message.value,
              label: message.label,
              ...(option?.isReorderDisabled === undefined
                ? {}
                : { isReorderDisabled: option.isReorderDisabled }),
            },
            "pointer",
            isReorderable,
            { pointerId: message.pointerId, clientY: message.clientY },
          ),
          suppressNextHandleClick: true,
        },
      };
    }
    case "MovedReorderPointer": {
      const session = model.reorder;
      if (
        session === null ||
        session.mode !== "pointer" ||
        session.pointerId !== message.pointerId
      ) {
        return { model };
      }
      const startY = session.pointerStartY ?? message.clientY;
      const hasCrossedThreshold =
        session.hasPointerMoved || Math.abs(message.clientY - startY) >= 5;
      if (!hasCrossedThreshold) {
        return { model };
      }
      const { start, end } = movableRange(
        session.value,
        session.originalValue,
        optionByValue,
      );
      const candidateValues = session.originalValue
        .map((optionValue, originalIndex) => ({ optionValue, originalIndex }))
        .filter(
          (candidate) =>
            candidate.optionValue !== session.value &&
            candidate.originalIndex >= start &&
            candidate.originalIndex <= end,
        )
        .map((candidate) => candidate.optionValue);
      return {
        model: {
          ...model,
          reorder: {
            ...session,
            hasPointerMoved: true,
          },
        },
        commands: [
          MeasurePointerTarget({
            rootId: model.id,
            clientY: message.clientY,
            candidateValues,
          }),
        ],
      };
    }
    case "CompletedMeasurePointerTarget": {
      const session = model.reorder;
      if (session === null || session.mode !== "pointer") {
        return { model };
      }
      const { start, end } = movableRange(
        session.value,
        session.originalValue,
        optionByValue,
      );
      /* astryx maps hit rows into remaining-index space then clamps into the
         movable window — same math, same quirk. */
      const targetIndex = Math.max(start, Math.min(end, message.targetIndex));
      return {
        model: {
          ...model,
          reorder: { ...session, toIndex: targetIndex },
          announcement:
            session.toIndex === targetIndex
              ? model.announcement
              : announceMovedToPosition(
                  session.label,
                  targetIndex + 1,
                  session.originalValue.length,
                ),
        },
      };
    }
    case "ReleasedReorderPointer": {
      const session = model.reorder;
      if (session === null || session.mode !== "pointer") {
        return { model };
      }
      if (!session.hasPointerMoved) {
        return {
          model: { ...model, reorder: null, suppressNextHandleClick: true },
        };
      }
      const hasChanged = session.fromIndex !== session.toIndex;
      const nextValue = moveItem(
        session.originalValue,
        session.fromIndex,
        session.toIndex,
      );
      if (!hasChanged) {
        return {
          model: {
            ...model,
            reorder: null,
            suppressNextHandleClick: true,
            announcement: announceReturned(
              session.label,
              session.fromIndex + 1,
            ),
          },
        };
      }
      return {
        model: {
          ...model,
          value: nextValue,
          reorder: null,
          announcement: announceDropped(
            session.label,
            session.toIndex + 1,
            session.originalValue.length,
          ),
        },
        outMessage: OutMessage.ChangedTransferList({ value: nextValue }),
      };
    }
    case "CancelledReorderPointer": {
      const session = model.reorder;
      if (session === null) {
        return { model };
      }
      return {
        model: {
          ...model,
          reorder: null,
          suppressNextHandleClick: true,
          announcement: announceMoveCancelled(session.label),
        },
      };
    }
    case "PressedReorderKey": {
      const session = model.reorder;
      if (
        session === null ||
        session.value !== message.value ||
        session.mode !== "keyboard"
      ) {
        return { model };
      }
      if (message.key === "Escape") {
        return finishKeyboard(true);
      }
      if (message.key === " " || message.key === "Enter") {
        return finishKeyboard(false);
      }
      const { index, start, end } = movableRange(
        message.value,
        model.value,
        optionByValue,
      );
      const targets: Record<string, number> = {
        ArrowUp: index - 1,
        ArrowDown: index + 1,
        Home: start,
        End: end,
      };
      const target = targets[message.key];
      if (target === undefined || index < 0) {
        return { model };
      }
      const clamped = Math.max(start, Math.min(end, target));
      if (clamped === index) {
        return { model };
      }
      const nextValue = moveItem(model.value, index, clamped);
      const nextIndex = nextValue.indexOf(message.value);
      return commit(
        model,
        nextValue,
        announceMovedToPosition(session.label, nextIndex + 1, nextValue.length),
      );
    }
    case "CompletedFocusAfterTransfer":
      return { model };
  }
};

// =============================================================================
// View
// =============================================================================

const matchesQuery = (option: TransferListOption, query: string): boolean => {
  if (query === "") {
    return true;
  }
  return [option.label, option.description ?? "", option.group ?? ""].some(
    (part) => part.toLowerCase().includes(query),
  );
};

const CONTAINER_DOWN = "@container (max-width: 40rem)";
const CONTAINER_UP = "@container (min-width: 40rem)";

const styles = stylex.create({
  root: {
    gap: 0,
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    /* A size container's auto inline size is zero — give the root a definite
       width or it collapses inside shrink-to-fit parents. */
    width: "100%",
  },
  heading: {
    gap: "0.25rem",
    paddingInline: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
  },
  description: {
    color: tokens.mutedForeground,
    display: "block",
    fontSize: "0.75rem",
    lineHeight: "1.25rem",
  },
  controls: {
    padding: "0.75rem",
    gap: "0.5rem",
    alignItems: "flex-end",
    display: "flex",
    minWidth: 0,
  },
  searchWrap: {
    flex: "1",
    position: "relative",
    minWidth: 0,
  },
  searchIcon: {
    color: tokens.mutedForeground,
    pointerEvents: "none",
    position: "absolute",
    transform: "translateY(-50%)",
    left: "0.625rem",
    top: "50%",
  },
  searchInput: {
    borderColor: tokens.input,
    borderRadius: tokens.controlRadius,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "transparent",
    color: tokens.foreground,
    fontSize: "0.875rem",
    outlineStyle: "none",
    height: "2.25rem",
    paddingLeft: "2rem",
    paddingRight: "2rem",
    width: "100%",
  },
  clearSearch: {
    borderRadius: tokens.controlRadius,
    borderStyle: "none",
    alignItems: "center",
    backgroundColor: "transparent",
    color: tokens.mutedForeground,
    cursor: interactionTokens.cursorAction,
    display: "inline-flex",
    justifyContent: "center",
    position: "absolute",
    transform: "translateY(-50%)",
    height: "1.5rem",
    right: "0.375rem",
    top: "50%",
    width: "1.5rem",
  },
  srOnly: {
    margin: "-1px",
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
  panels: {
    gap: 0,
    display: "grid",
    gridTemplateColumns: {
      [CONTAINER_DOWN]: "minmax(0, 1fr)",
      default: "minmax(0, 1fr) minmax(0, 1fr)",
    },
    minWidth: 0,
  },
  panel: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    outlineOffset: { default: "0px", ":focus-visible": "-2px" },
    minWidth: 0,
  },
  panelDivider: {
    borderBlockStartColor: tokens.border,
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: { [CONTAINER_DOWN]: 1, default: 0 },
    borderInlineStartColor: tokens.border,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: { [CONTAINER_DOWN]: 0, default: 1 },
  },
  panelHeader: {
    gap: "0.5rem",
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    backgroundColor: {
      [CONTAINER_DOWN]: tokens.background,
      default: "transparent",
    },
    borderBlockEndColor: tokens.border,
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: 1,
    display: "flex",
    justifyContent: "space-between",
  },
  panelHeading: {
    color: tokens.mutedForeground,
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
  },
  headerAction: {
    borderStyle: "none",
    paddingBlock: 0,
    paddingInline: 0,
    textDecoration: {
      default: "none",
      ":hover": "underline",
    },
    backgroundColor: "transparent",
    color: tokens.primary,
    cursor: {
      default: interactionTokens.cursorAction,
      ":disabled": interactionTokens.cursorDefault,
    },
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: "1.25rem",
    minBlockSize: "1.5rem",
    opacity: { default: 1, ":disabled": 0.5 },
    height: "auto",
  },
  panelBody: {
    scrollbarGutter: { [CONTAINER_DOWN]: "auto", default: "stable" },
    padding: 0,
    overscrollBehavior: { [CONTAINER_DOWN]: "auto", default: "contain" },
    maxBlockSize: { [CONTAINER_DOWN]: "none", default: "20rem" },
    minBlockSize: { [CONTAINER_DOWN]: 0, default: "12rem" },
    overflowY: { [CONTAINER_DOWN]: "visible", default: "auto" },
  },
  list: {
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
  groupHeading: {
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    marginBlockStart: { default: "0.25rem", ":first-child": 0 },
  },
  groupHeadingText: {
    color: tokens.foreground,
    fontSize: "0.875rem",
    fontWeight: 700,
    lineHeight: "1.25rem",
  },
  item: {
    gap: "0.5rem",
    paddingBlock: "0.375rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    position: "relative",
    minWidth: 0,
  },
  itemDragging: {
    backgroundColor: tokens.accent,
  },
  itemPointerSource: {
    opacity: 0.5,
    userSelect: "none",
  },
  itemDropBefore: {
    "::before": {
      borderRadius: "50%",
      insetInline: 0,
      backgroundColor: tokens.primary,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
      zIndex: 2,
      height: "0.125rem",
      top: "-0.125rem",
    },
  },
  itemDropAfter: {
    "::after": {
      borderRadius: "50%",
      insetInline: 0,
      backgroundColor: tokens.primary,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
      zIndex: 2,
      bottom: "-0.125rem",
      height: "0.125rem",
    },
  },
  itemLabel: {
    flex: "1",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  iconButton: {
    borderRadius: tokens.controlRadius,
    borderStyle: "none",
    alignItems: "center",
    backgroundColor: "transparent",
    color: tokens.mutedForeground,
    cursor: {
      default: interactionTokens.cursorAction,
      ":disabled": interactionTokens.cursorDefault,
    },
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    opacity: { default: 1, ":disabled": 0.5 },
    height: "1.5rem",
    width: "1.5rem",
  },
  /* PORT-NOTE: astryx uses grab/grabbing cursors; no interaction token exists
     for them so the stylex port falls back to the action cursor. */
  reorderHandle: {
    marginInlineStart: "-0.375rem",
    touchAction: "none",
  },
  reorderHandleActive: {},
  empty: {
    padding: "1rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minBlockSize: { [CONTAINER_DOWN]: 0, default: "12rem" },
    textAlign: "center",
  },
  emptyText: {
    color: tokens.mutedForeground,
    fontSize: "0.75rem",
    lineHeight: "1.25rem",
  },
});

export type TransferListProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  /** Accessible name for the complete control. */
  label: string;
  /** Visually hides the label while retaining its accessible name. */
  isLabelHidden?: boolean;
  /** Supporting guidance shown below the label. */
  description?: string;
  /** Complete option catalog. Option values must be unique. */
  options: ReadonlyArray<TransferListOption>;
  /** Heading for the selected panel. @default 'Selected' */
  selectedLabel?: string;
  /** Heading for the available panel. @default 'Available' */
  availableLabel?: string;
  /** Shows one search field that filters both panels. @default false */
  hasSearch?: boolean;
  /** Accessible label for search. Defaults to `Search ${label}`. */
  searchLabel?: string;
  /** Search input placeholder. @default 'Search…' */
  searchPlaceholder?: string;
  /** Enables pointer and keyboard ordering on selected options. @default true */
  isReorderable?: boolean;
  /** Shows an Add all action. @default false */
  hasSelectAll?: boolean;
  /** Shows a Clear action. Transfer-disabled selected options are retained. */
  hasClear?: boolean;
  /** Customizes primary row content without changing built-in behavior. */
  renderOption?: (option: TransferListOption) => Html | string;
  /** Empty copy for the selected panel. */
  selectedEmptyText?: string;
  /** Empty copy for the available panel. */
  availableEmptyText?: string;
  /** Empty copy while a search query is active. */
  noResultsText?: string;
  /** Parent-layout positioning only. */
  layoutStyle?: ComponentLayoutStyle;
}>;

export const REORDER_INSTRUCTIONS =
  "To move an item, press Space or Enter to grab it, use the arrow keys to position it, and press Space or Enter to drop. Press Escape to cancel.";

export const transferList = <Msg>(
  props: TransferListProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const model = props.model;
  const isReorderable = props.isReorderable ?? true;
  const optionByValue = new Map(
    props.options.map((option) => [option.value, option]),
  );
  const selectedValues = new Set(model.value);
  const normalizedQuery = model.query.trim().toLowerCase();
  const selectedOptions = model.value
    .map((optionValue) => optionByValue.get(optionValue))
    .filter(
      (option): option is TransferListOption =>
        option !== undefined && matchesQuery(option, normalizedQuery),
    );
  const availableOptions = props.options.filter(
    (option) =>
      !selectedValues.has(option.value) &&
      matchesQuery(option, normalizedQuery),
  );
  const groupedAvailable: ReadonlyArray<
    readonly [string, ReadonlyArray<TransferListOption>]
  > = (() => {
    const groups = new Map<string, Array<TransferListOption>>();
    availableOptions.forEach((option) => {
      const group = option.group ?? "";
      const items = groups.get(group);
      if (items !== undefined) {
        items.push(option);
      } else {
        groups.set(group, [option]);
      }
    });
    return Array.from(groups.entries());
  })();

  const session = model.reorder;
  const pointerPlacement = (() => {
    if (
      session === null ||
      session.mode !== "pointer" ||
      !session.hasPointerMoved ||
      session.toIndex === session.fromIndex
    ) {
      return null;
    }
    const remainingValues = session.originalValue.filter(
      (optionValue) => optionValue !== session.value,
    );
    const beforeValue = remainingValues[session.toIndex];
    if (beforeValue !== undefined) {
      return { value: beforeValue, position: "before" as const };
    }
    const afterValue = remainingValues[remainingValues.length - 1];
    return afterValue === undefined
      ? null
      : { value: afterValue, position: "after" as const };
  })();

  const selectedLabel = props.selectedLabel ?? "Selected";
  const availableLabel = props.availableLabel ?? "Available";
  const selectedEmptyText = props.selectedEmptyText ?? "No items selected.";
  const availableEmptyText =
    props.availableEmptyText ?? "All items are selected.";
  const noResultsText = props.noResultsText ?? "No results found.";
  const labelId = `${model.id}-label`;
  const descriptionId = `${model.id}-description`;
  const selectedHeadingId = `${model.id}-selected-heading`;
  const availableHeadingId = `${model.id}-available-heading`;
  const reorderInstructionsId = `${model.id}-reorder-instructions`;

  const iconButton = (config: {
    ariaLabel: string;
    isDisabled: boolean;
    title?: string;
    onClick: Msg;
    icon: Html;
    dataAction?: string;
  }): Html =>
    h.button(
      [
        h.Type("button"),
        h.AriaLabel(config.ariaLabel),
        h.Disabled(config.isDisabled),
        ...(config.title === undefined ? [] : [h.Title(config.title)]),
        h.OnClick(config.onClick),
        ...(config.dataAction === undefined
          ? []
          : [h.DataAttribute("transfer-list-action", config.dataAction)]),
        h.Class(className(styles.iconButton)),
      ],
      [config.icon],
    );

  const reorderHandle = (option: TransferListOption): Html | null => {
    if (!isReorderable) {
      return null;
    }
    const active = session?.value === option.value;
    const isReorderDisabled = option.isReorderDisabled === true;
    const disabledReason =
      option.disabledMessage ?? `${option.label} cannot be reordered.`;
    return h.button(
      [
        h.Type("button"),
        h.AriaLabel(`Reorder ${option.label}`),
        h.AriaDescribedBy(reorderInstructionsId),
        h.AriaPressed(active ? "true" : "false"),
        h.Disabled(isReorderDisabled),
        ...(isReorderDisabled ? [h.Title(disabledReason)] : []),
        h.OnClick(
          props.toParentMessage(
            Message.ClickedReorderHandle({
              value: option.value,
              label: option.label,
            }),
          ),
        ),
        h.OnKeyDownPreventDefault((key) => {
          if (
            session === null ||
            session.value !== option.value ||
            session.mode !== "keyboard"
          ) {
            return Option.none();
          }
          if (
            key === "Escape" ||
            key === " " ||
            key === "Enter" ||
            key === "ArrowUp" ||
            key === "ArrowDown" ||
            key === "Home" ||
            key === "End"
          ) {
            return Option.some(
              props.toParentMessage(
                Message.PressedReorderKey({ value: option.value, key }),
              ),
            );
          }
          return Option.none();
        }),
        h.OnPointerDown(
          (
            _pointerType,
            button,
            _screenX,
            _screenY,
            _timeStamp,
            _clientX,
            clientY,
            pointerId,
          ) =>
            button === 0
              ? Option.some(
                  props.toParentMessage(
                    Message.PressedReorderHandle({
                      value: option.value,
                      label: option.label,
                      pointerId,
                      clientY,
                    }),
                  ),
                )
              : Option.none(),
        ),
        h.Class(
          className(
            styles.iconButton,
            styles.reorderHandle,
            active && styles.reorderHandleActive,
          ),
        ),
      ],
      [Icon.gripVertical<Msg>({ class: "size-4" }, h)],
    );
  };

  const optionAction = (
    option: TransferListOption,
    side: "selected" | "available",
    index: number,
  ): Html => {
    const isTransferDisabled = option.isTransferDisabled === true;
    const disabledReason =
      option.disabledMessage ?? `${option.label} cannot be moved.`;
    if (side === "available") {
      return iconButton({
        ariaLabel: `Add ${option.label}`,
        isDisabled: isTransferDisabled,
        ...(isTransferDisabled ? { title: disabledReason } : {}),
        dataAction: "available",
        onClick: props.toParentMessage(
          Message.ClickedTransferListAdd({
            value: option.value,
            label: option.label,
            index,
          }),
        ),
        icon: Icon.icon("plus", { class: "size-4" }, h),
      });
    }
    return iconButton({
      ariaLabel: `Remove ${option.label}`,
      isDisabled: isTransferDisabled,
      ...(isTransferDisabled ? { title: disabledReason } : {}),
      dataAction: "selected",
      onClick: props.toParentMessage(
        Message.ClickedTransferListRemove({
          value: option.value,
          label: option.label,
          index,
        }),
      ),
      icon: Icon.icon("x", { class: "size-4" }, h),
    });
  };

  const transferItem = (
    option: TransferListOption,
    side: "selected" | "available",
    index: number,
  ): Html => {
    const active = session?.value === option.value;
    const isPointerSource = active && session?.mode === "pointer";
    const dropPosition =
      pointerPlacement?.value === option.value
        ? pointerPlacement.position
        : null;
    const orderedIndex = model.value.indexOf(option.value);
    const state =
      option.isTransferDisabled === true || option.isReorderDisabled === true
        ? "disabled"
        : active
          ? "reordering"
          : "enabled";
    return h.li(
      [
        h.Role("listitem"),
        h.Key(option.value),
        h.DataAttribute("slot", "transfer-list-item"),
        h.DataAttribute("side", side),
        h.DataAttribute("state", state),
        ...(side === "selected"
          ? [
              h.DataAttribute("transfer-list-row", option.value),
              h.DataAttribute("transfer-list-index", String(orderedIndex)),
            ]
          : []),
        ...(isPointerSource
          ? [h.DataAttribute("transfer-list-reorder-source", "true")]
          : []),
        ...(dropPosition === null
          ? []
          : [h.DataAttribute("transfer-list-drop-target", dropPosition)]),
        h.Class(
          className(
            styles.item,
            active && session?.mode === "keyboard" && styles.itemDragging,
            isPointerSource && styles.itemPointerSource,
            dropPosition === "before" && styles.itemDropBefore,
            dropPosition === "after" && styles.itemDropAfter,
          ),
        ),
      ],
      [
        ...(side === "selected"
          ? (() => {
              const handle = reorderHandle(option);
              return handle === null ? [] : [handle];
            })()
          : []),
        h.span(
          [h.Class(className(styles.itemLabel))],
          [
            props.renderOption === undefined
              ? option.label
              : props.renderOption(option),
          ],
        ),
        optionAction(option, side, index),
      ],
    );
  };

  const panelBody = (
    side: "selected" | "available",
    content: ReadonlyArray<Html>,
    emptyText: string,
  ): Html =>
    h.div(
      [
        h.Id(`${model.id}-panel-body-${side}`),
        h.DataAttribute("transfer-list-panel-body", side),
        h.Class(className(styles.panelBody)),
      ],
      [
        content.length > 0
          ? h.ul(
              [h.Role("list"), h.Class(className(styles.list))],
              [...content],
            )
          : h.div(
              [
                h.DataAttribute("transfer-list-empty", side),
                h.Class(className(styles.empty)),
              ],
              [
                h.span(
                  [h.Class(className(styles.emptyText))],
                  [normalizedQuery === "" ? emptyText : noResultsText],
                ),
              ],
            ),
      ],
    );

  const selectedPanelContent = selectedOptions.map((option, index) =>
    transferItem(option, "selected", index),
  );
  const availablePanelContent = groupedAvailable.flatMap(
    ([group, groupOptions]) => [
      ...(group !== "" || groupedAvailable.length > 1
        ? [
            h.li(
              [
                h.Role("presentation"),
                h.Key(`group-${group === "" ? "ungrouped" : group}`),
                h.Class(className(styles.groupHeading)),
              ],
              [
                h.span(
                  [h.Class(className(styles.groupHeadingText))],
                  [group === "" ? "Other" : group],
                ),
              ],
            ),
          ]
        : []),
      ...groupOptions.map((option) =>
        transferItem(option, "available", availableOptions.indexOf(option)),
      ),
    ],
  );

  const headerAction = (
    text: string,
    isDisabled: boolean,
    message: Msg,
  ): Html =>
    h.button(
      [
        h.Type("button"),
        h.Disabled(isDisabled),
        h.OnClick(message),
        h.DataAttribute("transfer-list-header-action", "true"),
        h.Class(className(styles.headerAction)),
      ],
      [text],
    );

  return h.div(
    [
      h.DataAttribute("slot", "transfer-list"),
      h.Role("group"),
      h.AriaLabelledBy(labelId),
      ...(props.description === undefined
        ? []
        : [h.AriaDescribedBy(descriptionId)]),
      h.Class(className(styles.root, props.layoutStyle)),
      h.OnMount(
        Mount.mapMessage(ObserveReorderPointer(), props.toParentMessage),
      ),
    ],
    [
      h.div(
        [h.Class(className(styles.heading))],
        [
          props.isLabelHidden === true
            ? h.span(
                [h.Id(labelId), h.Class(className(styles.srOnly))],
                [props.label],
              )
            : h.span(
                [h.Id(labelId), h.Class(className(styles.label))],
                [props.label],
              ),
          ...(props.description === undefined
            ? []
            : [
                h.span(
                  [h.Id(descriptionId), h.Class(className(styles.description))],
                  [props.description],
                ),
              ]),
        ],
      ),
      ...(props.hasSearch === true
        ? [
            h.div(
              [h.Class(className(styles.controls))],
              [
                h.div(
                  [h.Class(className(styles.searchWrap))],
                  [
                    h.span(
                      [h.Class(className(styles.searchIcon))],
                      [Icon.icon("search", { class: "size-4" }, h)],
                    ),
                    h.input([
                      h.Id(`${model.id}-search`),
                      h.Type("text"),
                      h.Role("searchbox"),
                      h.AriaLabel(props.searchLabel ?? `Search ${props.label}`),
                      h.Placeholder(props.searchPlaceholder ?? "Search…"),
                      h.Value(model.query),
                      h.OnInput((value) =>
                        props.toParentMessage(
                          Message.SearchedTransferList({ query: value }),
                        ),
                      ),
                      h.Class(className(styles.searchInput)),
                    ]),
                    ...(model.query === ""
                      ? []
                      : [
                          h.button(
                            [
                              h.Type("button"),
                              h.AriaLabel("Clear search"),
                              h.Class(className(styles.clearSearch)),
                              h.OnClick(
                                props.toParentMessage(
                                  Message.SearchedTransferList({ query: "" }),
                                ),
                              ),
                            ],
                            [Icon.icon("x", { class: "size-3.5" }, h)],
                          ),
                        ]),
                  ],
                ),
              ],
            ),
          ]
        : []),
      h.span(
        [h.Id(reorderInstructionsId), h.Class(className(styles.srOnly))],
        [REORDER_INSTRUCTIONS],
      ),
      h.div(
        [
          h.DataAttribute("slot", "transfer-list-collection"),
          h.Class(className(styles.panels)),
        ],
        [
          h.div(
            [
              h.Id(`${model.id}-panel-selected`),
              h.Role("group"),
              h.AriaLabelledBy(selectedHeadingId),
              h.Tabindex(-1),
              h.Class(className(styles.panel)),
            ],
            [
              h.div(
                [h.Class(className(styles.panelHeader))],
                [
                  h.span(
                    [
                      h.Id(selectedHeadingId),
                      h.Class(className(styles.panelHeading)),
                    ],
                    [selectedLabel],
                  ),
                  ...(props.hasClear === true
                    ? [
                        headerAction(
                          "Clear",
                          !model.value.some(
                            (optionValue) =>
                              optionByValue.get(optionValue)
                                ?.isTransferDisabled !== true,
                          ),
                          props.toParentMessage(
                            Message.ClickedTransferListClear(),
                          ),
                        ),
                      ]
                    : []),
                ],
              ),
              panelBody("selected", selectedPanelContent, selectedEmptyText),
            ],
          ),
          h.div(
            [
              h.Id(`${model.id}-panel-available`),
              h.Role("group"),
              h.AriaLabelledBy(availableHeadingId),
              h.Tabindex(-1),
              h.Class(className(styles.panel, styles.panelDivider)),
            ],
            [
              h.div(
                [h.Class(className(styles.panelHeader))],
                [
                  h.span(
                    [
                      h.Id(availableHeadingId),
                      h.Class(className(styles.panelHeading)),
                    ],
                    [availableLabel],
                  ),
                  ...(props.hasSelectAll === true
                    ? [
                        headerAction(
                          "Add all",
                          !props.options.some(
                            (option) =>
                              option.isTransferDisabled !== true &&
                              !model.value.includes(option.value),
                          ),
                          props.toParentMessage(
                            Message.ClickedTransferListAddAll(),
                          ),
                        ),
                      ]
                    : []),
                ],
              ),
              panelBody("available", availablePanelContent, availableEmptyText),
            ],
          ),
        ],
      ),
      h.div(
        [
          h.AriaLive("polite"),
          h.Class(className(styles.srOnly)),
          h.DataAttribute("slot", "transfer-list-announcer"),
        ],
        [model.announcement],
      ),
    ],
  );
};
