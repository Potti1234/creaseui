import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXField from '@/stylex/field'
import * as StyleXInput from '@/stylex/input'
import * as TailwindField from '@/ui/field'
import * as TailwindInput from '@/ui/input'

/**
 * Behavioral parity suite ported from Base UI's field + fieldset suites
 * (base-ui/packages/react/src/field/** and fieldset/**, checked at
 * base-ui HEAD): FieldRoot, FieldControl, FieldLabel, FieldDescription,
 * FieldError, FieldValidity, FieldItem, FieldsetRoot, FieldsetLegend.
 *
 * Base UI's Field.Root is a stateful validation engine (label registration,
 * validate fn, validationMode, debounce, validity snapshots, dirty/touched/
 * filled/focused style hooks, Form integration). creaseui's `controlField`
 * is a pure view: it wires a deterministic label/description/error around a
 * caller-supplied control and exposes the linked ids through `parts`. Only
 * the static contract — associations, ARIA wiring, data attributes, error
 * rendering, fieldset disabling — is portable, so the suite below covers
 * those cases and records divergences with `it.fails`.
 *
 * Skipped groups (no creaseui analogue, or React/DOM-internal):
 *  - describeConformance cases: ref forwarding, element instanceof,
 *    `render=` prop / nativeLabel element substitution (foldkit fixes the
 *    element), dev-mode console warnings.
 *  - Control registration lifecycle: multi-control selection, generated-id
 *    fallback when a control id is removed, label re-association on
 *    unmount/remount, React <Activity> and SSR/hydration cases. creaseui
 *    derives every part id from the field `id` prop — there is no
 *    registration or generated-id path.
 *  - Validation engine: `validate` results and async pending states,
 *    `validationMode` onSubmit/onChange/onBlur flows + revalidation,
 *    `validationDebounceTime`, custom-validity (setCustomValidity)
 *    ownership, `Field.Validity` render data, `Field.Error match=`,
 *    Form errors / onFormSubmit / name fallbacks, actionsRef.validate().
 *  - Dynamic style hooks: data-touched / data-dirty / data-filled /
 *    data-focused / data-valid and the controlled `dirty` / `touched`
 *    props (creaseui emits none of these state attributes).
 *  - `Field.Item` (creaseui has no item part), defaultValue programmatic
 *    DOM-value cases, implicit Enter form submission, render-count and
 *    StrictMode checks, error mount/unmount animations.
 */

type Model = Readonly<{
  id: string
  swapped: boolean
}>

type Message = Readonly<
  | { _tag: 'SetControlId'; id: string }
  | { _tag: 'SwapControl' }
  | { _tag: 'Changed'; value: string }
>

const initialModel: Model = { id: 'name', swapped: false }

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'SetControlId':
      return { model: { ...model, id: message.id } }
    case 'SwapControl':
      return { model: { ...model, swapped: !model.swapped } }
    case 'Changed':
      return { model }
  }
}

type ControlFieldParts = Readonly<{
  controlId: string
  labelId: string
  descriptionId?: string
  errorId?: string
  describedBy?: string
  isInvalid: boolean
  isDisabled: boolean
}>

type FieldError = Readonly<{ message?: string }> | undefined

