// @ts-nocheck: snapshot of creaseui-demo chapter-08:src/design/issue-composer.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Issue } from '../domain'
import { type PickerContext, propertyPicker } from './property-picker'
import { button } from '../ui/button'
import * as Dialog from '../ui/dialog'
import { fieldError } from '../ui/field'
import { input } from '../ui/input'
import { kbd, kbdGroup } from '../ui/kbd'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

/**
 * IssueComposer: the one place where issues are created.
 *
 * Rules (decision D8):
 * - Creating an issue always goes through this dialog. Nothing else adds an
 *   issue to the list.
 * - The draft belongs to the page, not to the dialog. Closing the composer
 *   (Escape, the close button, Cancel) keeps the draft; creating clears it.
 * - The title is required. Its error appears next to the field after the
 *   first attempt to create, and focus goes back to the title.
 * - Status, priority and assignee use PropertyPicker, the same control as
 *   in the rows. A new issue starts as Todo, with no priority and nobody
 *   assigned.
 * - One primary action: Create issue. Ctrl/Cmd+Enter does the same from
 *   any field.
 *
 * A quick property change commits on selection, with no draft. The composer
 * collects several fields, so it has a draft and an explicit commit.
 */

export const COMPOSER_ID = 'composer'
export const TITLE_ID = 'composer-title'
export const DRAFT_ID = 'DRAFT'

export const emptyDraft: Issue = {
  id: DRAFT_ID,
  teamId: 'eng',
  title: '',
  description: '',
  status: 'todo',
  priority: 'none',
  assigneeId: null,
  labels: [],
  updated: '',
}

export const initComposer = (): Dialog.Model =>
  Dialog.init({ id: COMPOSER_ID, focusSelector: `#${TITLE_ID}` })

/** The title a draft may be created with, or the reason it may not. */
export const validateTitle = (
  title: string,
): Readonly<{ ok: true; title: string } | { ok: false; error: string }> => {
  const trimmed = title.trim()
  if (trimmed === '') return { ok: false, error: 'Give the issue a title.' }
  if (trimmed.length > 200)
    return {
      ok: false,
      error: `Keep the title under 200 characters (it has ${trimmed.length}).`,
    }
  return { ok: true, title: trimmed }
}

export const issueComposer = <Msg>(
  props: Readonly<{
    dialog: Dialog.Model
    toDialogMessage: (message: Dialog.Message) => Msg
    draft: Issue
    titleError: string | null
    onTitle: (title: string) => Msg
    onCreate: Msg
    onCancel: Msg
    pickers: PickerContext<Msg>
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  Dialog.dialog(
    {
      model: props.dialog,
      toParentMessage: props.toDialogMessage,
      title: 'New issue',
      content: () => [
        stack(
          {
            gap: 4,
            children: [
              stack(
                {
                  gap: 1.5,
                  children: [
                    input(
                      {
                        id: TITLE_ID,
                        value: props.draft.title,
                        label: 'Title',
                        placeholder: 'What needs to happen?',
                        onInput: props.onTitle,
                        isRequired: true,
                        isInvalid: props.titleError !== null,
                        ...(props.titleError === null
                          ? {}
                          : { describedBy: `${TITLE_ID}-error` }),
                      },
                      h,
                    ),
                    ...(props.titleError === null
                      ? []
                      : [fieldError({ children: [props.titleError] }, h)]),
                  ],
                },
                h,
              ),
              stack(
                {
                  direction: 'horizontal',
                  align: 'center',
                  gap: 3,
                  children: [
                    text(
                      { size: 'xsm', color: 'secondary', children: ['Status'] },
                      h,
                    ),
                    propertyPicker(
                      {
                        issue: props.draft,
                        field: 'status',
                        context: props.pickers,
                      },
                      h,
                    ),
                    text(
                      {
                        size: 'xsm',
                        color: 'secondary',
                        children: ['Priority'],
                      },
                      h,
                    ),
                    propertyPicker(
                      {
                        issue: props.draft,
                        field: 'priority',
                        context: props.pickers,
                      },
                      h,
                    ),
                    text(
                      {
                        size: 'xsm',
                        color: 'secondary',
                        children: ['Assignee'],
                      },
                      h,
                    ),
                    propertyPicker(
                      {
                        issue: props.draft,
                        field: 'assignee',
                        context: props.pickers,
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
      ],
      footer: () => [
        stack(
          {
            direction: 'horizontal',
            align: 'center',
            gap: 1,
            children: [
              kbdGroup(
                {
                  children: [
                    kbd({ children: ['Ctrl'] }, h),
                    kbd({ children: ['Enter'] }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        button({ onClick: props.onCancel, children: ['Cancel'] }, h),
        button(
          {
            intent: 'primary',
            onClick: props.onCreate,
            children: ['Create issue'],
          },
          h,
        ),
      ],
    },
    h,
  )
