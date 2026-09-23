import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Field from '@/stylex/field';
import * as Input from '@/stylex/input';

const styles = stylex.create({ field: { maxWidth: '24rem' } });

type PreviewModel = {
  value: string;
  lastName: string;
};

export const fieldStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const preview = model as PreviewModel;
  const onValue = (value: string) =>
    onMessageJson(JSON.stringify({ _tag: 'ChangedFieldPreviewValue', value }));
  const onLastName = (value: string) =>
    onMessageJson(JSON.stringify({ _tag: 'ChangedFieldPreviewLastName', value }));
  const control = (
    id: string,
    label: string,
    value: string,
    onInput: (value: string) => Msg,
    description?: string,
    error?: string,
  ) =>
    Field.controlField(
      {
        id,
        label,
        ...(description === undefined ? {} : { description }),
        ...(error === undefined ? {} : { error }),
        layoutStyle: styles.field,
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
  if (index === 0)
    return control('docs-field-name', 'Display name', preview.value, onValue, 'Shown on your public profile.');
  if (index === 1)
    return control('docs-field-error', 'Display name', preview.value, onValue, undefined, 'Display name is required.');
  if (index === 2)
    return control(
      'docs-field-username',
      'Username',
      preview.value,
      onValue,
      'Availability is checked after each edit.',
      preview.value.length < 3 ? 'Use at least three characters.' : undefined,
    );
  return Field.fieldGroup(
    {
      layoutStyle: styles.field,
      children: [
        control('docs-field-first', 'First name', preview.value, onValue),
        control('docs-field-last', 'Last name', preview.lastName, onLastName),
      ],
    },
    h,
  );
};
