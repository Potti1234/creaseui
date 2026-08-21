import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledStringApplication } from '@/docs/components/pages/authored-page';
import * as InputGroup from '@/ui/input-group';

const source = (name: string, addon: string, placeholder: string): string => controlledStringApplication({
  componentName: 'InputGroup', componentSlug: 'input-group', exampleName: name,
  field: 'query', initialValue: '', messageName: 'ChangedQuery',
  viewBody: `InputGroup.inputGroup({
  class: 'max-w-sm',
  children: [
    ${addon}
    InputGroup.inputGroupInput({
      id: 'query',
      value: model.query,
      onInput: value => ChangedQuery({ value }),
      placeholder: '${placeholder}',
    }, h),
  ],
}, h),`,
});

export const inputGroupPage = authoredPage({
  slug: 'input-group', title: 'Input Group', kind: 'recipe',
  definition: {
    kind: 'recipe', description: 'Composes a text control with contextual prefixes, suffixes, actions, or block-level supporting content.',
    architecture: 'Input Group is a stateless composition recipe. The input value remains parent state; addons provide context and should not become a second competing control.',
    apiHref: 'https://foldkit.dev/ui/input',
    composition: 'InputGroup\n├── InputGroupAddon / InputGroupText\n├── InputGroupInput\n└── InputGroupButton',
    styling: 'Place units and stable prefixes inline. Use block alignment only for supporting content that genuinely needs the full row.',
    accessibility: 'The group role communicates association, but the input still needs its own accessible label. Decorative addons should not duplicate that name.',
    examples: [
      {
        title: 'URL prefix', description: 'A stable protocol prefix gives context while the editable path remains ordinary string state.',
        preview: (model, h) => InputGroup.inputGroup({ class: 'max-w-sm', children: [InputGroup.inputGroupAddon({ children: [InputGroup.inputGroupText({ children: ['https://'] }, h)] }, h), InputGroup.inputGroupInput({ id: 'docs-input-group-url', value: model.inputGroup, onInput: (value) => State.ChangedText({ target: 'inputGroup', value }), placeholder: 'example.com' }, h)] }, h),
        code: source('URL prefix', `InputGroup.inputGroupAddon({
      children: [InputGroup.inputGroupText({ children: ['https://'] }, h)],
    }, h),`, 'example.com'),
      },
      {
        title: 'Trailing unit', description: 'Align a unit after the control when it qualifies the entered value.',
        preview: (model, h) => InputGroup.inputGroup({ class: 'max-w-sm', children: [InputGroup.inputGroupInput({ id: 'docs-input-group-weight', value: model.inputGroup, onInput: (value) => State.ChangedText({ target: 'inputGroup', value }), placeholder: '0' }, h), InputGroup.inputGroupAddon({ align: 'inline-end', children: [InputGroup.inputGroupText({ children: ['kg'] }, h)] }, h)] }, h),
        code: source('Trailing unit', `InputGroup.inputGroupAddon({
      align: 'inline-end',
      children: [InputGroup.inputGroupText({ children: ['kg'] }, h)],
    }, h),`, '0'),
      },
    ],
  },
});
