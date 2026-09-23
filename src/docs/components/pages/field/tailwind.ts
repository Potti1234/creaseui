import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Field from '@/ui/field';
import * as Input from '@/ui/input';

const ChangedValue = m('ChangedFieldPreviewValue', { value: S.String });
const ChangedLastName = m('ChangedFieldPreviewLastName', { value: S.String });
const PreviewMessage = S.Union([ChangedValue, ChangedLastName]);
type PreviewMessage = typeof PreviewMessage.Type;
const PreviewModel = S.Struct({
  _docsPage: S.Literal('field'),
  exampleIndex: S.Number,
  value: S.String,
  lastName: S.String,
});
type PreviewModel = typeof PreviewModel.Type;

export const fieldTailwindPreviewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: index => ({
    _docsPage: 'field',
    exampleIndex: index,
    value: index === 2 ? 'ad' : '',
    lastName: '',
  }),
  update: (model, message) => {
    switch (message._tag) {
      case 'ChangedFieldPreviewValue':
        return [{ ...model, value: message.value }, []];
      case 'ChangedFieldPreviewLastName':
        return [{ ...model, lastName: message.value }, []];
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
        model.value.length < 3 ? 'Use at least three characters.' : undefined,
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
