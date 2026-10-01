/* Ported from Meta Astryx SideNav (packages/core/src/SideNav/) — StyleX
   renderer; visual spec adapted to Crease UI tokens. */

import { Option } from 'effect';
import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineView } from 'foldkit/submodel';

import * as Icon from '@/lib/icon';
import * as NavMenu from '@/lib/nav-menu';
import * as SideNavLib from '@/lib/side-nav';
import type { ComponentLayoutStyle } from './contracts';
import { foundationTokens } from './foundations-tokens.stylex';
import { interactionTokens } from './interaction-tokens.stylex.const';
import { className } from './style';
import { tokens } from './tokens.stylex';

export {
  Message,
  Model,
  OutMessage,
  HEADING_MENU_KEY,
  flyoutKey,
  init,
  isItemCollapsed,
  menuFor,
  update,
  visibleWidth,
} from '@/lib/side-nav';
export type { InitConfig } from '@/lib/side-nav';

export type SideNavItemData = Readonly<{
  id: string;
  label: string;
  icon?: string;
  selectedIcon?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  href?: string;
  onSelect?: boolean;
  endContent?: Html;
  actions?: Html;
  children?: ReadonlyArray<SideNavItemData>;
  defaultCollapsed?: boolean;
  independentToggle?: boolean;
}>;

export type SideNavMenuItemData = Readonly<{
  label: string;
  href?: string;
  onSelect?: boolean;
  icon?: string;
  isDisabled?: boolean;
}>;

export type SideNavHeadingData = Readonly<{
  heading: string;
  icon?: Html;
  headingHref?: string;
  superheading?: string;
  superheadingHref?: string;
  subheading?: string;
  subheadingHref?: string;
  headerEndContent?: Html;
  menu?: ReadonlyArray<SideNavMenuItemData>;
}>;

export type SideNavSectionData = Readonly<{
  title?: string;
  subtitle?: string;
  isHeaderHidden?: boolean;
  endContent?: Html;
  items: ReadonlyArray<SideNavItemData>;
}>;

