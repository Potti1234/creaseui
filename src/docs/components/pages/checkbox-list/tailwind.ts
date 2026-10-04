import { Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import type { HtmlBuilder } from 'foldkit/html'

import { definePreviewProgram } from '@/docs/components/pages/authored-page'
import {
  checkboxListDocuments,
  checkboxListFixtures,
  type CheckboxListFixture,
} from '@/docs/components/pages/checkbox-list/shared'
import * as CheckboxList from '@/ui/checkbox-list'
import * as Badge from '@/ui/badge'

const ChangedValue = defineMessageUnion({
  ChangedValue: { values: S.Array(S.String) },
})
type ChangedValue = typeof ChangedValue.Type

const CheckboxListPreviewModel = S.Struct({
  _docsPage: S.Literal('checkbox-list'),
  value: S.Array(S.String),
})
type CheckboxListPreviewModel = typeof CheckboxListPreviewModel.Type

const buildItems = <Msg>(
  fixture: CheckboxListFixture,
  selected: ReadonlyArray<string>,
  emit: (values: ReadonlyArray<string>) => Msg,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<CheckboxList.CheckboxListEntry<Msg>> => {
  if (fixture.kind === 'selectAll') {
    const allChecked = checkboxListDocuments.every(doc =>
      selected.includes(doc.id),
    )
    const noneChecked = selected.length === 0
    const selectAllState: boolean | 'indeterminate' = allChecked
      ? true
      : noneChecked
        ? false
        : 'indeterminate'
    return [
      {
        label: 'Select all',
        isChecked: selectAllState,
        onToggle: checked =>
          emit(checked ? checkboxListDocuments.map(doc => doc.id) : []),
      },
      CheckboxList.checkboxListDivider,
      ...checkboxListDocuments.map(doc => ({
        label: doc.label,
        isChecked: selected.includes(doc.id),
        onToggle: (checked: boolean) =>
          emit(
            checked
              ? [...selected, doc.id]
              : selected.filter(value => value !== doc.id),
          ),
      })),
    ]
  }
  return fixture.items.map(item => ({
    label: item.label,
    value: item.value,
    ...(item.description === undefined
      ? {}
      : { description: item.description }),
    ...(item.endContent === undefined
      ? {}
      : {
          endContent: Badge.badge(
            {
              variant: item.endContent.variant,
              children: [item.endContent.label],
            },
            h,
          ),
        }),
  }))
}

export const checkboxListTailwindPreviewProgram = definePreviewProgram<
  CheckboxListPreviewModel,
  ChangedValue
>({
  Model: CheckboxListPreviewModel,
  Message: ChangedValue,
  init: index => {
    const fixture = checkboxListFixtures[index] ?? checkboxListFixtures[0]
    return {
      _docsPage: 'checkbox-list',
      value: [...fixture.initialValue],
    }
  },
  update: (model, message) => {
    switch (message._tag) {
      case 'ChangedValue':
        return { model: { ...model, value: message.values } }
    }
  },
  view: (index, model, h) => {
    const fixture = checkboxListFixtures[index] ?? checkboxListFixtures[0]
    return h.div(
      [h.Class('w-full max-w-md')],
      [
        CheckboxList.checkboxList(
          {
            id: `docs-checkbox-list-${String(index)}`,
            label: fixture.label,
            ...(fixture.helperText === undefined
              ? {}
              : { description: fixture.helperText }),
            value: model.value,
            onChange: values => ChangedValue.ChangedValue({ values }),
            ...(fixture.hasDividers === true ? { hasDividers: true } : {}),
            items: buildItems(
              fixture,
              model.value,
              values => ChangedValue.ChangedValue({ values: [...values] }),
              h,
            ),
          },
          h,
        ),
      ],
    )
  },
})
