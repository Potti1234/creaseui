import { Option } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  buttonGroupFixtures,
  type ButtonGroupFixture,
  type BgNode,
} from '@/docs/components/pages/button-group/shared';
import * as Icon from '@/lib/icon';
import * as Button from '@/stylex/button';
import * as ButtonGroup from '@/stylex/button-group';
import * as DropdownMenu from '@/stylex/dropdown-menu';
import * as Input from '@/stylex/input';
import * as InputGroup from '@/stylex/input-group';
import * as Popover from '@/stylex/popover';
import * as Select from '@/stylex/select';
import * as Textarea from '@/stylex/textarea';
import * as Tooltip from '@/stylex/tooltip';
import { className } from '@/stylex/style';
import { tokens } from '../../../../stylex/tokens.stylex';

const styles = stylex.create({
  stack: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  voiceButton: {
    alignItems: 'center',
    borderRadius: '0.5rem',
    color: tokens.mutedForeground,
    display: 'inline-flex',
    height: '1.5rem',
    justifyContent: 'center',
    width: '1.5rem',
  },
  captionIcon: { fontSize: '0.875rem' },
  iconSm: { fontSize: '0.875rem' },
  popoverBody: { display: 'grid', fontSize: '0.875rem', gap: '0.75rem' },
  popoverHead: { display: 'grid', gap: '0.25rem' },
  popoverTitle: { fontSize: '0.875rem', fontWeight: 500 },
  popoverCopy: { color: tokens.mutedForeground, fontSize: '0.875rem' },
  popoverFootnote: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
  },
  menuIcon: { fontSize: '1rem' },
});

type PreviewSnapshot = Readonly<{
  menu: DropdownMenu.Model;
  label: Option.Option<string>;
  query: string;
  amount: string;
  message: string;
  task: string;
  voiceEnabled: boolean;
  select: Select.Model;
  maybeCurrency: Option.Option<string>;
  popover: Popover.Model;
  tooltip: Tooltip.Model;
}>;

const CURRENCIES = [
  { value: '$', label: 'US Dollar' },
  { value: '€', label: 'Euro' },
  { value: '£', label: 'British Pound' },
];

const DEMO_ITEMS = [
  'mark-read',
  'archive',
  'snooze',
  'add-calendar',
  'add-list',
  'label-as',
  'trash',
];
const CONVERSATION_ITEMS = [
  'mute',
  'mark-read',
  'report',
  'block',
  'share',
  'delete',
];
const LABEL_VALUES = ['personal', 'work', 'other'];

const demoLabels = (isRtl: boolean): Record<string, string> =>
  isRtl
    ? {
        'mark-read': 'وضع علامة كمقروء',
        archive: 'أرشفة',
        snooze: 'تأجيل',
        'add-calendar': 'إضافة إلى التقويم',
        'add-list': 'إضافة إلى القائمة',
        'label-as': 'تصنيف كـ...',
        trash: 'سلة المهملات',
        personal: 'شخصي',
        work: 'عمل',
        other: 'آخر',
      }
    : {
        'mark-read': 'Mark as Read',
        archive: 'Archive',
        snooze: 'Snooze',
        'add-calendar': 'Add to Calendar',
        'add-list': 'Add to List',
        'label-as': 'Label As...',
        trash: 'Trash',
        personal: 'Personal',
        work: 'Work',
        other: 'Other',
      };

const DEMO_ICONS: Record<string, string> = {
  'mark-read': 'mail-check',
  archive: 'archive',
  snooze: 'clock',
  'add-calendar': 'calendar-plus',
  'add-list': 'list-filter',
  'label-as': 'tag',
  trash: 'trash-2',
};
const CONVERSATION_ICONS: Record<string, string> = {
  mute: 'volume-off',
  'mark-read': 'check',
  report: 'triangle-alert',
  block: 'user-round-x',
  share: 'share',
  delete: 'trash',
};

