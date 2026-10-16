import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Menu from '@/ui/dropdown-menu'
import {
  statusNames,
  priorityNames,
  people,
  statuses,
  priorities,
  assignees,
  type Status,
  type Priority,
  type Assignee,
} from '@/data'
import { glyph, person, priorityIcon, statusIcon } from './primitives'

type PickerProps<Value extends string, M> = Readonly<{
  model: Menu.Model
  value: Value
  toMessage: (message: Menu.Message) => M
  context: string
  presentation?: 'row' | 'composer'
}>

export const statusPicker = <M>(
  props: PickerProps<Status, M>,
  h: HtmlBuilder<M>,
): Html =>
  Menu.dropdownMenu(
    {
      model: props.model,
      toParentMessage: props.toMessage,
      trigger: h.span(
        [h.Class('picker-label')],
        [
          statusIcon(props.value, h),
          ...(props.presentation === 'composer'
            ? [statusNames[props.value]]
            : []),
        ],
      ),
      appearance:
        props.presentation === 'composer'
          ? 'composerProperty'
          : 'issueProperty',
      triggerAriaLabel:
        'Status for ' + props.context + ': ' + statusNames[props.value],
      ariaLabel: 'Change status',
      side: 'bottom',
      items: statuses,
      itemToConfig: value => ({
        label: statusNames[value],
        icon: statusIcon(value, h),
        kind: 'radio',
        isChecked: value === props.value,
        group: 'Status',
      }),
    },
    h,
  )

export const priorityPicker = <M>(
  props: PickerProps<Priority, M>,
  h: HtmlBuilder<M>,
): Html =>
  Menu.dropdownMenu(
    {
      model: props.model,
      toParentMessage: props.toMessage,
      trigger: h.span(
        [h.Class('picker-label')],
        [
          priorityIcon(props.value, h),
          ...(props.presentation === 'composer'
            ? [priorityNames[props.value]]
            : []),
        ],
      ),
      appearance:
        props.presentation === 'composer'
          ? 'composerProperty'
          : 'issueProperty',
      triggerAriaLabel:
        'Priority for ' + props.context + ': ' + priorityNames[props.value],
      ariaLabel: 'Change priority',
      align: 'end',
      items: priorities,
      itemToConfig: value => ({
        label: priorityNames[value],
        icon: priorityIcon(value, h),
        kind: 'radio',
        isChecked: value === props.value,
        group: 'Priority',
      }),
    },
    h,
  )

export const assigneePicker = <M>(
  props: PickerProps<Assignee, M>,
  h: HtmlBuilder<M>,
): Html =>
  Menu.dropdownMenu(
    {
      model: props.model,
      toParentMessage: props.toMessage,
      trigger: h.span(
        [h.Class('picker-label')],
        [
          person(props.value, h),
          ...(props.presentation === 'composer'
            ? [people[props.value].name]
            : []),
        ],
      ),
      appearance:
        props.presentation === 'composer'
          ? 'composerProperty'
          : 'issueProperty',
      triggerAriaLabel:
        'Assignee for ' + props.context + ': ' + people[props.value].name,
      ariaLabel: 'Change assignee',
      align: 'end',
      items: assignees,
      itemToConfig: value => ({
        label: people[value].name,
        icon: person(value, h),
        kind: 'radio',
        isChecked: value === props.value,
        group: 'Assign to',
      }),
    },
    h,
  )

export const filterPicker = <M>(
  props: Readonly<{
    model: Menu.Model
    value: string
    toMessage: (message: Menu.Message) => M
  }>,
  h: HtmlBuilder<M>,
): Html =>
  Menu.dropdownMenu(
    {
      model: props.model,
      toParentMessage: props.toMessage,
      trigger: h.span(
        [h.Class('picker-label')],
        [
          glyph('list-filter', h),
          'Filter',
          ...(props.value !== 'all'
            ? [h.span([h.Class('filter-indicator')], ['1'])]
            : []),
        ],
      ),
      appearance: 'filter',
      triggerAriaLabel: 'Filter issues',
      ariaLabel: 'Filter issues',
      items: ['all', 'high', 'unassigned'],
      itemToConfig: value => ({
        label: (
          {
            all: 'All issues',
            high: 'High and urgent priority',
            unassigned: 'Unassigned',
          } as Record<string, string>
        )[value],
        kind: 'radio',
        isChecked: value === props.value,
        group: 'Show issues',
      }),
    },
    h,
  )

export const displayPicker = <M>(
  props: Readonly<{
    model: Menu.Model
    byPriority: boolean
    toMessage: (message: Menu.Message) => M
  }>,
  h: HtmlBuilder<M>,
): Html =>
  Menu.dropdownMenu(
    {
      model: props.model,
      toParentMessage: props.toMessage,
      trigger: h.span(
        [h.Class('picker-label')],
        [glyph('sliders-horizontal', h), 'Display'],
      ),
      appearance: 'display',
      triggerAriaLabel: 'Display options',
      ariaLabel: 'Display options',
      align: 'end',
      items: ['manual', 'priority'],
      itemToConfig: value => ({
        label: value === 'priority' ? 'Priority' : 'Default order',
        kind: 'radio',
        isChecked: props.byPriority === (value === 'priority'),
        group: 'Order within status',
      }),
    },
    h,
  )