const styles = stylex.create({
  nav: {
    overflow: 'clip',
    backgroundColor: foundationTokens.mutedSoft,
    boxSizing: 'border-box',
    color: tokens.foreground,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    outlineStyle: 'none',
    position: 'relative',
    transitionDuration: interactionTokens.motionSlow,
    transitionProperty: 'width',
    transitionTimingFunction: interactionTokens.easingStandard,
    height: '100%',
  },
  stickyTop: {
    gap: '0.25rem',
    paddingInline: '0.5rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    paddingBlockEnd: '0.25rem',
    paddingBlockStart: '0.75rem',
  },
  stickyTopCollapsed: {
    paddingInline: 0,
    alignItems: 'center',
  },
  scrollable: {
    flex: '1',
    gap: '0.25rem',
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  scrollableCollapsed: {
    paddingInline: 0,
    alignItems: 'center',
  },
  stickyBottom: {
    borderColor: tokens.border,
    borderStyle: 'solid',
    gap: '0.25rem',
    paddingBlock: '0.5rem',
    paddingInline: '0.5rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 1,
  },
  stickyBottomCollapsed: {
    paddingInline: 0,
    alignItems: 'center',
  },
  footerRow: {
    gap: '0.25rem',
    alignItems: 'center',
    display: 'flex',
  },
  footerRowExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerRowCollapsed: {
    flexDirection: 'column-reverse',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  sectionHeader: {
    gap: '0.5rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBlockEnd: '0.25rem',
    paddingBlockStart: '0.75rem',
    minHeight: '1.5rem',
  },
  sectionHeaderHidden: {
    margin: '-1px',
    padding: 0,
    // VisuallyHidden: keeps the aria-labelledby target without the chrome.
    borderWidth: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
  sectionHeaderColumn: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  sectionTitle: {
    overflow: 'hidden',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: '1rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sectionSubtitle: {
    overflow: 'hidden',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemsStack: {
    gap: '0.125rem',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  itemsStackCollapsed: {
    alignItems: 'center',
  },
  itemColumn: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  itemIndent: { width: '100%' },
  itemRowWrapper: {
    borderRadius: foundationTokens.radiusMd,
    gap: '0.25rem',
    alignItems: 'center',
    display: 'flex',
    width: '100%',
  },
  itemPrimaryCell: {
    flex: '1',
    minWidth: 0,
  },
  item: {
    borderRadius: foundationTokens.radiusMd,
    gap: '0.5rem',
    paddingInline: '0.5rem',
    textDecoration: 'none',
    alignItems: 'center',
    backgroundColor: 'transparent',
    boxShadow: {
      default: 'none',
      ':focus-visible': tokens.focusRingShadow,
    },
    boxSizing: 'border-box',
    color: tokens.foreground,
    cursor: interactionTokens.cursorAction,
    display: 'flex',
    outlineStyle: 'none',
    position: 'relative',
    textAlign: 'start',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: interactionTokens.easingStandard,
    userSelect: 'none',
    width: '100%',
  },
  itemInteractive: {
    backgroundColor: {
      default: 'transparent',
      ':focus-visible': tokens.accent,
      ':hover': tokens.accent,
    },
  },
  itemSelected: {
    backgroundColor: tokens.accent,
    color: tokens.foreground,
    fontWeight: 500,
  },
  itemDisabled: {
    cursor: interactionTokens.cursorDefault,
    pointerEvents: 'none',
  },
  itemSm: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    height: '1.75rem',
  },
  itemMd: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    height: '2rem',
  },
  itemLg: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    height: '2.25rem',
  },
  railItem: {
    gap: 0,
    paddingInline: 0,
    boxSizing: 'border-box',
    flexShrink: 0,
    justifyContent: 'center',
    height: '2rem',
    width: '2rem',
  },
  railItemLg: {
    height: '2.25rem',
    width: '2.25rem',
  },
  itemIcon: {
    color: tokens.mutedForeground,
    flexShrink: 0,
    height: '1rem',
    width: '1rem',
  },
  itemLabel: {
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  chevron: {
    color: tokens.mutedForeground,
    flexShrink: 0,
    transform: {
      default: 'rotate(0deg)',
      ':is([dir="rtl"] *)': 'scaleX(-1) rotate(0deg)',
    },
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'transform',
    transitionTimingFunction: interactionTokens.easingStandard,
    height: '0.875rem',
    width: '0.875rem',
  },
  chevronExpanded: {
    transform: {
      default: 'rotate(180deg)',
      ':is([dir="rtl"] *)': 'scaleX(-1) rotate(180deg)',
    },
  },
  expandToggle: {
    padding: 0,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'none',
    borderWidth: 0,
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    boxShadow: {
      default: 'none',
      ':focus-visible': tokens.focusRingShadow,
    },
    boxSizing: 'border-box',
    color: tokens.mutedForeground,
    cursor: interactionTokens.cursorAction,
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    outlineStyle: 'none',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: interactionTokens.easingStandard,
    height: '1.75rem',
    width: '1.75rem',
  },
  expandToggleHover: {
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.accent,
    },
    color: {
      default: tokens.mutedForeground,
      ':hover': tokens.foreground,
    },
  },
  collapseButton: {
    padding: 0,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'none',
    borderWidth: 0,
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    boxShadow: {
      default: 'none',
      ':focus-visible': tokens.focusRingShadow,
    },
    boxSizing: 'border-box',
    color: tokens.mutedForeground,
    cursor: interactionTokens.cursorAction,
    display: 'inline-flex',
    justifyContent: 'center',
    outlineStyle: 'none',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: interactionTokens.easingStandard,
    height: '1.75rem',
    width: '1.75rem',
  },
  collapseButtonIcon: {
    display: 'flex',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'transform',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  collapseButtonIconCollapsed: {
    transform: 'rotate(180deg)',
  },
  childrenRegion: {
    gap: '0.125rem',
    display: 'flex',
    flexDirection: 'column',
  },
  childrenRegionHidden: {
    display: 'none',
  },
  railColumn: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  flyout: {
    padding: '0.25rem',
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusLg,
    borderStyle: 'solid',
    borderWidth: 1,
    gap: '0.125rem',
    backgroundColor: foundationTokens.popover,
    boxShadow: tokens.shadowCard,
    boxSizing: 'border-box',
    color: foundationTokens.popoverForeground,
    display: 'flex',
    flexDirection: 'column',
    outlineStyle: 'none',
    zIndex: 50,
    maxHeight: 'min(70vh, 480px)',
    maxWidth: '16rem',
    minWidth: '11rem',
  },
  flyoutHeader: {
    paddingInline: '0.5rem',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    fontWeight: 600,
 lineHeight: '1rem',
    paddingBlockEnd: '0.25rem',
    paddingBlockStart: '0.375rem',
  },
  flyoutItem: {
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'none',
    borderWidth: 0,
    gap: '0.5rem',
    paddingBlock: '0.375rem',
    paddingInline: '0.5rem',
    textDecoration: 'none',
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    boxShadow: {
      default: 'none',
      ':focus-visible': tokens.focusRingShadow,
    },
    boxSizing: 'border-box',
    color: 'inherit',
    cursor: interactionTokens.cursorAction,
    display: 'flex',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    textAlign: 'start',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: interactionTokens.easingStandard,
    width: '100%',
  },
  flyoutItemInteractive: {
    backgroundColor: {
      default: 'transparent',
      ':focus-visible': tokens.accent,
      ':hover': tokens.accent,
    },
  },
  flyoutItemDisabled: {
    cursor: interactionTokens.cursorDefault,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  flyoutLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headingWrap: {
    gap: '0.25rem',
    paddingBlock: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
  },
  headingRow: {
    borderRadius: foundationTokens.radiusMd,
    gap: '0.5rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    textAlign: 'start',
    minHeight: '2rem',
    width: '100%',
  },
  headingRowTrigger: {
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.accent,
    },
    boxShadow: {
      default: 'none',
      ':focus-visible': tokens.focusRingShadow,
    },
    cursor: interactionTokens.cursorAction,
    outlineStyle: 'none',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  headingIcon: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: '1.5rem',
    width: '1.5rem',
  },
  headingTextColumn: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  headingTitle: {
    overflow: 'hidden',
    color: tokens.foreground,
    fontSize: '1.0625rem',
    fontWeight: 600,
    lineHeight: '1.5rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headingTitleLink: {
    borderRadius: foundationTokens.radiusSm,
    textDecoration: 'none',
    boxShadow: {
      default: 'none',
      ':focus-visible': tokens.focusRingShadow,
    },
    color: tokens.foreground,
    outlineStyle: 'none',
  },
  headingSuper: {
    overflow: 'hidden',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headingSub: {
    overflow: 'hidden',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headingSubLink: {
    borderRadius: foundationTokens.radiusSm,
    textDecoration: 'none',
    boxShadow: {
      default: 'none',
      ':focus-visible': tokens.focusRingShadow,
    },
    color: {
      default: tokens.mutedForeground,
      ':hover': tokens.foreground,
    },
    outlineStyle: 'none',
  },
  headingRailWrap: {
    paddingBlock: '0.25rem',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '2rem',
  },
  headingRailTrigger: {
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'none',
    borderWidth: 0,
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    boxShadow: {
      default: 'none',
      ':focus-visible': tokens.focusRingShadow,
    },
    color: tokens.foreground,
    cursor: interactionTokens.cursorAction,
    display: 'flex',
    justifyContent: 'center',
    outlineStyle: 'none',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: interactionTokens.easingStandard,
    height: '2rem',
    width: '2rem',
  },
  headingRailTriggerHover: {
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.accent,
    },
  },
  headingFallbackGlyph: {
    fontSize: '1.0625rem',
    fontWeight: 600,
  },
  headingChevronWrap: {
    display: 'flex',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'transform',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  headingChevronOpen: {
    transform: 'rotate(180deg)',
  },
  resizeHandle: {
    backgroundColor: {
      default: 'transparent',
      ':focus-visible': foundationTokens.primarySoft,
      ':hover': foundationTokens.primarySoft,
    },
    boxSizing: 'border-box',
    cursor: interactionTokens.cursorResizeHorizontal,
    outlineStyle: 'none',
    position: 'absolute',
    touchAction: 'none',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: interactionTokens.easingStandard,
    zIndex: 10,
    bottom: 0,
    top: 0,
    width: '0.375rem',
  },
  resizeHandleEnd: {
    right: 0,
  },
  resizeHandleStart: {
    left: 0,
  },
});

const SIZE_STYLES = {
  sm: styles.itemSm,
  md: styles.itemMd,
  lg: styles.itemLg,
} as const;

// ---------------------------------------------------------------------------
// Anchor positioning (same CSS anchor contract as the tailwind renderer)
// ---------------------------------------------------------------------------

type AnchorSide = 'top' | 'bottom' | 'start' | 'end';

const anchorPositionStyle = (
  anchorId: string,
  side: AnchorSide,
  options: Readonly<{ coverTrigger?: boolean; gap?: string }> = {},
): Record<string, string> => {
  const gap = options.gap ?? '0.25rem';
  const cover = options.coverTrigger === true;
  const horizontal = side === 'start' || side === 'end';
  const sideInset =
    side === 'end'
      ? { left: cover ? 'anchor(left)' : `calc(anchor(right) + ${gap})` }
      : side === 'start'
        ? { right: cover ? 'anchor(right)' : `calc(anchor(left) + ${gap})` }
        : side === 'bottom'
          ? { top: cover ? 'anchor(top)' : `calc(anchor(bottom) + ${gap})` }
          : { bottom: cover ? 'anchor(bottom)' : `calc(anchor(top) + ${gap})` };
  const alignInset = horizontal
    ? { top: cover ? 'anchor(top)' : `calc(anchor(top) - ${gap})` }
    : {
        left: cover
          ? 'anchor(left)'
          : `min(anchor(left), calc(anchor(right) - 100%))`,
      };
  return {
    position: 'fixed',
    positionAnchor: anchorId,
    ...sideInset,
    ...alignInset,
    positionTry: horizontal ? 'flip-block' : 'flip-inline',
    maxHeight: 'calc(100vh - 8px)',
    overflowY: 'auto',
    ...(cover ? {} : { width: 'max-content' }),
  };
};

// ---------------------------------------------------------------------------
// View helpers
// ---------------------------------------------------------------------------

const sectionHeadingDomId = (navId: string, index: number): string =>
  `${navId}-section-${index}-heading`;

const itemDomId = (navId: string, itemId: string): string =>
  `${navId}-item-${itemId}`;

const itemChildrenDomId = (navId: string, itemId: string): string =>
  `${navId}-item-${itemId}-children`;

const iconFor = (item: SideNavItemData): string | undefined =>
  item.isSelected === true && item.selectedIcon !== undefined
    ? item.selectedIcon
    : item.icon;

const itemIsActionable = (item: SideNavItemData): boolean =>
  item.href !== undefined || item.onSelect === true;

const itemVisibleInRail = (item: SideNavItemData): boolean =>
  iconFor(item) !== undefined;

const renderMenuItems = <Msg>(
  items: ReadonlyArray<SideNavMenuItemData>,
  emitMenu: (message: NavMenu.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html[] =>
  items.map(item => {
    const disabled = item.isDisabled === true;
    const attrs = [
      h.Class(
        className(
          styles.flyoutItem,
          !disabled && styles.flyoutItemInteractive,
          disabled && styles.flyoutItemDisabled,
        ),
      ),
      ...(disabled ? [h.AriaDisabled(true)] : []),
      ...(item.href === undefined ? [h.Role('menuitem'), h.Tabindex(-1)] : [h.Role('menuitem')]),
      ...(item.onSelect === true && !disabled
        ? [h.OnClick(emitMenu(NavMenu.Message.SelectedNavMenuItem()))]
        : []),
    ];
    const children = [
      ...(item.icon === undefined
        ? []
        : [
            Icon.icon(item.icon, { class: className(styles.itemIcon) }, h),
          ]),
      h.span([h.Class(className(styles.flyoutLabel))], [item.label]),
    ];
    return item.href === undefined
      ? h.button([h.Type('button'), ...attrs], children)
      : disabled
        ? h.button([h.Type('button'), ...attrs], children)
        : h.a([h.Href(item.href), ...attrs], children);
  });

const renderFlyoutItems = <Msg>(
  items: ReadonlyArray<SideNavItemData>,
  emitMenu: (message: NavMenu.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html[] =>
  items.map(item => {
    const disabled = item.isDisabled === true;
    const attrs = [
      h.Class(
        className(
          styles.flyoutItem,
          !disabled && styles.flyoutItemInteractive,
          disabled && styles.flyoutItemDisabled,
        ),
      ),
      ...(disabled ? [h.AriaDisabled(true)] : []),
      ...(item.onSelect === true && !disabled
        ? [h.OnClick(emitMenu(NavMenu.Message.SelectedNavMenuItem()))]
        : []),
    ];
    const children = [
      h.span([h.Class(className(styles.flyoutLabel))], [item.label]),
      ...(item.endContent === undefined ? [] : [item.endContent]),
    ];
    return item.href === undefined
      ? h.button([h.Type('button'), ...attrs], children)
      : h.a([h.Href(item.href), ...attrs], children);
  });

const flyoutPanel = <Msg>(
  model: SideNavLib.Model,
  key: string,
  anchorId: string,
  options: Readonly<{
    side: AnchorSide;
    coverTrigger?: boolean;
    headerLabel?: string;
    items: Html[];
  }>,
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html[] => {
  const menu = SideNavLib.menuFor(model, key);
  if (!NavMenu.isOpen(menu)) {
    return [];
  }
  const emitMenu = (message: NavMenu.Message): Msg =>
    emit(SideNavLib.Message.GotSideNavMenuMessage({ key, message }));
  const panelId = NavMenu.panelDomId(`${model.id}-${key}`);
  return [
    h.div(
      [
        h.Id(panelId),
        h.Class(className(styles.flyout)),
        h.Role('menu'),
        h.Style(anchorPositionStyle(anchorId, options.side, options)),
        h.OnMouseEnter(emitMenu(NavMenu.Message.EnteredNavMenuPanel())),
        h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuPanel())),
        h.OnKeyDownPreventDefault(key =>
          key === 'Escape'
            ? Option.some(emitMenu(NavMenu.Message.PressedEscapeNavMenu()))
            : Option.none(),
        ),
      ],
      [
        ...(options.headerLabel === undefined
          ? []
          : [
              h.div(
                [h.Class(className(styles.flyoutHeader))],
                [options.headerLabel],
              ),
            ]),
        ...options.items,
      ],
    ),
  ];
};

const renderItem = <Msg>(
  model: SideNavLib.Model,
  item: SideNavItemData,
  level: number,
  size: 'sm' | 'md' | 'lg',
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
  direction: 'ltr' | 'rtl',
): Html => {
  const collapsed = model.isCollapsed;
  const hasChildren = item.children !== undefined && item.children.length > 0;
  const isSelected = item.isSelected === true;
  const isDisabled = item.isDisabled === true;
  const icon = iconFor(item);
  const childrenCollapsed = SideNavLib.isItemCollapsed(
    model,
    item.id,
    item.defaultCollapsed ?? false,
  );

  if (collapsed) {
    if (!itemVisibleInRail(item)) {
      return h.div([], []);
    }
    const key = SideNavLib.flyoutKey(item.id);
    const menu = SideNavLib.menuFor(model, key);
    const anchorId = `--${model.id}-${item.id}-anchor`;
    const emitMenu = (message: NavMenu.Message): Msg =>
      emit(SideNavLib.Message.GotSideNavMenuMessage({ key, message }));
    const triggerAttrs = [
      h.Id(NavMenu.triggerDomId(`${model.id}-${key}`)),
      h.Class(
        className(
          styles.item,
          styles.railItem,
          size === 'lg' && styles.railItemLg,
          styles.itemInteractive,
          styles.itemSelected,
          isDisabled && styles.itemDisabled,
        ),
      ),
      h.Style({ anchorName: anchorId }),
      h.AriaLabel(item.label),
      h.DataAttribute('selected', isSelected ? 'true' : 'false'),
      ...(isDisabled
        ? [h.DataAttribute('disabled', 'true'), h.AriaDisabled(true)]
        : []),
      ...(hasChildren
        ? [
            h.AriaHasPopup('menu'),
            h.AriaExpanded(NavMenu.isOpen(menu)),
            h.AriaControls(NavMenu.panelDomId(`${model.id}-${key}`)),
            h.OnMouseEnter(
              emitMenu(NavMenu.Message.EnteredNavMenuTrigger()),
            ),
            h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuTrigger())),
            h.OnPointerDown((_type, button, _sx, _sy, timeStamp) =>
              button === 0 && !isDisabled
                ? Option.some(
                    emitMenu(
                      NavMenu.Message.PressedNavMenuTrigger({
                        atMs: timeStamp,
                      }),
                    ),
                  )
                : Option.none(),
            ),
            h.OnKeyDownPreventDefault(key =>
              (key === 'Enter' || key === ' ') && !isDisabled
                ? Option.some(
                    emitMenu(NavMenu.Message.ActivatedNavMenuTrigger()),
                  )
                : Option.none(),
            ),
          ]
        : item.onSelect === true && item.href === undefined && !isDisabled
          ? [
              h.OnClick(
                emit(
                  SideNavLib.Message.PressedSideNavItemAction({
                    id: item.id,
                  }),
                ),
              ),
            ]
          : []),
    ];
    const iconEl = Icon.icon(icon ?? 'file', { class: className(styles.itemIcon) }, h);
    const trigger =
      !hasChildren && item.href !== undefined && !isDisabled
        ? h.a([h.Href(item.href), ...triggerAttrs], [iconEl])
        : h.button([h.Type('button'), ...triggerAttrs], [iconEl]);
    return h.div(
      [h.Class(className(styles.railColumn))],
      [
        trigger,
        ...(hasChildren
          ? flyoutPanel(
              model,
              key,
              anchorId,
              {
                side: 'end',
                headerLabel: item.label,
                items: renderFlyoutItems(item.children ?? [], emitMenu, h),
              },
              emit,
              h,
            )
          : []),
      ],
    );
  }

  const isActionable = itemIsActionable(item);
  const independentToggle =
    hasChildren && isActionable && (item.independentToggle ?? true);
  const childrenId = itemChildrenDomId(model.id, item.id);

  const onPrimaryPress: Option.Option<Msg> =
    hasChildren && !isActionable
      ? Option.some(
          emit(
            SideNavLib.Message.ToggledSideNavItem({
              id: item.id,
              isCollapsed: !childrenCollapsed,
            }),
          ),
        )
      : hasChildren && !independentToggle
        ? Option.some(
            emit(
              SideNavLib.Message.ToggledSideNavItem({
                id: item.id,
                isCollapsed: !childrenCollapsed,
              }),
            ),
          )
        : item.onSelect === true && item.href === undefined
          ? Option.some(
              emit(
                SideNavLib.Message.PressedSideNavItemAction({ id: item.id }),
              ),
            )
          : Option.none();

  const label = h.span(
    [h.Class(className(styles.itemLabel))],
    [item.label],
  );
  const primaryChildren = [
    ...(icon === undefined
      ? []
      : [Icon.icon(icon, { class: className(styles.itemIcon) }, h)]),
    label,
    ...(item.endContent === undefined ? [] : [item.endContent]),
  ];
  const primaryAttrs = [
    h.Class(
      className(
        styles.item,
        SIZE_STYLES[size],
        styles.itemInteractive,
        styles.itemSelected,
        isDisabled && styles.itemDisabled,
      ),
    ),
    h.DataAttribute('selected', isSelected ? 'true' : 'false'),
    ...(isDisabled
      ? [h.DataAttribute('disabled', 'true'), h.AriaDisabled(true)]
      : []),
    ...(isSelected ? [h.AriaCurrent('page')] : []),
    ...(hasChildren && !independentToggle
      ? [h.AriaExpanded(!childrenCollapsed), h.AriaControls(childrenId)]
      : []),
    ...Option.match(onPrimaryPress, {
      onNone: () => [],
      onSome: msg => [h.OnClick(msg)],
    }),
  ];
  const primary =
    item.href !== undefined && !isDisabled
      ? h.a([h.Href(item.href), ...primaryAttrs], primaryChildren)
      : h.button(
          [
            h.Type('button'),
            ...(isDisabled ? [h.Disabled(true)] : []),
            ...primaryAttrs,
          ],
          primaryChildren,
        );

  const expandToggle =
    independentToggle && !isDisabled
      ? h.button(
          [
            h.Type('button'),
            h.Class(
              className(styles.expandToggle, styles.expandToggleHover),
            ),
            h.AriaLabel(`Toggle ${item.label}`),
            h.AriaExpanded(!childrenCollapsed),
            h.AriaControls(childrenId),
            h.OnClick(
              emit(
                SideNavLib.Message.ToggledSideNavItem({
                  id: item.id,
                  isCollapsed: !childrenCollapsed,
                }),
              ),
            ),
          ],
          [
            Icon.icon(
              'chevron-right',
              {
                class: className(
                  styles.chevron,
                  !childrenCollapsed && styles.chevronExpanded,
                ),
              },
              h,
            ),
          ],
        )
      : undefined;

  const row =
    independentToggle || item.actions !== undefined
      ? h.div(
          [h.Class(className(styles.itemRowWrapper))],
          [
            h.div(
              [h.Class(className(styles.itemPrimaryCell))],
              [primary],
            ),
            ...(expandToggle === undefined ? [] : [expandToggle]),
            ...(item.actions === undefined ? [] : [item.actions]),
          ],
        )
      : primary;

  const indentPx = 8 + level * 24;
  const childrenRegion = hasChildren
    ? h.div(
        [
          h.Id(childrenId),
          h.Class(
            className(
              styles.childrenRegion,
              childrenCollapsed && styles.childrenRegionHidden,
            ),
          ),
          h.Role('group'),
        ],
        childrenCollapsed
          ? []
          : (item.children ?? []).map(child =>
              renderItem(model, child, level + 1, size, emit, h, direction),
            ),
      )
    : undefined;

  return h.div(
    [h.Id(itemDomId(model.id, item.id)), h.Class(className(styles.itemColumn))],
    [
      h.div(
        [
          h.Class(className(styles.itemIndent)),
          h.Style(
            level > 0 ? { paddingInlineStart: `${indentPx}px` } : {},
          ),
        ],
        [row],
      ),
      ...(childrenRegion === undefined ? [] : [childrenRegion]),
    ],
  );
};

const renderHeading = <Msg>(
  model: SideNavLib.Model,
  heading: SideNavHeadingData,
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const collapsed = model.isCollapsed;
  const hasMenu = heading.menu !== undefined && heading.menu.length > 0;
  const key = SideNavLib.HEADING_MENU_KEY;
  const menu = SideNavLib.menuFor(model, key);
  const anchorId = `--${model.id}-heading-anchor`;
  const emitMenu = (message: NavMenu.Message): Msg =>
    emit(SideNavLib.Message.GotSideNavMenuMessage({ key, message }));

  const iconEl =
    heading.icon === undefined
      ? undefined
      : h.span(
          [h.Class(className(styles.headingIcon))],
          [heading.icon],
        );

  const headingText = h.span(
    [h.Class(className(styles.headingTitle))],
    [heading.heading],
  );

  if (collapsed) {
    const triggerChildren = [
      ...(iconEl === undefined
        ? [
            h.span(
              [h.Class(className(styles.headingFallbackGlyph))],
              [heading.heading.slice(0, 1)],
            ),
          ]
        : [iconEl]),
    ];
    const triggerAttrs = [
      h.Id(NavMenu.triggerDomId(`${model.id}-${key}`)),
      h.Class(
        className(styles.headingRailTrigger, styles.headingRailTriggerHover),
      ),
      h.AriaLabel(heading.heading),
      ...(hasMenu
        ? [
            h.Style({ anchorName: anchorId }),
            h.AriaHasPopup('menu'),
            h.AriaExpanded(NavMenu.isOpen(menu)),
            h.OnMouseEnter(
              emitMenu(NavMenu.Message.EnteredNavMenuTrigger()),
            ),
            h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuTrigger())),
            h.OnPointerDown((_t, button, _x, _y, timeStamp) =>
              button === 0
                ? Option.some(
                    emitMenu(
                      NavMenu.Message.PressedNavMenuTrigger({
                        atMs: timeStamp,
                      }),
                    ),
                  )
                : Option.none(),
            ),
            h.OnKeyDownPreventDefault(k =>
              k === 'Enter' || k === ' '
                ? Option.some(
                    emitMenu(NavMenu.Message.ActivatedNavMenuTrigger()),
                  )
                : Option.none(),
            ),
          ]
        : []),
    ];
    const trigger =
      !hasMenu && heading.headingHref !== undefined
        ? h.a([h.Href(heading.headingHref), ...triggerAttrs], triggerChildren)
        : h.button([h.Type('button'), ...triggerAttrs], triggerChildren);
    return h.div(
      [h.Class(className(styles.headingRailWrap))],
      [
        trigger,
        ...(hasMenu
          ? flyoutPanel(
              model,
              key,
              anchorId,
              {
                side: 'end',
                items: renderMenuItems(heading.menu ?? [], emitMenu, h),
              },
              emit,
              h,
            )
          : []),
      ],
    );
  }

  const textColumn = h.div(
    [h.Class(className(styles.headingTextColumn))],
    [
      ...(heading.superheading === undefined
        ? []
        : [
            heading.superheadingHref === undefined
              ? h.span(
                  [h.Class(className(styles.headingSuper))],
                  [heading.superheading],
                )
              : h.a(
                  [
                    h.Href(heading.superheadingHref),
                    h.Class(
                      className(styles.headingSuper, styles.headingSubLink),
                    ),
                  ],
                  [heading.superheading],
                ),
          ]),
      heading.headingHref === undefined
        ? headingText
        : h.a(
            [
              h.Href(heading.headingHref),
              h.Class(
                className(styles.headingTitle, styles.headingTitleLink),
              ),
            ],
            [heading.heading],
          ),
      ...(heading.subheading === undefined
        ? []
        : [
            heading.subheadingHref === undefined
              ? h.span(
                  [h.Class(className(styles.headingSub))],
                  [heading.subheading],
                )
              : h.a(
                  [
                    h.Href(heading.subheadingHref),
                    h.Class(
                      className(styles.headingSub, styles.headingSubLink),
                    ),
                  ],
                  [heading.subheading],
                ),
          ]),
    ],
  );

  const chevronButton =
    hasMenu && heading.headingHref !== undefined
      ? h.button(
          [
            h.Type('button'),
            h.Id(NavMenu.triggerDomId(`${model.id}-${key}`)),
            h.Class(
              className(styles.expandToggle, styles.expandToggleHover),
            ),
            h.AriaLabel('More options'),
            h.AriaHasPopup('menu'),
            h.AriaExpanded(NavMenu.isOpen(menu)),
            h.Style({ anchorName: anchorId }),
            h.OnMouseEnter(
              emitMenu(NavMenu.Message.EnteredNavMenuTrigger()),
            ),
            h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuTrigger())),
            h.OnPointerDown((_t, button, _x, _y, timeStamp) =>
              button === 0
                ? Option.some(
                    emitMenu(
                      NavMenu.Message.PressedNavMenuTrigger({
                        atMs: timeStamp,
                      }),
                    ),
                  )
                : Option.none(),
            ),
            h.OnKeyDownPreventDefault(k =>
              k === 'Enter' || k === ' '
                ? Option.some(
                    emitMenu(NavMenu.Message.ActivatedNavMenuTrigger()),
                  )
                : Option.none(),
            ),
          ],
          [
            h.span(
              [
                h.Class(
                  className(
                    styles.headingChevronWrap,
                    NavMenu.isOpen(menu) && styles.headingChevronOpen,
                  ),
                ),
              ],
              [
                Icon.icon(
                  'chevron-down',
                  { class: 'size-4' },
                  h,
                ),
              ],
            ),
          ],
        )
      : undefined;

  const wholeHeaderTrigger = hasMenu && chevronButton === undefined;

  const headerRow = h.div(
    [
      h.Class(
        className(
          styles.headingRow,
          wholeHeaderTrigger && styles.headingRowTrigger,
        ),
      ),
      ...(wholeHeaderTrigger
        ? [
            h.Id(NavMenu.triggerDomId(`${model.id}-${key}`)),
            h.Role('button'),
            h.Tabindex(0),
            h.AriaHasPopup('menu'),
            h.AriaExpanded(NavMenu.isOpen(menu)),
            h.Style({ anchorName: anchorId }),
            h.OnMouseEnter(
              emitMenu(NavMenu.Message.EnteredNavMenuTrigger()),
            ),
            h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuTrigger())),
            h.OnPointerDown((_t, button, _x, _y, timeStamp) =>
              button === 0
                ? Option.some(
                    emitMenu(
                      NavMenu.Message.PressedNavMenuTrigger({
                        atMs: timeStamp,
                      }),
                    ),
                  )
                : Option.none(),
            ),
            h.OnKeyDownPreventDefault(k =>
              k === 'Enter' || k === ' '
                ? Option.some(
                    emitMenu(NavMenu.Message.ActivatedNavMenuTrigger()),
                  )
                : Option.none(),
            ),
          ]
        : []),
    ],
    [
      ...(iconEl === undefined ? [] : [iconEl]),
      textColumn,
      ...(chevronButton === undefined ? [] : [chevronButton]),
      ...(heading.headerEndContent === undefined
        ? []
        : [heading.headerEndContent]),
    ],
  );

  return h.div(
    [h.Class(className(styles.headingWrap))],
    [
      headerRow,
      ...(hasMenu
        ? flyoutPanel(
            model,
            key,
            anchorId,
            {
              side: 'bottom',
              coverTrigger: true,
              items: renderMenuItems(heading.menu ?? [], emitMenu, h),
            },
            emit,
            h,
          )
        : []),
    ],
  );
};

