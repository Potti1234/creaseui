import { Command, type Update } from 'foldkit'
import { Option, Schema as S } from 'effect'
import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as MessageScrollerBehavior from '@/lib/message-scroller'
import type { ComponentLayoutStyle } from './contracts'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { logStreamTerminalInk } from './log-stream-terminal-ink.stylex'
import { logStreamTerminalTheme } from './log-stream-terminal.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'

/* Ported from Meta Astryx LogStream.tsx (packages/lab) — mirrors
   ui/log-stream.ts; styling surface is stylex with a createTheme override
   for the always-dark terminal palette. */

// =============================================================================
// Model
// =============================================================================

export const LogStreamLevel = S.Literals(['info', 'warn', 'error', 'debug']);
export type LogStreamLevel = typeof LogStreamLevel.Type;

/** One row in the stream; all strings are pre-formatted by the caller. */
export type LogEntry = Readonly<{
  /** Stable unique key, e.g. `"req-1042"`. */
  id: string;
  /** Pre-formatted timestamp, e.g. `"14:02:11.482"`. Deterministic. */
  timestamp: string;
  level: LogStreamLevel;
  message: string;
  /** Emitting service/component, e.g. `"api-gateway"`. */
  source?: string;
  /** When set, the row becomes a disclosure button for this panel. */
  detail?: Html;
}>;

export const Model = S.Struct({
  id: S.String,
  scroller: MessageScrollerBehavior.Model,
  expandedIds: S.Array(S.String),
});
export type Model = typeof Model.Type;

export const init = (config: {
  id: string;
  /** Initially pinned to the tail. @default false (astryx uncontrolled) */
  isFollowing?: boolean;
}): Model => ({
  id: config.id,
  scroller: {
    ...MessageScrollerBehavior.init(`${config.id}-stream`),
    isFollowing: config.isFollowing ?? false,
  },
  expandedIds: [],
});

export const Message = defineMessageUnion({
  GotLogStreamScrollerMessage: { message: MessageScrollerBehavior.Message },
  ToggledLogStreamEntry: { id: S.String },
  ClickedJumpToLatest: {},
});
export type Message = typeof Message.Type;

/** Mirrors astryx's `onFollowChange`. */
export const OutMessage = defineMessageUnion({
  ChangedLogStreamFollowing: { isFollowing: S.Boolean },
});
export type OutMessage = typeof OutMessage.Type;

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const withFollowOutMessage = (
  previous: Model,
  next: Model,
  commands: Update.Commands<Message> = [],
): UpdateReturn => ({
  model: next,
  commands,
  ...(previous.scroller.isFollowing === next.scroller.isFollowing
    ? {}
    : {
        outMessage: OutMessage.ChangedLogStreamFollowing({
          isFollowing: next.scroller.isFollowing,
        }),
      }),
});

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotLogStreamScrollerMessage': {
      const next = MessageScrollerBehavior.update(
        model.scroller,
        message.message,
      );
      return withFollowOutMessage(
        model,
        { ...model, scroller: next.model },
        Command.mapMessages(next.commands ?? [], (inner) =>
          Message.GotLogStreamScrollerMessage({ message: inner })),
      );
    }
    case 'ToggledLogStreamEntry': {
      const expandedIds = model.expandedIds.includes(message.id)
        ? model.expandedIds.filter((id) => id !== message.id)
        : [...model.expandedIds, message.id];
      return { model: { ...model, expandedIds } };
    }
    case 'ClickedJumpToLatest': {
      const next = MessageScrollerBehavior.update(
        model.scroller,
        MessageScrollerBehavior.Message.RequestedScroll({ direction: 'end' }),
      );
      return withFollowOutMessage(
        model,
        { ...model, scroller: next.model },
        Command.mapMessages(next.commands ?? [], (inner) =>
          Message.GotLogStreamScrollerMessage({ message: inner })),
      );
    }
  }
};

// =============================================================================
// View
// =============================================================================

/** User counts as "scrolled away" beyond this distance from the bottom. */
const FOLLOW_THRESHOLD_PX = 24;

