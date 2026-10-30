import { Dialog as DialogPrimitive } from '@foldkit/ui'
import { Story } from 'foldkit'
import { describe, expect, test } from 'vitest'

import { SEED } from '../src/domain'
import { validateTitle } from '../src/design/issue-composer'
import { ApplyTheme, FocusTitle, Message, type Model, init, update } from '../src/model'
import { SaveIssues, SaveMessage } from '../src/storage'
import * as DropdownMenu from '../src/ui/dropdown-menu'

/* Stories of update: Messages in, Model and Commands out. Every Command a
   step produces must be resolved, so a missing save fails the test. */

const start: Model = init({ issues: SEED, nextNumber: 143, isDark: false, notice: null }).model

const choose = (key: string, item: string, index: number) => [
  Story.message(Message.GotPickerMessage({ key, message: DropdownMenu.Message.Opened() })),
  Story.message(
    Message.GotPickerMessage({ key, message: DropdownMenu.Message.SelectedItem({ item, index, staysOpenOnSelect: false }) }),
  ),
]

const focusReturned = Story.Command.resolve(
  DropdownMenu.FocusTrigger,
  DropdownMenu.Message.CompletedFocusDropdownMenuTrigger(),
)

const openComposer = [
  Story.message(Message.ClickedNewIssue()),
  Story.Command.resolve(DialogPrimitive.ShowDialog, DialogPrimitive.Message.SucceededShowDialog()),
]

const issue = (model: Model, id: string) => model.issues.find(each => each.id === id)

describe('changing a property in place', () => {
  test('commits at once and saves', () =>
    Story.story(
      update,
      Story.given(start),
      ...choose('CRE-131--status', 'in_progress', 2),
      Story.model(model => expect(issue(model, 'CRE-131')?.status).toBe('in_progress')),
      focusReturned,
      Story.Command.expectHas(SaveIssues),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.save).toBe('saved')),
    ))

  test('a failed save keeps the change and offers Retry, which saves again', () =>
    Story.story(
      update,
      Story.given(start),
      ...choose('CRE-131--priority', 'urgent', 0),
      focusReturned,
      Story.Command.resolve(SaveIssues, SaveMessage.FailedSave({ reason: 'QuotaExceededError' })),
      Story.model(model => {
        expect(model.save).toBe('failed')
        expect(issue(model, 'CRE-131')?.priority).toBe('urgent')
      }),
      Story.message(Message.RetriedSave()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.save).toBe('saved')),
    ))
})

describe('creating an issue', () => {
  test('an empty title shows an error and focuses the title; nothing is created', () =>
    Story.story(
      update,
      Story.given(start),
      ...openComposer,
      Story.message(Message.SubmittedComposer()),
      Story.Command.resolve(FocusTitle, Message.CompletedFocusTitle()),
      Story.model(model => {
        expect(model.titleError).toBe('Give the issue a title.')
        expect(model.issues).toHaveLength(SEED.length)
      }),
    ))

  test('closing the composer keeps the draft (D8)', () =>
    Story.story(
      update,
      Story.given(start),
      ...openComposer,
      Story.message(Message.ChangedDraftTitle({ title: 'Half-written idea' })),
      Story.message(Message.CancelledComposer()),
      Story.Command.resolve(DialogPrimitive.CloseDialog, DialogPrimitive.Message.CompletedCloseDialog()),
      Story.model(model => {
        expect(model.composer.isOpen).toBe(false)
        expect(model.draft.title).toBe('Half-written idea')
      }),
    ))

  test('a valid draft becomes the next issue, the draft clears and the issues are saved', () =>
    Story.story(
      update,
      Story.given(start),
      ...openComposer,
      Story.message(Message.ChangedDraftTitle({ title: '  Show a toast after creating an issue  ' })),
      Story.message(Message.SubmittedComposer()),
      Story.Command.resolve(DialogPrimitive.CloseDialog, DialogPrimitive.Message.CompletedCloseDialog()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => {
        expect(model.issues[0]).toMatchObject({ id: 'CRE-143', title: 'Show a toast after creating an issue', status: 'todo' })
        expect(model.nextNumber).toBe(144)
        expect(model.draft.title).toBe('')
      }),
    ))
})

describe('a team page', () => {
  test('a new issue created there belongs to that team', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.SelectedView({ view: 'team:des' })),
      ...openComposer,
      Story.message(Message.ChangedDraftTitle({ title: 'Darker hover on board cards' })),
      Story.message(Message.SubmittedComposer()),
      Story.Command.resolve(DialogPrimitive.CloseDialog, DialogPrimitive.Message.CompletedCloseDialog()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.issues[0]).toMatchObject({ id: 'CRE-143', teamId: 'des' })),
    ))
})

describe('the issue page', () => {
  test('an empty title is not saved; the issue keeps its last valid title', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.OpenedIssue({ id: 'CRE-142' })),
      Story.message(Message.ChangedIssueTitle({ title: '   ' })),
      Story.Command.expectNone(),
      Story.model(model => {
        expect(model.issueTitleError).toBe('Give the issue a title.')
        expect(issue(model, 'CRE-142')?.title).toBe('Keyboard focus is lost after changing an issue status')
      }),
    ))

  test('a valid title and a description are saved as they are typed', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.OpenedIssue({ id: 'CRE-142' })),
      Story.message(Message.ChangedIssueTitle({ title: 'Focus returns to the status glyph' })),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.message(Message.ChangedIssueDescription({ description: 'Seen in Firefox too.' })),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => {
        expect(model.issueTitleError).toBeNull()
        expect(issue(model, 'CRE-142')).toMatchObject({ title: 'Focus returns to the status glyph', description: 'Seen in Firefox too.' })
      }),
    ))

  test('choosing a list closes the issue page', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.OpenedIssue({ id: 'CRE-142' })),
      Story.message(Message.SelectedView({ view: 'mine' })),
      Story.model(model => expect(model.openIssueId).toBeNull()),
    ))
})

describe('shortcuts and the theme', () => {
  test('C opens the composer, and does nothing while a dialog is open', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.PressedNewIssueKey()),
      Story.Command.resolve(DialogPrimitive.ShowDialog, DialogPrimitive.Message.SucceededShowDialog()),
      Story.model(model => expect(model.composer.isOpen).toBe(true)),
      Story.message(Message.PressedNewIssueKey()),
      Story.Command.expectNone(),
    ))

  test('switching the theme applies it and saves the choice', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.ToggledTheme()),
      Story.Command.resolve(ApplyTheme, Message.AppliedTheme()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.isDark).toBe(true)),
    ))
})

describe('validateTitle', () => {
  test.each([
    ['', false],
    ['   ', false],
    ['A', true],
    ['x'.repeat(200), true],
    ['x'.repeat(201), false],
  ])('%j is valid: %s', (title, valid) => expect(validateTitle(title).ok).toBe(valid))
})
