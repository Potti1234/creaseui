// @ts-nocheck: snapshot of creaseui-demo chapter-10:src/design/property-picker.ts
import { Schema as S } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  type Issue,
  PEOPLE,
  PRIORITIES,
  PRIORITY_LABEL,
  Priority,
  STATUSES_IN_ORDER,
  STATUS_LABEL,
  Status,
  personOf,
} from '../domain'
import { priorityGlyph, statusGlyph } from './glyphs'
import { avatar, avatarFallback } from '../ui/avatar'
import * as DropdownMenu from '../ui/dropdown-menu'
import { icon } from '../ui/icon'

/**
 * PropertyPicker: change one property of an issue where it is shown.
 *
 * Rules (decision D7):
 * - Status, priority and assignee change through this picker and nothing
 *   else. It opens from the property's own glyph, inside the row.
 * - The list of choices is the domain's vocabulary, in its order (D10):
 *   every status, every priority, every person plus "No assignee".
 * - The current value is checked. Choosing a value changes the issue and
 *   closes the menu; focus returns to the glyph that opened it.
 * - The trigger's accessible name says what it changes and the current
 *   value ("Status: In Progress").
 *
 * The page keeps one menu Model, for the menu that is open; every closed
 * picker renders from `closedMenu(key)`.
 */

export type PickerField = 'status' | 'priority' | 'assignee'

export const NO_ASSIGNEE = 'none'

/** The id of one picker, unique per issue and property. */
export const pickerKey = (issue: Issue, field: PickerField): string =>
  `${issue.id}--${field}`

export const closedMenu = (key: string): DropdownMenu.Model =>
  DropdownMenu.init({ id: key })

export type PickerContext<Msg> = Readonly<{
  /** The menu for a picker: the open one from the Model, or a closed one. */
  menuFor: (key: string) => DropdownMenu.Model
  toParentMessage: (key: string) => (message: DropdownMenu.Message) => Msg
}>

type Choice = Readonly<{ value: string; label: string; glyph: Html }>

const choices = <Msg>(
  field: PickerField,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Choice> => {
  switch (field) {
    case 'status':
      return STATUSES_IN_ORDER.map(status => ({
        value: status,
        label: STATUS_LABEL[status],
        glyph: statusGlyph(status, h),
      }))
    case 'priority':
      return PRIORITIES.map(priority => ({
        value: priority,
        label: PRIORITY_LABEL[priority],
        glyph: priorityGlyph(priority, h),
      }))
    case 'assignee':
      return [
        {
          value: NO_ASSIGNEE,
          label: 'No assignee',
          glyph: icon({ name: 'user-round-x', size: 'sm', tone: 'muted' }, h),
        },
        ...PEOPLE.map(person => ({
          value: person.id,
          label: person.name,
          glyph: initials(person.initials, h),
        })),
      ]
  }
}

const initials = <Msg>(text: string, h: HtmlBuilder<Msg>): Html =>
  avatar({ size: 'sm', children: [avatarFallback({ children: [text] }, h)] }, h)

const currentValue = (issue: Issue, field: PickerField): string =>
  field === 'status'
    ? issue.status
    : field === 'priority'
      ? issue.priority
      : (issue.assigneeId ?? NO_ASSIGNEE)

const currentLabel = (issue: Issue, field: PickerField): string =>
  field === 'status'
    ? STATUS_LABEL[issue.status]
    : field === 'priority'
      ? PRIORITY_LABEL[issue.priority]
      : (personOf(issue.assigneeId)?.name ?? 'No assignee')

const FIELD_LABEL: Readonly<Record<PickerField, string>> = {
  status: 'Status',
  priority: 'Priority',
  assignee: 'Assignee',
}

const trigger = <Msg>(
  issue: Issue,
  field: PickerField,
  h: HtmlBuilder<Msg>,
): Html =>
  field === 'status'
    ? statusGlyph(issue.status, h)
    : field === 'priority'
      ? priorityGlyph(issue.priority, h)
      : initials(personOf(issue.assigneeId)?.initials ?? '–', h)

export const propertyPicker = <Msg>(
  props: Readonly<{
    issue: Issue
    field: PickerField
    context: PickerContext<Msg>
  }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const key = pickerKey(props.issue, props.field)
  const options = choices(props.field, h)
  const current = currentValue(props.issue, props.field)
  return DropdownMenu.dropdownMenu<string, Msg>(
    {
      model: props.context.menuFor(key),
      toParentMessage: props.context.toParentMessage(key),
      trigger: trigger(props.issue, props.field, h),
      triggerAriaLabel: `${FIELD_LABEL[props.field]}: ${currentLabel(props.issue, props.field)}`,
      ariaLabel: `Change ${FIELD_LABEL[props.field].toLowerCase()}`,
      items: options.map(option => option.value),
      itemToConfig: value => {
        const option = options.find(each => each.value === value)
        return {
          label: option?.label ?? value,
          ...(option === undefined ? {} : { icon: option.glyph }),
          kind: 'radio',
          isChecked: value === current,
        }
      },
      align: 'start',
    },
    h,
  )
}

const isStatus = S.is(Status)
const isPriority = S.is(Priority)

/** The issue with one property set from a picker's value; an unknown value changes nothing. */
export const withProperty = (
  issue: Issue,
  field: PickerField,
  value: string,
): Issue => {
  switch (field) {
    case 'status':
      return isStatus(value) ? { ...issue, status: value } : issue
    case 'priority':
      return isPriority(value) ? { ...issue, priority: value } : issue
    case 'assignee':
      return value === NO_ASSIGNEE
        ? { ...issue, assigneeId: null }
        : personOf(value) === undefined
          ? issue
          : { ...issue, assigneeId: value }
  }
}