const renderSection = <Msg>(
  model: SideNavLib.Model,
  section: SideNavSectionData,
  index: number,
  size: 'sm' | 'md' | 'lg',
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
  direction: 'ltr' | 'rtl',
): Html => {
  const collapsed = model.isCollapsed;
  const headingId = sectionHeadingDomId(model.id, index);
  const headerHidden = collapsed || section.isHeaderHidden === true;
  const header =
    section.title === undefined
      ? undefined
      : h.div(
          [
            h.Id(headingId),
            h.Class(
              className(
                headerHidden
                  ? styles.sectionHeaderHidden
                  : styles.sectionHeader,
              ),
            ),
          ],
          [
            h.div(
              [h.Class(className(styles.sectionHeaderColumn))],
              [
                h.span(
                  [h.Class(className(styles.sectionTitle))],
                  [section.title],
                ),
                ...(section.subtitle === undefined
                  ? []
                  : [
                      h.span(
                        [h.Class(className(styles.sectionSubtitle))],
                        [section.subtitle],
                      ),
                    ]),
              ],
            ),
            ...(section.endContent === undefined ? [] : [section.endContent]),
          ],
        );
  return h.div(
    [
      h.Class(className(styles.section)),
      h.Role('group'),
      ...(section.title === undefined ? [] : [h.AriaLabelledBy(headingId)]),
    ],
    [
      ...(header === undefined ? [] : [header]),
      h.div(
        [
          h.Class(
            className(
              styles.itemsStack,
              collapsed && styles.itemsStackCollapsed,
            ),
          ),
        ],
        section.items.map(item =>
          renderItem(model, item, 0, size, emit, h, direction),
        ),
      ),
    ],
  );
};

