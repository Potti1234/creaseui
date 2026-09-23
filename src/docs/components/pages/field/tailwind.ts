import { Effect, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Field from '@/ui/field';
import * as Input from '@/ui/input';

const ChangedValue = m('ChangedFieldPreviewValue', { value: S.String });
const ChangedLastName = m('ChangedFieldPreviewLastName', { value: S.String });
const CompletedValidation = m('CompletedFieldPreviewValidation', {
  version: S.Number,
  error: S.NullOr(S.String),
});
const PreviewMessage = S.Union([ChangedValue, ChangedLastName, CompletedValidation]);
type PreviewMessage = typeof PreviewMessage.Type;
const PreviewModel = S.Struct({
  _docsPage: S.Literal('field'),
  exampleIndex: S.Number,
  value: S.String,
  lastName: S.String,
  validationVersion: S.Number,
  error: S.NullOr(S.String),
});
type PreviewModel = typeof PreviewModel.Type;

const ValidateUsername = Command.define('ValidateDocsFieldUsername', {
  args: { username: S.String, version: S.Number },
  messages: [CompletedValidation],
  execute: ({ username, version }) =>
    Effect.sleep('250 millis').pipe(
      Effect.as(
        CompletedValidation({
          version,
          error: username.length < 3 ? 'Use at least three characters.' : null,
        }),
      ),
    ),
});

export const fieldTailwindPreviewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: index => ({
    _docsPage: 'field',
    exampleIndex: index,
    value: index === 2 ? 'ad' : '',
    lastName: '',
    validationVersion: 0,
    error: index === 2 ? 'Use at least three characters.' : null,
  }),
  update: (model, message) => {
    switch (message._tag) {
      case 'ChangedFieldPreviewValue': {
        if (model.exampleIndex !== 2)
          return [{ ...model, value: message.value }, []];
        const validationVersion = model.validationVersion + 1;
        return [
          { ...model, value: message.value, validationVersion, error: null },
          [ValidateUsername({ username: message.value, version: validationVersion })],
        ];
      }
      case 'ChangedFieldPreviewLastName':
        return [{ ...model, lastName: message.value }, []];
      case 'CompletedFieldPreviewValidation':
        return message.version === model.validationVersion
          ? [{ ...model, error: message.error }, []]
          : [model, []];
    }
  },
  view: (index, model, h) => {
    const control = (
      id: string,
      label: string,
      value: string,
      onInput: (value: string) => PreviewMessage,
      description?: string,
      error?: string,
    ) =>
      Field.controlField(
        {
          id,
          label,
          ...(description === undefined ? {} : { description }),
          ...(error === undefined ? {} : { error }),
          class: 'max-w-sm',
          toControl: (parts, controlH) =>
            Input.input(
              {
                id: parts.controlId,
                value,
                onInput,
                placeholder: 'Ada Lovelace',
                ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }),
                isInvalid: parts.isInvalid,
                isDisabled: parts.isDisabled,
              },
              controlH,
            ),
        },
        h,
      );
    const onValue = (value: string) => ChangedValue({ value });
    if (index === 0)
      return control('docs-field-name', 'Display name', model.value, onValue, 'Shown on your public profile.');
    if (index === 1)
      return control('docs-field-error', 'Display name', model.value, onValue, undefined, 'Display name is required.');
    if (index === 2)
      return control(
        'docs-field-username',
        'Username',
        model.value,
        onValue,
        'Availability is checked after each edit.',
        model.error ?? undefined,
      );
    return Field.fieldGroup(
      {
        class: 'max-w-sm',
        children: [
          control('docs-field-first', 'First name', model.value, onValue),
          control('docs-field-last', 'Last name', model.lastName, value => ChangedLastName({ value })),
        ],
      },
      h,
    );
  },
});
