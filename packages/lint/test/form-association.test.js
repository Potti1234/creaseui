import { RuleTester } from 'eslint'

import { formAssociation } from '../rules/form-association.js'

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
})

const imports = `import * as Button from '@/ui/button'
import * as Form from '@/ui/form'
import * as Dialog from '@/ui/dialog'
`
const form = id =>
  `Form.form({ id: '${id}', onSubmit: submitted, children: [emailInput] }, h)`
const view = children =>
  `${imports}export const view = h => h.div([], [${children.join(', ')}])`
const submit = target =>
  `Button.button({ type: 'submit', form: ${target}, children: ['Send'] }, h)`

tester.run('crease/form-association', formAssociation, {
  valid: [
    // Footer submit associated with the view's Form.
    view([form('invite-member-form'), submit("'invite-member-form'")]),
    // Nested submit and ordinary actions need no reference.
    `${imports}export const view = h => [Form.form({ id: 'search', children: [Button.button({ type: 'submit', children: ['Go'] }, h)] }, h), Button.button({ onClick: clicked, children: ['Refresh'] }, h)]`,
    // No Form rendered here: the association can't be proven statically.
    view([submit("'rendered-elsewhere'")]),
    // Computed ids are unsupported statically and left to the audit.
    view([form('invite'), submit('formId')]),
    // Review F7: a computed Form id next to an unrelated literal Form.
    `${imports}export const view = (h, id) => h.div([], [${form('local')}, Form.form({ id, children: [] }, h), ${submit("'external'")}])`,
    // A helper from another module renders the target Form.
    `${imports}import { externalForm } from './external'\n${view([form('local'), 'externalForm(h)', submit("'external'")]).replace(imports, '')}`,
    // A callback the parent passes in may render it.
    `${imports}export const view = (h, body) => h.div([], [${form('local')}, body(h), ${submit("'external'")}])`,
    // A local helper renders it.
    `${imports}const settings = h => ${form('external')}\nexport const view = h => h.div([], [${form('local')}, settings(h), ${submit("'external'")}])`,
    // Review F7 (Oct 21): a local object's method renders the target Form.
    `${imports}const sections = { external: h => ${form('external')} }\nexport const view = h => h.div([], [${form('local')}, sections.external(h), ${submit("'external'")}])`,
    // A method on a parameter object, a nested member, or a collection
    // callback may render it too.
    `${imports}export const view = (h, parts) => h.div([], [${form('local')}, parts.body(h), ${submit("'external'")}])`,
    `${imports}import * as Sections from './sections'\nexport const view = h => h.div([], [${form('local')}, Sections.all.external(h), ${submit("'external'")}])`,
    `${imports}const renderers = [h => ${form('external')}]\nexport const view = h => h.div([], [${form('local')}, ...renderers.map(render => render(h)), ${submit("'external'")}])`,
    // Several Forms; the footer names one of them, inside a Dialog.
    `${imports}export const view = h => Dialog.dialog({ children: [${form('a')}, ${form('b')}], footer: [${submit("'b'")}] }, h)`,
    // An unrelated function's literal Form does not close another view.
    `${imports}export const settings = h => ${form('settings')}\nexport const footer = h => ${submit("'invite'")}`,
    // Callee spelling alone is not a Crease component.
    `export const view = h => [Form.form({ id: 'a', children: [] }, h), Button.button({ type: 'submit', form: 'b', children: [] }, h)]`,
    `import { form, button } from './local-helpers'\nexport const view = h => [form({ id: 'a', children: [] }, h), button({ type: 'submit', form: 'b', children: [] }, h)]`,
    // Standalone search input without a form.
    `Input.input({ type: 'search', value: query, onInput: changed }, h)`,
  ],
  invalid: [
    {
      code: view([form('invite-member-form'), submit("'invite-form'")]),
      errors: [
        {
          messageId: 'unknownForm',
          data: { id: 'invite-form', ids: "'invite-member-form'" },
        },
      ],
    },
    {
      code: `import { button } from '@/ui/button'\nimport { form } from '@/ui/form'\nexport const view = h => [form({ id: 'a', children: [] }, h), button({ type: 'submit', form: \`b\`, children: ['Send'] }, h)]`,
      errors: [{ messageId: 'unknownForm' }],
    },
    {
      code: `${imports}export const view = h => Dialog.dialog({ children: [${form('a')}, ${form('b')}], footer: [${submit("'c'")}] }, h)`,
      errors: [
        { messageId: 'unknownForm', data: { id: 'c', ids: "'a', 'b'" } },
      ],
    },
  ],
})
