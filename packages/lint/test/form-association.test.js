import { RuleTester } from 'eslint'

import { formAssociation } from '../rules/form-association.js'

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
})

const form = id =>
  `Form.form({ id: '${id}', onSubmit: submitted, children: [emailInput] }, h)`

tester.run('crease/form-association', formAssociation, {
  valid: [
    // Footer submit associated with the module's Form.
    `${form('invite-member-form')}; Button.button({ type: 'submit', form: 'invite-member-form', children: ['Send'] }, h)`,
    // Nested submit and ordinary actions need no reference.
    `Form.form({ id: 'search', children: [Button.button({ type: 'submit', children: ['Go'] }, h)] }, h); Button.button({ onClick: clicked, children: ['Refresh'] }, h)`,
    // No Form rendered here: the association can't be proven statically.
    `Button.button({ type: 'submit', form: 'rendered-elsewhere', children: ['Send'] }, h)`,
    // Computed ids are unsupported statically and left to the audit.
    `${form('invite')}; Button.button({ type: 'submit', form: formId, children: ['Send'] }, h)`,
    // Standalone search input without a form.
    `Input.input({ type: 'search', value: query, onInput: changed }, h)`,
  ],
  invalid: [
    {
      code: `${form('invite-member-form')}; Button.button({ type: 'submit', form: 'invite-form', children: ['Send'] }, h)`,
      errors: [
        {
          messageId: 'unknownForm',
          data: { id: 'invite-form', ids: "'invite-member-form'" },
        },
      ],
    },
    {
      code: `${form('a')}; button({ type: 'submit', form: \`b\`, children: ['Send'] }, h)`,
      errors: [{ messageId: 'unknownForm' }],
    },
  ],
})