const collapseButton = <Msg>(
  model: SideNavLib.Model,
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.Class(className(styles.collapseButton)),
      h.AriaLabel(
        model.isCollapsed ? 'Expand navigation' : 'Collapse navigation',
      ),
      h.AriaExpanded(!model.isCollapsed),
      h.OnClick(emit(SideNavLib.Message.ToggledSideNav())),
    ],
    [
      h.span(
        [
          h.Class(
            className(
              styles.collapseButtonIcon,
              model.isCollapsed && styles.collapseButtonIconCollapsed,
            ),
          ),
          h.Dir('ltr'),
        ],
        [Icon.icon('chevron-left', { class: 'size-4' }, h)],
      ),
    ],
  );

export type ViewInputs = Readonly<{
  items?: ReadonlyArray<SideNavItemData>;
  sections?: ReadonlyArray<SideNavSectionData>;
  heading?: SideNavHeadingData;
  topContent?: Html;
  footer?: Html;
  footerIcons?: Html;
  hasCollapseButton?: boolean;
  /** Render the collapse control inside the footer icon row — the astryx
      footerIcons={<SideNavCollapseButton/>} slot. */
  footerCollapseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  direction?: 'ltr' | 'rtl';
  layoutStyle?: ComponentLayoutStyle;
}>;

