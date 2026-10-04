import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXButton from '@/stylex/button'
import * as StyleXField from '@/stylex/field'
import * as StyleXForm from '@/stylex/form'
import * as StyleXInput from '@/stylex/input'
import * as TailwindButton from '@/ui/button'
import * as TailwindField from '@/ui/field'
import * as TailwindForm from '@/ui/form'
import * as TailwindInput from '@/ui/input'

/**
 * Behavioral parity suite ported from Base UI's form tests
 * (base-ui/packages/react/src/form/Form.test.tsx, checked at base-ui HEAD).
 *
 * Base UI's <Form> is a validation coordinator: it registers every
 * <Field.Root>, runs their `validate` callbacks plus native constraint
 * validation on submit, focuses the first invalid control, feeds an
 * external `errors` map to named fields, and exposes an imperative
 * `actionsRef.validate()`. creaseui's `form` is a structural <form>
 * element instead: submission is a plain message, validity lives in the
 * app model, and error surfacing goes through `formItem`'s isInvalid +
 * `formMessage` + `errorSummary`. Native constraint validation (required
 * etc.) is browser behavior the vnode DSL cannot observe, so
 * submit-blocking cases become it.todo with e2e pointers.
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - describeConformance(<Form />) — ref instanceof/className/render-prop
 *    checks; React internals, foldkit fixes the element.
 *  - 'keeps the registration-order focus fallback stable across
 *    disconnected trees' — React portals into shadow roots plus real
 *    focus tracking; no scene-DSL equivalent.
 *  - 'focuses the first invalid field in document order when keyed fields
 *    are reordered' — React keyed reconciliation order plus real focus.
 *  - 'targets only the current Strict Mode registration after name, id,
 *    and control replacement' — Strict Mode effects + imperative
 *    actionsRef; React internals.
 *  - onFormSubmit's (formValues, eventDetails) payload — foldkit
 *    dispatches plain messages, not DOM event objects; collecting field
 *    values is the app model's job, not the form's.
 */

type Model = Readonly<{
  values: Readonly<Record<string, string>>
  errors: Readonly<Record<string, string>>
  submitCount: number
}>

type Message = Readonly<
  | { _tag: 'ChangedField'; name: string; value: string }
  | { _tag: 'ChangedFields'; updates: Readonly<Record<string, string>> }
  | { _tag: 'ClickedErrorLink'; controlId: string }
  | { _tag: 'Submitted' }
  | { _tag: 'Noop' }
>

const initialModel = (overrides: Partial<Model> = {}): Model => ({
  values: {},
  errors: {},
  submitCount: 0,
  ...overrides,
})

const withoutKeys = (
  record: Readonly<Record<string, string>>,
  keys: ReadonlyArray<string>,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(record).filter(([key]) => !keys.includes(key)),
  )

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'ChangedField':
      // Field change clears that field's error — Base UI does this inside
      // Form.clearErrors; creaseui apps own it in update.
      return {
        model: {
          ...model,
          values: { ...model.values, [message.name]: message.value },
          errors: withoutKeys(model.errors, [message.name]),
        },
      }
    case 'ChangedFields':
      return {
        model: {
          ...model,
          values: { ...model.values, ...message.updates },
          errors: withoutKeys(model.errors, Object.keys(message.updates)),
        },
      }
    case 'ClickedErrorLink':
    case 'Noop':
      return { model }
    case 'Submitted':
      return { model: { ...model, submitCount: model.submitCount + 1 } }
  }
}