const styles = stylex.create({
  root: {
    borderRadius: tokens.cardRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    position: 'relative',
  },
  rootDefault: {
    borderColor: tokens.border,
    backgroundColor: tokens.card,
  },
  rootTerminal: {},
  viewport: {
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    overflowY: 'auto',
  },
  row: {
    paddingBlock: '0.25rem',
    paddingInline: '0.75rem',
    borderBlockEndColor: tokens.border,
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: { default: 1, ':last-child': 0 },
    columnGap: '0.75rem',
    containIntrinsicBlockSize: 'auto 28px',
    contentVisibility: 'auto',
    display: 'grid',
    lineHeight: 1.7,
    /* PORT-NOTE: astryx fades appended rows in with @starting-style opacity;
       the StaticStyles surface cannot express the at-rule so the stylex port
       omits it. */
    textAlign: 'start',
    transitionDuration: interactionTokens.motionFast,
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  colsTimeSource: {
    gridTemplateColumns: '96px 52px 128px minmax(0, 1fr)',
  },
  colsTime: {
    gridTemplateColumns: '96px 52px minmax(0, 1fr)',
  },
  colsSource: {
    gridTemplateColumns: '52px 128px minmax(0, 1fr)',
  },
  colsMessage: {
    gridTemplateColumns: '52px minmax(0, 1fr)',
  },
  rowButton: {
    borderInlineWidth: 0,
    backgroundColor: 'transparent',
    borderBlockStartWidth: 0,
    cursor: {
      default: interactionTokens.cursorAction,
      ':disabled': interactionTokens.cursorDefault,
    },
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    width: '100%',
  },
  timestamp: {
    color: tokens.mutedForeground,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  level: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    lineHeight: '1.25rem',
    textTransform: 'uppercase',
  },
  source: {
    overflow: 'hidden',
    color: tokens.mutedForeground,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  message: {
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    minWidth: 0,
  },
  detail: {
    paddingBlock: '0.75rem',
    paddingInline: '0.75rem',
    backgroundColor: tokens.muted,
    borderBlockEndColor: tokens.border,
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: 1,
  },
  detailTerminal: {
    backgroundColor: logStreamTerminalInk.detailSurface,
  },
  jump: {
    borderColor: tokens.border,
    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    paddingBlock: '0.25rem',
    paddingInline: '0.75rem',
    backgroundColor: tokens.card,
    color: tokens.foreground,
    cursor: interactionTokens.cursorAction,
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: 500,
    position: 'absolute',
    bottom: '0.75rem',
    right: '0.75rem',
  },
  levelInfo: {
    color: tokens.mutedForeground,
  },
  levelDebug: {
    color: tokens.mutedForeground,
  },
  levelWarn: {
    /* PORT-NOTE: astryx's warning yellow has no warning-ink token; destructive
       red is the closest semantic token on the themed surface. */
    color: tokens.destructive,
  },
  levelError: {
    color: tokens.destructive,
  },
  levelTermInfo: {
    color: tokens.cardForeground,
  },
  levelTermDebug: {
    color: tokens.mutedForeground,
  },
  levelTermWarn: {
    color: logStreamTerminalInk.warn,
  },
  levelTermError: {
    color: logStreamTerminalInk.error,
  },
  messageTerm: {
    color: tokens.cardForeground,
  },
  messageTermWarn: {
    color: logStreamTerminalInk.warn,
  },
  messageTermError: {
    color: logStreamTerminalInk.error,
  },
});

const LEVEL: Record<LogStreamLevel, object> = {
  info: styles.levelInfo,
  debug: styles.levelDebug,
  warn: styles.levelWarn,
  error: styles.levelError,
};

const TERM_LEVEL: Record<LogStreamLevel, object> = {
  info: styles.levelTermInfo,
  debug: styles.levelTermDebug,
  warn: styles.levelTermWarn,
  error: styles.levelTermError,
};

export type LogStreamProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  /** Log rows, oldest first (live tails append at the end). */
  entries: ReadonlyArray<LogEntry>;
  /** Visual treatment; 'terminal' is always dark. @default 'default' */
  variant?: 'default' | 'terminal';
  /** Max height of the scroll area before it scrolls (px number or CSS). */
  maxHeight?: number | string;
  /** Show the timestamp column. @default true */
  hasTimestamps?: boolean;
  /** Accessible label for the log region. @default 'Log stream' */
  label?: string;
  /** Escape hatch: fully replace the default row for an entry. */
  renderEntry?: (entry: LogEntry) => Html;
  /** Parent-layout positioning only. */
  layoutStyle?: ComponentLayoutStyle;
}>;

export const logStream = <Msg>(
  props: LogStreamProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const model = props.model;
  const isTerminal = props.variant === 'terminal';
  const hasTimestamps = props.hasTimestamps ?? true;
  const hasSource = props.entries.some((entry) => entry.source !== undefined);

  const scroller = model.scroller;
  const distanceFromBottom =
    scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
  const isAtBottom =
    scroller.scrollHeight === 0 || distanceFromBottom <= FOLLOW_THRESHOLD_PX;

  const colsStyle = hasTimestamps
    ? hasSource
      ? styles.colsTimeSource
      : styles.colsTime
    : hasSource
      ? styles.colsSource
      : styles.colsMessage;

  const renderDefaultRow = (entry: LogEntry): ReadonlyArray<Html> => {
    const isExpandable = entry.detail !== undefined;
    const isExpanded = isExpandable && model.expandedIds.includes(entry.id);
    const cells: ReadonlyArray<Html | string> = [
      ...(hasTimestamps
        ? [
            h.span([h.Class(className(styles.timestamp))], [entry.timestamp]),
          ]
        : []),
      h.span(
        [
          h.Class(
            className(
              styles.level,
              isTerminal ? TERM_LEVEL[entry.level] : LEVEL[entry.level],
            ),
          ),
        ],
        [entry.level],
      ),
      ...(hasSource
        ? [
            h.span(
              [
                h.Class(className(styles.source)),
                ...(entry.source === undefined
                  ? []
                  : [h.Title(entry.source)]),
              ],
              [entry.source ?? ''],
            ),
          ]
        : []),
      h.span(
        [
          h.Class(
            className(
              styles.message,
              isTerminal && styles.messageTerm,
              isTerminal &&
                entry.level === 'warn' &&
                styles.messageTermWarn,
              isTerminal &&
                entry.level === 'error' &&
                styles.messageTermError,
            ),
          ),
        ],
        [entry.message],
      ),
    ];

    if (!isExpandable) {
      return [
        h.div(
          [
            h.DataAttribute('level', entry.level),
            h.Class(className(styles.row, colsStyle)),
          ],
          [...cells],
        ),
      ];
    }
    return [
      h.button(
        [
          h.Type('button'),
          h.DataAttribute('level', entry.level),
          h.AriaExpanded(isExpanded),
          h.OnClick(
            props.toParentMessage(
              Message.ToggledLogStreamEntry({ id: entry.id }),
            ),
          ),
          h.Class(className(styles.row, styles.rowButton, colsStyle)),
        ],
        [...cells],
      ),
      ...(isExpanded
        ? [
            h.div(
              [
                h.Class(
                  className(
                    styles.detail,
                    isTerminal && styles.detailTerminal,
                  ),
                ),
              ],
              [entry.detail ?? h.empty],
            ),
          ]
        : []),
    ];
  };

  return h.div(
    [
      h.DataAttribute('slot', 'log-stream'),
      h.DataAttribute('variant', props.variant ?? 'default'),
      h.Class(
        className(
          styles.root,
          isTerminal ? styles.rootTerminal : styles.rootDefault,
          isTerminal ? (logStreamTerminalTheme as never) : null,
          props.layoutStyle,
        ),
      ),
    ],
    [
      h.div(
        [
          h.Id(`${scroller.id}-viewport`),
          h.Role('log'),
          h.AriaLabel(props.label ?? 'Log stream'),
          /* role="log" is implicitly aria-live="polite" — on a busy stream
             that floods assistive tech. Follow-pinning doubles as the mute
             switch: off while unfollowed, polite while following. */
          h.AriaLive(scroller.isFollowing ? 'polite' : 'off'),
          h.DataAttribute('slot', 'log-stream-viewport'),
          h.DataAttribute('following', String(scroller.isFollowing)),
          h.Class(className(styles.viewport)),
          ...(props.maxHeight === undefined
            ? []
            : [
                h.Style({
                  maxHeight:
                    typeof props.maxHeight === 'number'
                      ? `${String(props.maxHeight)}px`
                      : props.maxHeight,
                }),
              ]),
          h.OnMount(
            MessageScrollerBehavior.viewportMount((message) =>
              props.toParentMessage(
                Message.GotLogStreamScrollerMessage({ message }),
              )),
          ),
        ],
        props.entries.map((entry) =>
          h.div([h.Key(entry.id)], [
            ...(props.renderEntry === undefined
              ? renderDefaultRow(entry)
              : [props.renderEntry(entry)]),
          ]),
        ),
      ),
      ...(!scroller.isFollowing && !isAtBottom && props.entries.length > 0
        ? [
            h.button(
              [
                h.Type('button'),
                h.OnClick(props.toParentMessage(Message.ClickedJumpToLatest())),
                h.Class(className(styles.jump)),
              ],
              ['Jump to latest ↓'],
            ),
          ]
        : []),
    ],
  );
};
