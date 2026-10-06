import { className } from '@/stylex/style'
import { reset } from '@/stylex/reset'
import { Option } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import * as stylex from '@stylexjs/stylex'

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  dropdownMenuFixtures,
  fixtureItems,
  fixtureLabel,
  resolveItemConfig,
} from '@/docs/components/pages/dropdown-menu/shared'
import * as Avatar from '@/stylex/avatar'
import type { ComponentLayoutStyle } from '@/stylex/contracts'
import * as DropdownMenu from '@/stylex/dropdown-menu'
import * as Icon from '@/lib/icon'

const styles = stylex.create({
  frame: { gap: '0.75rem', display: 'grid', justifyItems: 'center' },
  status: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  trigger: {
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-md)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
  },
  triggerAvatar: { borderRadius: '9999px' },
})

export const dropdownMenuStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = dropdownMenuFixtures[exampleIndex] ?? dropdownMenuFixtures[0]
  const previewModel = model as {
    dropdownMenu: DropdownMenu.Model
    maybeLastAction: Option.Option<string>
    checkedValues: ReadonlyArray<string>
    radioValue: Option.Option<string>
  }
  const state = {
    checkedValues: previewModel.checkedValues,
    radioValue: Option.getOrNull(previewModel.radioValue) ?? undefined,
  }
  const trigger =
    fixture.trigger.kind === 'avatar'
      ? Avatar.avatar(
          {
            children: [
              Avatar.avatarFallback(
                { children: [fixture.trigger.initials] },
                h,
              ),
            ],
          },
          h,
        )
      : fixture.trigger.label
  return h.div(
    [h.Class(stylex.props(styles.frame).className ?? '')],
    [
      DropdownMenu.dropdownMenu(
        {
          model: previewModel.dropdownMenu,
          toParentMessage: message =>
            onMessageJson(
              JSON.stringify({ _tag: 'GotDropdownPreviewMessage', message }),
            ),
          trigger,
          triggerLayoutStyle: (fixture.trigger.kind === 'avatar'
            ? styles.triggerAvatar
            : styles.trigger) as ComponentLayoutStyle,
          ariaLabel: `${fixture.title} menu`,
          items: fixtureItems(fixture),
          itemToConfig: item => {
            const spec = fixture.items.find(
              candidate => candidate.value === item,
            )
            return spec === undefined
              ? { label: item }
              : resolveItemConfig(spec, state, name => Icon.icon(name, {}, h))
          },
          ...(fixture.keepOpenOnCheckableSelect === true
            ? { keepOpenOnCheckableSelect: true }
            : {}),
          ...(fixture.direction === 'rtl' ? { direction: 'rtl' as const } : {}),
        },
        h,
      ),
      h.p(
        [h.Role('status'), h.Class(className(reset.text, styles.status))],
        [
          Option.match(previewModel.maybeLastAction, {
            onNone: () => 'No action selected.',
            onSome: action => `Last action: ${fixtureLabel(fixture, action)}`,
          }),
        ],
      ),
    ],
  )
}
