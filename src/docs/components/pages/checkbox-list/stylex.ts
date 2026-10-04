import * as stylex from '@stylexjs/stylex'
import { Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { definePreviewProgram } from '@/docs/components/pages/authored-page'
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  checkboxListDocuments,
  checkboxListFixtures,
  type CheckboxListFixture,
} from '@/docs/components/pages/checkbox-list/shared'
import * as CheckboxList from '@/stylex/checkbox-list'
import * as Badge from '@/stylex/badge'
import { className } from '@/stylex/style'

const styles = stylex.create({
  wide: {
    maxWidth: '28rem',
    width: '100%',
  },
})

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

export const checkboxListStylexPreviewProgram = definePreviewProgram<
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
  view: (index, model, h) =>
    h.div(
      [h.Class(className(styles.wide))],
      [
        CheckboxList.checkboxList(
          {
            id: `docs-checkbox-list-${String(index)}`,
            label: fixtureLabel(index),
            ...descriptionSpread(index),
            value: model.value,
            onChange: values =>
              ChangedValue.ChangedValue({ values: [...values] }),
            ...(fixtureDividers(index) ? { hasDividers: true as const } : {}),
            items: buildItems(
              checkboxListFixtures[index] ?? checkboxListFixtures[0],
              model.value,
              values => ChangedValue.ChangedValue({ values: [...values] }),
              h,
            ),
          },
          h,
        ),
      ],
    ),
})

const descriptionSpread = (
  index: number,
): Readonly<{ description?: string }> => {
  const helper = fixtureHelper(index)
  return helper === undefined ? {} : { description: helper }
}

const fixtureLabel = (index: number): string =>
  (checkboxListFixtures[index] ?? checkboxListFixtures[0]).label
const fixtureHelper = (index: number): string | undefined =>
  (checkboxListFixtures[index] ?? checkboxListFixtures[0]).helperText
const fixtureDividers = (index: number): boolean =>
  (checkboxListFixtures[index] ?? checkboxListFixtures[0]).hasDividers === true

export const checkboxListStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const fixture = checkboxListFixtures[exampleIndex] ?? checkboxListFixtures[0]
  const previewModel = model as { value: ReadonlyArray<string> }
  const emit = (values: ReadonlyArray<string>): Msg =>
    onMessageJson(JSON.stringify({ _tag: 'ChangedValue', values: [...values] }))
  return h.div(
    [h.Class(className(styles.wide))],
    [
      CheckboxList.checkboxList(
        {
          id: `docs-checkbox-list-${String(exampleIndex)}`,
          label: fixture.label,
          ...(fixture.helperText === undefined
            ? {}
            : { description: fixture.helperText }),
          value: previewModel.value,
          onChange: values => emit(values),
          ...(fixture.hasDividers === true ? { hasDividers: true } : {}),
          items: buildItems(fixture, previewModel.value, emit, h),
        },
        h,
      ),
    ],
  )
}