const menuItemToConfig = <Msg>(
  model: PreviewSnapshot,
  menu: 'demo' | 'conversation',
  isRtl: boolean,
  h: HtmlBuilder<Msg>,
): ((item: string) => DropdownMenu.DropdownMenuItemConfig<string>) => {
  const labels = demoLabels(isRtl);
  return item => {
    if (menu === 'demo') {
      const icon = DEMO_ICONS[item];
      const base = {
        label: labels[item] ?? item,
        ...(icon === undefined
          ? {}
          : { icon: Icon.icon(icon, { class: className(styles.menuIcon) }, h) }),
        ...(item === 'snooze' || item === 'trash'
          ? { separatorBefore: true }
          : {}),
        ...(item === 'trash' ? { variant: 'destructive' as const } : {}),
      };
      if (item === 'label-as')
        return {
          ...base,
          submenu: {
            items: LABEL_VALUES,
            itemToConfig: sub => ({
              label: labels[sub] ?? sub,
              kind: 'radio' as const,
              isInset: true,
              isChecked: Option.contains(model.label, sub),
            }),
          },
        };
      return base;
    }
    const icon = CONVERSATION_ICONS[item];
    return {
      label:
        (
          {
            mute: 'Mute Conversation',
            'mark-read': 'Mark as Read',
            report: 'Report Conversation',
            block: 'Block User',
            share: 'Share Conversation',
            delete: 'Delete Conversation',
          } as Record<string, string>
        )[item] ?? item,
      ...(icon === undefined
        ? {}
        : { icon: Icon.icon(icon, { class: className(styles.menuIcon) }, h) }),
      ...(item === 'delete'
        ? { variant: 'destructive' as const, separatorBefore: true }
        : {}),
    };
  };
};

const FIELD_TAG: Record<string, string> = {
  query: 'ChangedQuery',
  amount: 'ChangedAmount',
  message: 'ChangedMessage',
  task: 'ChangedTask',
};