type FormModule = Readonly<{
  form: <Msg>(
    props: {
      children: ReadonlyArray<Html | string>
      onSubmit?: Msg
      ariaLabel?: string
      isNoValidate?: boolean
    },
    h: HtmlBuilder<Msg>,
  ) => Html
  formItem: <Msg>(
    props: {
      id: string
      isInvalid?: boolean
      children: ReadonlyArray<Html | string>
    },
    h: HtmlBuilder<Msg>,
  ) => Html
  formLabel: <Msg>(
    props: { for: string; children: ReadonlyArray<Html | string> },
    h: HtmlBuilder<Msg>,
  ) => Html
  formMessage: <Msg>(props: { message?: string }, h: HtmlBuilder<Msg>) => Html
  errorSummary: <Msg>(
    props: {
      id: string
      title: Html | string
      errors: ReadonlyArray<
        Readonly<{ controlId: string; message: Html | string }>
      >
      isAutofocus?: boolean
      onErrorLink?: (controlId: string) => Msg
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type FieldModule = Readonly<{
  fieldSet: <Msg>(
    props: { isDisabled?: boolean; children: ReadonlyArray<Html | string> },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type InputModule = Readonly<{
  input: <Msg>(
    props: {
      id: string
      value: string
      onInput?: (value: string) => Msg
      name?: string
      isInvalid?: boolean
      isRequired?: boolean
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type ButtonModule = Readonly<{
  button: <Msg>(
    props: {
      children: ReadonlyArray<Html | string>
      onClick?: Msg
      type?: 'button' | 'submit' | 'reset'
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const formElement = Scene.selector('[data-slot="form"]')
const submitButton = Scene.role('button', { name: 'Submit' })
const fieldError = Scene.selector('[data-slot="field-error"]')
const submitCount = Scene.selector('[data-slot="submit-count"]')

const submitCountMarker = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div([h.DataAttribute('slot', 'submit-count')], [String(model.submitCount)])

// A formItem + label + input + formMessage whose invalid state and error
// text come from `model.errors[name]` — the model-driven analogue of Base
// UI's Form `errors` prop keyed by field name.
const namedField = (
  Form: FormModule,
  Input: InputModule,
  model: Model,
  name: string,
  label: string,
  h: HtmlBuilder<Message>,
): Html => {
  const error = model.errors[name]
  return Form.formItem(
    {
      id: `${name}-item`,
      isInvalid: error !== undefined,
      children: [
        Form.formLabel({ for: name, children: [label] }, h),
        Input.input(
          {
            id: name,
            name,
            value: model.values[name] ?? '',
            isInvalid: error !== undefined,
            isRequired: true,
            onInput: value => ({ _tag: 'ChangedField', name, value }),
          },
          h,
        ),
        Form.formMessage(error === undefined ? {} : { message: error }, h),
      ],
    },
    h,
  )
}

const errorForm =
  (Form: FormModule, Input: InputModule, Button: ButtonModule) =>
  (fields: ReadonlyArray<readonly [string, string]>) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    Form.form(
      {
        onSubmit: { _tag: 'Submitted' },
        ariaLabel: 'Account',
        children: [
          ...fields.map(([name, label]) =>
            namedField(Form, Input, model, name, label, h),
          ),
          Button.button({ type: 'submit', children: ['Submit'] }, h),
        ],
      },
      h,
    )

const verifyRenderer = (
  name: string,
  Form: FormModule,
  Field: FieldModule,
  Input: InputModule,
  Button: ButtonModule,
) => {
  describe(`${name} Form (Base UI port)`, () => {
    it.todo(
      'does not submit if there are errors — creaseui has no form-level ' +
        'validation registry; required-attribute blocking is native ' +
        'browser behavior the vnode DSL cannot observe (verify in e2e)',
    )

    it.todo(
      'blocks submit and focuses the first invalid field across custom ' +
        'and native validation — creaseui has no field registry, validate ' +
        'callbacks, or DSL-observable focus',
    )

    it.todo(
      'keeps focusing the first invalid field after a control value ' +
        'changes — the scene DSL has no focus tracking (verify in e2e)',
    )

    it.todo(
      'submits when a valid async validator is pending — creaseui has no ' +
        'validate callbacks',
    )

    it.todo(
      're-runs an onBlur cross-field validator on submit — creaseui has ' +
        'no validate callbacks or validationMode prop',
    )

    it.todo(
      'retires a stale async validation result on the next submit — ' +
        'creaseui has no async validation',
    )

    it.todo(
      'blocks submission on a resolved async error in onBlur mode — ' +
        'creaseui has no async validation',
    )

    it.todo(
      'blocks submission on a resolved async error in onChange mode — ' +
        'creaseui has no async validation',
    )

    it.todo(
      'does not submit if an unnamed registered field control is ' +
        'invalid — creaseui has no field registry tracking control ' +
        'validity',
    )

    it.todo(
      'clears invalid state for an unnamed registered field control on ' +
        'change — creaseui has no validity registry; apps drive validity ' +
        'through the model',
    )

    it.todo(
      'keeps same-name field validity scoped on submit — creaseui has no ' +
        'field registry',
    )

    it.todo(
      'removes the previous registered field id when another control ' +
        'takes over — creaseui has no field registry',
    )

    it.todo(
      'unmounted fields should be removed from the form — creaseui has ' +
        'no field registry to clean up',
    )

    it('excludes disabled fieldset fields from submission via the native disabled attribute', () => {
      // Base UI asserts a disabled <Fieldset.Root>'s fields are skipped by
      // validation and omitted from onFormSubmit values. creaseui renders
      // the native `<fieldset disabled>` — the exclusion itself is browser
      // behavior — so what is observable here is the disabled attribute,
      // the field carrying no invalid state, and submission going through.
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Form.form(
              {
                onSubmit: { _tag: 'Submitted' },
                ariaLabel: 'Profile',
                children: [
                  Field.fieldSet(
                    {
                      isDisabled: true,
                      children: [
                        namedField(
                          Form,
                          Input,
                          model,
                          'nickname',
                          'Nickname',
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                  namedField(Form, Input, model, 'email', 'Email', h),
                  Button.button({ type: 'submit', children: ['Submit'] }, h),
                  submitCountMarker(model, h),
                ],
              },
              h,
            ),
        },
        Scene.given(initialModel({ values: { email: 'sent@example.com' } })),
        Scene.expect(Scene.selector('fieldset')).toHaveAttr('disabled', 'true'),
        Scene.expect(
          Scene.role('textbox', { name: 'Nickname' }),
        ).not.toHaveAttr('aria-invalid'),
        Scene.expect(Scene.role('textbox', { name: 'Email' })).toHaveValue(
          'sent@example.com',
        ),
        Scene.click(submitButton),
        Scene.expectHandled(),
        Scene.expect(submitCount).toHaveText('1'),
      )
    })

    it.todo(
      'clears invalid UI when a fieldset field becomes disabled — ' +
        'creaseui has no validity machinery; clearing is model-owned',
    )

    it.todo(
      'clears invalid attributes when a field control becomes disabled ' +
        '— creaseui has no validity machinery; clearing is model-owned',
    )

    it.todo(
      're-registers field controls when they become enabled again — ' +
        'creaseui has no field registry',
    )

    // DIVERGENCE (intentional): Base UI blocks the submit and focuses the
    // first invalid control. creaseui surfaces invalid fields through an
    // `errorSummary` instead — a role=alert region focused on mount whose
    // links jump to each control (focusSelector wiring on the link's
    // click/keydown handlers).
    it('surfaces invalid fields through an error summary instead of focusing the first invalid control', () => {
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Form.form(
              {
                onSubmit: { _tag: 'Submitted' },
                ariaLabel: 'Account',
                children: [
                  ...(model.submitCount > 0 &&
                  Object.keys(model.errors).length > 0
                    ? [
                        Form.errorSummary(
                          {
                            id: 'account-errors',
                            title: 'Fix the following errors',
                            errors: Object.entries(model.errors).map(
                              ([controlId, message]) => ({
                                controlId,
                                message,
                              }),
                            ),
                            isAutofocus: true,
                            onErrorLink: controlId => ({
                              _tag: 'ClickedErrorLink',
                              controlId,
                            }),
                          },
                          h,
                        ),
                      ]
                    : []),
                  namedField(Form, Input, model, 'email', 'Email', h),
                  Button.button({ type: 'submit', children: ['Submit'] }, h),
                ],
              },
              h,
            ),
        },
        Scene.given(initialModel({ errors: { email: 'Enter your email.' } })),
        Scene.expect(
          Scene.selector('[data-slot="form-error-summary"]'),
        ).toBeAbsent(),
        Scene.click(submitButton),
        Scene.expectHandled(),
        // The summary is focused on mount — the modelled part of "focus
        // the first invalid field" that the DSL can observe.
        Scene.Mount.expectHas({
          name: 'focus-form-error-summary-account-errors',
        }),
        Scene.Mount.resolve(
          { name: 'focus-form-error-summary-account-errors' },
          { _tag: 'Noop' },
        ),
        Scene.expect(
          Scene.selector('[data-slot="form-error-summary"]'),
        ).toHaveId('account-errors'),
        Scene.expect(
          Scene.selector('[data-slot="form-error-summary"]'),
        ).toHaveAttr('role', 'alert'),
        Scene.expect(
          Scene.role('link', { name: 'Enter your email.' }),
        ).toHaveAttr('tabIndex', '0'),
        Scene.expect(
          Scene.role('link', { name: 'Enter your email.' }),
        ).toHaveHandler('click'),
        Scene.expect(
          Scene.role('link', { name: 'Enter your email.' }),
        ).toHaveHandler('keydown'),
        Scene.click(Scene.role('link', { name: 'Enter your email.' })),
        Scene.expectHandled(),
      )
    })

    describe('prop: errors', () => {
      // Base UI drives these through `<Form errors={{ name: message }}>`;
      // creaseui has no form-level errors prop, so the model drives
      // formItem isInvalid + formMessage instead.
      it('should mark the control as invalid and populate the error message', () => {
        Scene.scene(
          {
            update,
            view: errorForm(Form, Input, Button)([['foo', 'Foo']]),
          },
          Scene.given(initialModel({ errors: { foo: 'bar' } })),
          Scene.expect(Scene.role('textbox', { name: 'Foo' })).toHaveAttr(
            'aria-invalid',
            'true',
          ),
          Scene.expect(Scene.selector('[data-slot="field"]')).toHaveAttr(
            'data-invalid',
            'true',
          ),
          Scene.expect(fieldError).toHaveText('bar'),
        )
      })

      it('should not mark the control as invalid if no error is provided', () => {
        Scene.scene(
          {
            update,
            view: errorForm(Form, Input, Button)([['foo', 'Foo']]),
          },
          Scene.given(initialModel()),
          Scene.expect(fieldError).toBeAbsent(),
          Scene.expect(Scene.role('textbox', { name: 'Foo' })).not.toHaveAttr(
            'aria-invalid',
          ),
          Scene.expect(Scene.selector('[data-slot="field"]')).not.toHaveAttr(
            'data-invalid',
          ),
        )
      })

      // Covers the error-clearing half of Base UI's 'focuses
      // asynchronously replaced external errors and clears only the
      // changed own property'; the focus half is unobservable in the DSL.
      it('clears only the changed field error when external errors are replaced', () => {
        Scene.scene(
          {
            update,
            view: errorForm(
              Form,
              Input,
              Button,
            )([
              ['first', 'First'],
              ['second', 'Second'],
            ]),
          },
          Scene.given(
            initialModel({
              errors: { first: 'First error', second: 'Second error' },
            }),
          ),
          Scene.expect(Scene.text('First error')).toExist(),
          Scene.expect(Scene.text('Second error')).toExist(),
          Scene.type(Scene.role('textbox', { name: 'First' }), 'a'),
          Scene.expectHandled(),
          Scene.expect(Scene.text('First error')).toBeAbsent(),
          Scene.expect(Scene.text('Second error')).toExist(),
        )
      })

      it.todo(
        'focuses the first invalid field only on submit — the scene DSL ' +
          'has no focus tracking (errorSummary covers the redirect; ' +
          'verify in e2e)',
      )

      it.todo(
        'does not swap focus immediately on change after two submissions ' +
          '— the scene DSL has no focus tracking',
      )

      it('removes errors upon change', () => {
        Scene.scene(
          {
            update,
            view: errorForm(
              Form,
              Input,
              Button,
            )([
              ['name', 'Name'],
              ['age', 'Age'],
            ]),
          },
          Scene.given(
            initialModel({
              errors: { name: 'Name is required', age: 'Age is required' },
            }),
          ),
          Scene.expect(Scene.text('Name is required')).toExist(),
          Scene.expect(Scene.text('Age is required')).toExist(),
          Scene.type(Scene.role('textbox', { name: 'Name' }), 'John'),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Name is required')).toBeAbsent(),
          Scene.type(Scene.role('textbox', { name: 'Age' }), '42'),
          Scene.expect(Scene.text('Age is required')).toBeAbsent(),
        )
      })

      it.todo(
        'runs field validation on first change after Form error is set ' +
          '— creaseui has no validate callbacks',
      )

      it.todo(
        'runs field validation on change when invalid prop is true and ' +
          'validationMode is onChange — creaseui has no invalid prop, ' +
          'validate callback, or validationMode',
      )

      it.todo(
        'does not run field validation on change for onBlur mode when ' +
          'invalid prop is true — creaseui has no validate callback or ' +
          'validationMode',
      )

      it('removes errors for every field that changes within a single commit', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Form.form(
                {
                  onSubmit: { _tag: 'Submitted' },
                  ariaLabel: 'Multi',
                  children: [
                    namedField(Form, Input, model, 'a', 'A', h),
                    namedField(Form, Input, model, 'b', 'B', h),
                    namedField(Form, Input, model, 'c', 'C', h),
                    Button.button(
                      {
                        children: ['Change both'],
                        onClick: {
                          _tag: 'ChangedFields',
                          updates: { a: '1', b: '1' },
                        },
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
          },
          Scene.given(
            initialModel({
              errors: { a: 'A error', b: 'B error', c: 'C error' },
            }),
          ),
          Scene.expect(Scene.text('A error')).toExist(),
          Scene.expect(Scene.text('B error')).toExist(),
          Scene.expect(Scene.text('C error')).toExist(),
          Scene.click(Scene.role('button', { name: 'Change both' })),
          Scene.expectHandled(),
          Scene.expect(Scene.text('A error')).toBeAbsent(),
          Scene.expect(Scene.text('B error')).toBeAbsent(),
          Scene.expect(Scene.text('C error')).toExist(),
        )
      })
    })

    describe('prop: onFormSubmit', () => {
      it('runs when the form is submitted', () => {
        // Base UI asserts onFormSubmit receives collected formValues;
        // creaseui dispatches the plain onSubmit message — value
        // collection stays in the app model.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Form.form(
                {
                  onSubmit: { _tag: 'Submitted' },
                  ariaLabel: 'Signup',
                  children: [
                    Input.input(
                      {
                        id: 'username',
                        name: 'username',
                        value: model.values['username'] ?? '',
                        onInput: value => ({
                          _tag: 'ChangedField',
                          name: 'username',
                          value,
                        }),
                      },
                      h,
                    ),
                    Button.button({ type: 'submit', children: ['Submit'] }, h),
                    submitCountMarker(model, h),
                  ],
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(submitCount).toHaveText('0'),
          Scene.click(submitButton),
          Scene.expectHandled(),
          Scene.expect(submitCount).toHaveText('1'),
          Scene.click(submitButton),
          Scene.expect(submitCount).toHaveText('2'),
        )
      })

      it.todo(
        'does not run when the form is invalid — creaseui has no ' +
          'validity gating; required-attribute blocking is native ' +
          'browser behavior (verify in e2e)',
      )
    })

    it.todo(
      'does not submit when invalid prop remains true even if validate ' +
        'returns null — creaseui has no invalid prop or validate callback',
    )

    describe('prop: noValidate', () => {
      // DIVERGENCE: Base UI hardcodes `noValidate` on the <form> (its
      // validation is JS-driven, so native validation is always off).
      // creaseui emits the attribute only when isNoValidate is passed, so
      // a default creaseui form still runs native constraint validation.
      it.fails('should disable native validation if set to true (default)', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Form.form({ ariaLabel: 'Bare', children: [] }, h),
          },
          Scene.given(initialModel()),
          Scene.expect(formElement).toHaveAttr('noValidate', 'true'),
        )
      })

      it('emits novalidate when isNoValidate is set', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Form.form(
                {
                  ariaLabel: 'Bare',
                  isNoValidate: true,
                  children: [],
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(formElement).toHaveAttr('noValidate', 'true'),
        )
      })

      it('should enable native validation if set to false', () => {
        // `noValidate={false}` writes the DOM property false — no
        // `novalidate` attribute is rendered, matching Base UI.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Form.form(
                {
                  ariaLabel: 'Bare',
                  isNoValidate: false,
                  children: [],
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(formElement).toHaveAttr('noValidate', 'false'),
        )
      })
    })

    describe('prop: actionsRef', () => {
      it.todo(
        'validates the form when the `validate` method is called — ' +
          'creaseui has no imperative form API (no actionsRef)',
      )

      it.todo(
        'validates a field when the `validate` method is called with ' +
          'the field name — creaseui has no imperative form API',
      )
    })
  })
}

verifyRenderer(
  'Tailwind',
  TailwindForm,
  TailwindField,
  TailwindInput,
  TailwindButton,
)
verifyRenderer('StyleX', StyleXForm, StyleXField, StyleXInput, StyleXButton)
