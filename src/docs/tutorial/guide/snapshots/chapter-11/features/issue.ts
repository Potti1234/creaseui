// @ts-nocheck: snapshot of creaseui-demo chapter-11:src/features/issue.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Issue } from '../domain'
import { issueDetail } from '../design/issue-detail'
import { type Message, Message as M, type Model, pickersOf } from '../model'

/* One issue on its own page, opened from any list. */

export const issuePage = (
  model: Model,
  issue: Issue,
  backLabel: string,
  h: HtmlBuilder<Message>,
): Html =>
  issueDetail(
    {
      issue,
      title: model.issueTitle,
      titleError: model.issueTitleError,
      backLabel,
      onBack: M.ClosedIssue(),
      onTitle: title => M.ChangedIssueTitle({ title }),
      onDescription: description => M.ChangedIssueDescription({ description }),
      pickers: pickersOf(model),
    },
    h,
  )