const fixtureKey = (fixture: ButtonGroupFixture): string =>
  fixture.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const nodeView = <Msg>(
  model: PreviewSnapshot,
  fixture: ButtonGroupFixture,
  node: BgNode,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const isRtl = fixture.direction === 'rtl';
  switch (node.t) {
    case 'button':
      return Button.button(
        {
          ...(node.variant === undefined ? {} : { variant: node.variant }),
          ...(node.size === undefined ? {} : { size: node.size }),
          ...(node.ariaLabel === undefined
            ? {}
            : { ariaLabel: node.ariaLabel }),
          children: [
            ...(node.icon === undefined
              ? []
              : [
                  Icon.icon(
                    node.icon,
                    node.rtlRotate === true
                      ? { class: className(styles.captionIcon) }
                      : {},
                    h,
                  ),
                ]),
            ...(node.label === undefined ? [] : [node.label]),
          ],
        },
        h,
      );
    case 'separator':
      return ButtonGroup.buttonGroupSeparator({}, h);
    case 'input':
      return Input.input(
        {
          id: `docs-button-group-${fixtureKey(fixture)}-${node.field}`,
          value: model[node.field],
          onInput: value =>
            onMessageJson(
              JSON.stringify({ _tag: FIELD_TAG[node.field], value }),
            ),
          placeholder: node.placeholder,
        },
        h,
      );
    case 'inputGroup':
      return InputGroup.inputGroup(
        {
          children: [
            InputGroup.inputGroupInput(
              {
                id: `docs-button-group-${fixtureKey(fixture)}-message`,
                value: model.message,
                onInput: value =>
                  onMessageJson(
                    JSON.stringify({ _tag: 'ChangedMessage', value }),
                  ),
                placeholder: node.voiceToggle
                  ? model.voiceEnabled
                    ? 'Record and send audio...'
                    : 'Send a message...'
                  : 'Send a message...',
                ...(node.voiceToggle ? { isDisabled: model.voiceEnabled } : {}),
                ariaLabel: 'Message',
              },
              h,
            ),
            node.voiceToggle
              ? InputGroup.inputGroupAddon(
                  {
                    align: 'inline-end',
                    children: [
                      h.button(
                        [
                          h.Type('button'),
                          h.AriaPressed(model.voiceEnabled ? 'true' : 'false'),
                          h.DataAttribute('active', String(model.voiceEnabled)),
                          h.OnClick(onMessageJson(JSON.stringify({ _tag: 'ToggledVoice' }))),
                          h.Class(className(styles.voiceButton)),
                        ],
                        [
                          Icon.icon(
                            'audio-lines',
                            { class: className(styles.iconSm) },
                            h,
                          ),
                        ],
                      ),
                    ],
                  },
                  h,
                )
              : Tooltip.tooltip(
                  {
                    model: model.tooltip,
                    toParentMessage: message =>
                      onMessageJson(
                        JSON.stringify({ _tag: 'GotTooltipMessage', message }),
                      ),
                    trigger: InputGroup.inputGroupAddon(
                      {
                        align: 'inline-end',
                        children: [
                          Icon.icon(
                            'audio-lines',
                            { class: className(styles.iconSm) },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    content: 'Voice Mode',
                    ariaLabel: 'Voice Mode',
                  },
                  h,
                ),
          ],
        },
        h,
      );
    case 'select':
      return Select.select(
        {
          model: model.select,
          maybeSelectedValue: model.maybeCurrency,
          toParentMessage: message =>
            onMessageJson(
              JSON.stringify({ _tag: 'GotSelectMessage', message }),
            ),
          items: CURRENCIES,
          itemToValue: item => item.value,
          itemToLabel: item => `${item.value} ${item.label}`,
          ariaLabel: 'Currency',
        },
        h,
      );
    case 'dropdown':
      return DropdownMenu.dropdownMenu(
        {
          model: model.menu,
          toParentMessage: message =>
            onMessageJson(
              JSON.stringify({ _tag: 'GotMenuMessage', message }),
            ),
          trigger:
            node.menu === 'demo'
              ? Icon.icon(
                  'ellipsis',
                  {
                    ariaLabel: isRtl ? 'مزيد من الخيارات' : 'More Options',
                    class: className(styles.menuIcon),
                  },
                  h,
                )
              : Icon.icon('chevron-down', { ariaLabel: 'Options' }, h),
          triggerButtonVariant: 'outline',
          triggerButtonSize: node.menu === 'demo' ? 'icon' : 'default',
          items: node.menu === 'demo' ? DEMO_ITEMS : CONVERSATION_ITEMS,
          itemToConfig: menuItemToConfig(model, node.menu, isRtl, h),
          align: 'end',
          ...(isRtl ? { direction: 'rtl' as const } : {}),
        },
        h,
      );
    case 'popover':
      return Popover.popover(
        {
          model: model.popover,
          toParentMessage: message =>
            onMessageJson(
              JSON.stringify({ _tag: 'GotPopoverMessage', message }),
            ),
          trigger: Icon.icon(
            'chevron-down',
            { ariaLabel: 'Open Popover' },
            h,
          ),
          align: 'end',
          content: h.div([h.Class(className(styles.popoverBody))], [
            h.div([h.Class(className(styles.popoverHead))], [
              h.p(
                [h.Class(className(styles.popoverTitle))],
                ['Start a new task with Copilot'],
              ),
              h.p(
                [h.Class(className(styles.popoverCopy))],
                ['Describe your task in natural language.'],
              ),
            ]),
            Textarea.textarea(
              {
                id: `docs-button-group-${fixtureKey(fixture)}-task`,
                value: model.task,
                onInput: value =>
                  onMessageJson(
                    JSON.stringify({ _tag: 'ChangedTask', value }),
                  ),
                placeholder: 'I need to...',
                resize: 'none',
              },
              h,
            ),
            h.p(
              [h.Class(className(styles.popoverFootnote))],
              ['Copilot will open a pull request for review.'],
            ),
          ]),
        },
        h,
      );
    case 'group':
      return ButtonGroup.buttonGroup(
        {
          children: node.children.map(child =>
            nodeView(model, fixture, child, onMessageJson, h),
          ),
          
        },
        h,
      );
    case 'column':
      return h.div(
        [h.Class(className(styles.stack))],
        node.children.map(child =>
          nodeView(model, fixture, child, onMessageJson, h),
        ),
      );
  }
};

const fixtureView = <Msg>(
  fixture: ButtonGroupFixture,
  model: PreviewSnapshot,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const ungrouped =
    fixture.nodes.length === 1 && fixture.nodes[0]?.t === 'column';
  const [firstNode] = fixture.nodes;
  const group =
    ungrouped && firstNode !== undefined
      ? nodeView(model, fixture, firstNode, onMessageJson, h)
      : ButtonGroup.buttonGroup(
          {
            ...(fixture.orientation === 'vertical'
              ? { orientation: 'vertical' as const }
              : {}),
            ...(fixture.ariaLabel === undefined
              ? {}
              : { ariaLabel: fixture.ariaLabel }),
            children: fixture.nodes.map(node =>
              nodeView(model, fixture, node, onMessageJson, h),
            ),
          },
          h,
        );
  return fixture.direction === 'rtl'
    ? h.div([h.Dir('rtl')], [group])
    : group;
};

export const buttonGroupStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) =>
  fixtureView(
    buttonGroupFixtures[exampleIndex] ?? buttonGroupFixtures[0]!,
    model as PreviewSnapshot,
    onMessageJson,
    h,
  );