const render = <Msg>(
  model: SideNavLib.Model,
  viewInputs: ViewInputs,
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const collapsed = model.isCollapsed;
  const direction = viewInputs.direction ?? 'ltr';
  const size = viewInputs.size ?? 'md';
  const hasCollapseButton =
    viewInputs.hasCollapseButton !== false && model.isCollapsible;
  const footerCollapseButton =
    viewInputs.footerCollapseButton === true && model.isCollapsible;
  const hasFooterRow =
    hasCollapseButton ||
    footerCollapseButton ||
    viewInputs.footerIcons !== undefined;

  const stickyTop =
    viewInputs.heading === undefined && viewInputs.topContent === undefined
      ? undefined
      : h.div(
          [
            h.Class(
              className(
                styles.stickyTop,
                collapsed && styles.stickyTopCollapsed,
              ),
            ),
          ],
          [
            ...(viewInputs.heading === undefined
              ? []
              : [renderHeading(model, viewInputs.heading, emit, h)]),
            ...(viewInputs.topContent === undefined
              ? []
              : [viewInputs.topContent]),
          ],
        );

  const scrollable = h.div(
    [
      h.Class(
        className(
          styles.scrollable,
          collapsed && styles.scrollableCollapsed,
        ),
      ),
    ],
    [
      ...(viewInputs.sections ?? []).map((section, index) =>
        renderSection(model, section, index, size, emit, h, direction),
      ),
      ...(viewInputs.items === undefined
        ? []
        : [
            h.div(
              [
                h.Class(
                  className(
                    styles.itemsStack,
                    collapsed && styles.itemsStackCollapsed,
                  ),
                ),
              ],
              viewInputs.items.map(item =>
                renderItem(model, item, 0, size, emit, h, direction),
              ),
            ),
          ]),
    ],
  );

  const stickyBottom =
    viewInputs.footer === undefined && !hasFooterRow
      ? undefined
      : h.div(
          [
            h.Class(
              className(
                styles.stickyBottom,
                collapsed && styles.stickyBottomCollapsed,
              ),
            ),
          ],
          [
            ...(viewInputs.footer === undefined ? [] : [viewInputs.footer]),
            ...(hasFooterRow
              ? [
                  h.div(
                    [
                      h.Class(
                        className(
                          styles.footerRow,
                          collapsed
                            ? styles.footerRowCollapsed
                            : styles.footerRowExpanded,
                        ),
                      ),
                    ],
                    [
                      ...(hasCollapseButton
                        ? [collapseButton(model, emit, h)]
                        : []),
                      ...(viewInputs.footerIcons === undefined
                        ? []
                        : [viewInputs.footerIcons]),
                      ...(footerCollapseButton
                        ? [collapseButton(model, emit, h)]
                        : []),
                    ],
                  ),
                ]
              : []),
          ],
        );

  const resizeHandle = !model.isResizable
    ? undefined
    : h.div(
        [
          h.Class(
            className(
              styles.resizeHandle,
              direction === 'rtl'
                ? styles.resizeHandleStart
                : styles.resizeHandleEnd,
            ),
          ),
          h.Role('separator'),
          h.AriaOrientation('vertical'),
          h.AriaValuenow(SideNavLib.visibleWidth(model)),
          h.AriaValuemin(model.minWidth),
          h.AriaValuemax(model.maxWidth),
          h.OnPointerDown((pointerType, button, _sx, screenX) =>
            button === 0 || pointerType !== 'mouse'
              ? Option.some(
                  emit(
                    SideNavLib.Message.StartedSideNavResize({ x: screenX }),
                  ),
                )
              : Option.none(),
          ),
          h.OnPointerMove(screenX =>
            Option.isSome(model.drag)
              ? Option.some(
                  emit(
                    SideNavLib.Message.DraggedSideNavResize({
                      x: screenX,
                      direction,
                    }),
                  ),
                )
              : Option.none(),
          ),
          h.OnPointerUp(() =>
            Option.some(emit(SideNavLib.Message.EndedSideNavResize())),
          ),
          h.OnKeyDownPreventDefault(key => {
            const step = 16;
            const delta =
              key === 'ArrowRight'
                ? direction === 'rtl'
                  ? -step
                  : step
                : key === 'ArrowLeft'
                  ? direction === 'rtl'
                    ? step
                    : -step
                  : 0;
            return delta === 0
              ? Option.none()
              : Option.some(
                  emit(SideNavLib.Message.NudgedSideNavResize({ delta })),
                );
          }),
        ],
        [],
      );

  return h.nav(
    [
      h.Class(className(styles.nav, viewInputs.layoutStyle)),
      h.AriaLabel(viewInputs.ariaLabel ?? 'Primary'),
      h.Dir(direction),
      h.Style(
        model.isResizable && !collapsed
          ? ({ width: `${model.width}px` } as Record<string, string>)
          : {},
      ),
      h.DataAttribute('collapsed', collapsed ? 'true' : 'false'),
      h.DataAttribute('slot', 'side-nav'),
    ],
    [
      ...(stickyTop === undefined ? [] : [stickyTop]),
      scrollable,
      ...(stickyBottom === undefined ? [] : [stickyBottom]),
      ...(resizeHandle === undefined ? [] : [resizeHandle]),
    ],
  );
};

/** Canonical stateful view. Embed with `h.submodel`. */
export const view = defineView<
  SideNavLib.Model,
  SideNavLib.Message,
  ViewInputs
>((model, viewInputs, h) => render(model, viewInputs, message => message, h));

/** Compatibility helper. New code should use `h.submodel`. */
export type SideNavProps<Msg> = ViewInputs &
  Readonly<{
    model: SideNavLib.Model;
    toParentMessage: (message: SideNavLib.Message) => Msg;
  }>;

export const sideNav = <Msg>(
  props: SideNavProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => render(props.model, props, props.toParentMessage, h);