type FieldModule = Readonly<{
  controlField: <Msg>(
    props: {
      id: string
      label: Html | string
      description?: Html | string
      error?: Html | string
      errors?: ReadonlyArray<FieldError>
      orientation?: 'vertical' | 'horizontal' | 'responsive'
      isInvalid?: boolean
      isDisabled?: boolean
      isRequired?: boolean
      toControl: (parts: ControlFieldParts, h: HtmlBuilder<Msg>) => Html
    },
    h: HtmlBuilder<Msg>,
  ) => Html
  fieldSet: <Msg>(
    props: {
      isDisabled?: boolean
      children: ReadonlyArray<Html | string>
    },
    h: HtmlBuilder<Msg>,
  ) => Html
  fieldLegend: <Msg>(
    props: {
      variant?: 'legend' | 'label'
      children: ReadonlyArray<Html | string>
    },
    h: HtmlBuilder<Msg>,
  ) => Html
  fieldError: <Msg>(
    props: {
      children?: ReadonlyArray<Html | string>
      errors?: ReadonlyArray<FieldError>
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type InputModule = Readonly<{
  input: <Msg>(
    props: {
      id: string
      value: string
      onInput?: (value: string) => Msg
      placeholder?: string
      describedBy?: string
      isInvalid?: boolean
      isDisabled?: boolean
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const fieldRoot = Scene.selector('[data-slot="field"]')
const label = Scene.selector('[data-slot="field-label"]')
const description = Scene.selector('[data-slot="field-description"]')
const errorRegion = Scene.role('alert')
const control = Scene.role('textbox')
const fieldset = Scene.selector('fieldset')
const legend = Scene.selector('[data-slot="field-legend"]')

const verifyRenderer = (
  name: string,
  Field: FieldModule,
  Input: InputModule,
) => {
  const textControl = (parts: ControlFieldParts, h: HtmlBuilder<Message>) =>
    Input.input(
      {
        id: parts.controlId,
        value: '',
        onInput: value => ({ _tag: 'Changed', value }),
        ...(parts.describedBy === undefined
          ? {}
          : { describedBy: parts.describedBy }),
        isInvalid: parts.isInvalid,
        isDisabled: parts.isDisabled,
      },
      h,
    )

  describe(`${name} Field (Base UI port)`, () => {
    describe('Field.Label', () => {
      it('should set htmlFor referencing the control automatically', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                { id: 'name', label: 'Name', toControl: textControl },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(label).toHaveAttr('htmlFor', 'name'),
          Scene.expect(control).toHaveId('name'),
          // The accessible-name path resolves end to end.
          Scene.expect(Scene.label('Name')).toHaveId('name'),
        )
      })

      it('updates label associations when the control id changes', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div(
                [],
                [
                  Field.controlField(
                    { id: model.id, label: 'Name', toControl: textControl },
                    h,
                  ),
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick({ _tag: 'SetControlId', id: 'control-b' }),
                    ],
                    ['Change'],
                  ),
                ],
              ),
          },
          Scene.given(initialModel),
          Scene.expect(label).toHaveAttr('htmlFor', 'name'),
          Scene.click(Scene.role('button', { name: 'Change' })),
          Scene.expectHandled(),
          Scene.expect(label).toHaveAttr('htmlFor', 'control-b'),
          Scene.expect(control).toHaveId('control-b'),
        )
      })

      it('updates label association when replacing one control with another', () => {
        // creaseui has no registration: every control rendered through
        // `toControl` shares the field id, so the label association survives
        // a swap unchanged (Base UI re-points `for` at the new control id).
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div(
                [],
                [
                  Field.controlField(
                    {
                      id: 'name',
                      label: 'Name',
                      toControl: (parts, controlH) =>
                        Input.input(
                          {
                            id: parts.controlId,
                            value: '',
                            placeholder: model.swapped ? 'Second' : 'First',
                          },
                          controlH,
                        ),
                    },
                    h,
                  ),
                  h.button(
                    [h.Type('button'), h.OnClick({ _tag: 'SwapControl' })],
                    ['Swap'],
                  ),
                ],
              ),
          },
          Scene.given(initialModel),
          Scene.expect(control).toHaveAttr('placeholder', 'First'),
          Scene.click(Scene.role('button', { name: 'Swap' })),
          Scene.expectHandled(),
          Scene.expect(control).toHaveAttr('placeholder', 'Second'),
          Scene.expect(label).toHaveAttr('htmlFor', 'name'),
          Scene.expect(control).toHaveId('name'),
        )
      })

      it.todo(
        'suppresses htmlFor when the control is named via aria-labelledby ' +
          '(creaseui field has no group-control naming path)',
      )
    })

    describe('Field.Description', () => {
      it('should set aria-describedby on the control automatically', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  description: 'Shown on your public profile.',
                  toControl: textControl,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(control).toHaveAttr(
            'aria-describedby',
            'name-description',
          ),
          Scene.expect(description).toHaveId('name-description'),
          Scene.expect(control).toHaveAccessibleDescription(
            'Shown on your public profile.',
          ),
        )
      })

      it('should preserve user aria-describedby values on the control', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  description: 'Shown on your public profile.',
                  toControl: (parts, controlH) =>
                    Input.input(
                      {
                        id: parts.controlId,
                        value: '',
                        describedBy:
                          'external-description ' + (parts.describedBy ?? ''),
                      },
                      controlH,
                    ),
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(control).toHaveAttr(
            'aria-describedby',
            'external-description name-description',
          ),
        )
      })
    })

    describe('Field.Error', () => {
      it('should set aria-describedby on the control automatically', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  error: 'Name is taken.',
                  toControl: textControl,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(control).toHaveAttr('aria-describedby', 'name-error'),
          Scene.expect(errorRegion).toHaveId('name-error'),
          Scene.expect(errorRegion).toHaveText('Name is taken.'),
        )
      })

      it('orders the description before the error in aria-describedby', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  description: 'Shown on your public profile.',
                  error: 'Name is taken.',
                  toControl: textControl,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(control).toHaveAttr(
            'aria-describedby',
            'name-description name-error',
          ),
          Scene.expect(control).toHaveAccessibleDescription(
            /Shown on your public profile.*Name is taken/u,
          ),
        )
      })

      it('always renders the error message when content is provided', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.fieldError({ children: ['Something went wrong.'] }, h),
          },
          Scene.given(initialModel),
          Scene.expect(errorRegion).toExist(),
          Scene.expect(errorRegion).toHaveText('Something went wrong.'),
        )
      })

      it('renders error arrays as a list', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.fieldError(
                {
                  errors: [
                    { message: 'Username is reserved' },
                    { message: 'Username is too short' },
                  ],
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(errorRegion).toExist(),
          Scene.expect(Scene.selector('ul')).toExist(),
          Scene.expectAll(Scene.all.selector('li')).toHaveCount(2),
          Scene.expect(Scene.text('Username is reserved')).toExist(),
          Scene.expect(Scene.text('Username is too short')).toExist(),
        )
      })

      it('renders single-item error arrays as text', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.fieldError(
                { errors: [{ message: 'Username is reserved' }] },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(errorRegion).toExist(),
          Scene.expect(errorRegion).toHaveText('Username is reserved'),
          Scene.expect(Scene.selector('ul')).not.toExist(),
        )
      })

      it('renders nothing for an empty errors array', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              h.div([], [Field.fieldError({ errors: [] }, h)]),
          },
          Scene.given(initialModel),
          Scene.expect(errorRegion).toBeAbsent(),
        )
      })

      it('omits the error region when the field is valid', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  description: 'Shown on your public profile.',
                  toControl: textControl,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(errorRegion).toBeAbsent(),
          Scene.expect(Scene.selector('#name-error')).toBeAbsent(),
          Scene.expect(control).toHaveAttr(
            'aria-describedby',
            'name-description',
          ),
        )
      })

      it.todo(
        'shows errors through validation and `match` constraints ' +
          '(creaseui has no Form integration or match prop)',
      )
    })

    describe('prop: disabled', () => {
      it('marks the root and control data-disabled and removes input handling', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  toControl: textControl,
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(fieldRoot).toHaveAttr('data-disabled', ''),
          Scene.expect(control).toBeDisabled(),
          Scene.expect(control).toHaveAttr('data-disabled', ''),
          Scene.expect(control).not.toHaveHandler('input'),
          Scene.expect(label).toHaveAttr('htmlFor', 'name'),
        )
      })

      // DIVERGENCE: Base UI mirrors data-disabled onto every field part
      // (root, control, label, description). creaseui marks only the field
      // root and the control — label and description carry no data-disabled
      // (Tailwind styles them through group-data-[disabled] instead).
      it.fails('should add data-disabled style hook to all components', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  description: 'Shown on your public profile.',
                  toControl: textControl,
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(fieldRoot).toHaveAttr('data-disabled', ''),
          Scene.expect(control).toHaveAttr('data-disabled', ''),
          Scene.expect(label).toHaveAttr('data-disabled', ''),
          Scene.expect(description).toHaveAttr('data-disabled', ''),
        )
      })

      // DIVERGENCE: Base UI mirrors data-invalid onto every part and keeps
      // aria-invalid off a disabled control (it does not participate in
      // constraint validation). creaseui never marks label/description and
      // the input primitive always emits aria-invalid when isInvalid is set,
      // regardless of disabled.
      it.fails('keeps an explicitly invalid field marked invalid while disabled', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  description: 'Shown on your public profile.',
                  toControl: textControl,
                  isDisabled: true,
                  isInvalid: true,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(fieldRoot).toHaveAttr('data-invalid'),
          Scene.expect(control).toHaveAttr('data-invalid'),
          Scene.expect(label).toHaveAttr('data-invalid'),
          Scene.expect(description).toHaveAttr('data-invalid'),
          Scene.expect(control).not.toHaveAttr('aria-invalid'),
        )
      })

      it('keeps a disabled field with errors marked invalid', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  errors: [{ message: 'Server error' }],
                  toControl: textControl,
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(fieldRoot).toHaveAttr('data-invalid', 'true'),
          Scene.expect(control).toHaveAttr('data-invalid', ''),
          Scene.expect(errorRegion).toHaveText('Server error'),
        )
      })
    })

    describe('prop: invalid', () => {
      it('marks the root and control invalid when isInvalid is set', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                {
                  id: 'name',
                  label: 'Name',
                  toControl: textControl,
                  isInvalid: true,
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(fieldRoot).toHaveAttr('data-invalid', 'true'),
          Scene.expect(control).toHaveAttr('data-invalid', ''),
          Scene.expect(control).toHaveAttr('aria-invalid', 'true'),
        )
      })

      // DIVERGENCE: Base UI only emits data-invalid while the field is
      // invalid; creaseui always emits it as a valued attribute
      // (data-invalid="false"), so presence-based selectors would match a
      // valid field.
      it.fails('omits data-invalid when the field is valid', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.controlField(
                { id: 'name', label: 'Name', toControl: textControl },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(fieldRoot).not.toHaveAttr('data-invalid'),
        )
      })
    })

    describe('Fieldset.Root', () => {
      it('sets the native disabled attribute', () => {
        // Descendant controls are disabled through native fieldset DOM
        // semantics; the vnode-level assertion covers the fieldset itself.
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.fieldSet({ isDisabled: true, children: [''] }, h),
          },
          Scene.given(initialModel),
          Scene.expect(fieldset).toBeDisabled(),
          Scene.expect(fieldset).toHaveAttr('data-slot', 'field-set'),
        )
      })

      // DIVERGENCE: Base UI propagates fieldset disabled through context so
      // nested Field parts and custom controls receive data-disabled plus a
      // real disabled attribute. creaseui's fieldSet emits only the native
      // attribute — descendants keep their own isDisabled=false and get no
      // disabled/data-disabled hooks (native DOM inheritance still covers
      // plain inputs in a real browser, which the DSL cannot observe).
      it.fails('keeps nested fieldsets disabled when an ancestor fieldset is disabled', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.fieldSet(
                {
                  isDisabled: true,
                  children: [
                    Field.fieldSet(
                      {
                        children: [
                          Field.controlField(
                            {
                              id: 'name',
                              label: 'Name',
                              toControl: textControl,
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(control).toBeDisabled(),
          Scene.expect(fieldRoot).toHaveAttr('data-disabled', ''),
        )
      })

      it.todo(
        'updates nested disabled precedence in both directions ' +
          '(same absent propagation mechanism as the case above)',
      )
    })

    describe('Fieldset.Legend', () => {
      // DIVERGENCE: Base UI registers the legend and points the fieldset's
      // aria-labelledby at it. creaseui's fieldLegend carries no id and the
      // fieldSet wires no association, so the group ends up unnamed.
      it.fails('should set aria-labelledby on the fieldset automatically', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Field.fieldSet(
                {
                  children: [Field.fieldLegend({ children: ['Legend'] }, h)],
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(fieldset).toHaveAttr('aria-labelledby'),
          Scene.expect(fieldset).toHaveAccessibleName('Legend'),
        )
      })

      it.todo(
        'should set aria-labelledby on the fieldset with custom id ' +
          '(creaseui fieldLegend has no id prop)',
      )

      it.todo(
        'updates and clears the legend association ' +
          '(creaseui has no legend registration to update)',
      )

      // DIVERGENCE (intentional): Base UI throws when a legend renders
      // outside Fieldset.Root. creaseui parts are plain view functions with
      // no context requirement, so a standalone legend renders fine.
      it('renders a standalone legend without a fieldset context', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) => Field.fieldLegend({ children: ['Legend'] }, h),
          },
          Scene.given(initialModel),
          Scene.expect(legend).toExist(),
          Scene.expect(legend).toHaveText('Legend'),
        )
      })
    })

    describe('validation engine (absent)', () => {
      it.todo(
        'validates the field on change / blur / submit ' +
          '(creaseui field has no validate prop or validation engine)',
      )
      it.todo(
        'publishes neutral validity while an async validator is in flight ' +
          '(creaseui field has no validity state)',
      )
      it.todo(
        'validateDebounceTime debounces validation ' +
          '(no timers or validation in creaseui field)',
      )
      it.todo(
        'keeps a message set outside the field via setCustomValidity ' +
          '(creaseui has no native validity bridge)',
      )
      it.todo(
        'Field.Validity exposes validity snapshots ' +
          '(creaseui has no validity render-prop API)',
      )
      it.todo(
        'Form errors, Field.Error match, and name fallbacks ' +
          '(creaseui has no Form integration)',
      )
      it.todo(
        'data-touched / data-dirty / data-filled / data-focused style ' +
          'hooks (creaseui emits no dynamic field state attributes)',
      )
      it.todo(
        'Field.Item disables wrapped controls ' +
          '(creaseui has no field item part)',
      )
      it.todo(
        'actionsRef.validate() triggers validation ' +
          '(foldkit exposes messages and commands, not imperative handles)',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindField, TailwindInput)
verifyRenderer('StyleX', StyleXField, StyleXInput)
