# Contributing a fix to Effect UI

Use the Effect UI issue tracker and a focused branch in a fork of
`Effect-TS/ui`. The project's README describes its development commands.
Effect UI also inherits Effect-TS's contribution guide, code of conduct, and
PR template. [Effect UI development](https://github.com/Effect-TS/ui#development) ·
[Effect-TS contribution guide](https://github.com/Effect-TS/.github/blob/main/CONTRIBUTING.md) ·
[PR template](https://github.com/Effect-TS/.github/blob/main/.github/PULL_REQUEST_TEMPLATE.md)

## Report the behavior

1. Search open and closed issues and PRs for the error text, API names, and
   symptom. Add a new repro or version result to an existing matching thread.
2. Reproduce on CreaseUI's pin and a recent upstream `main` snapshot. Use the
   smallest example that still fails and include a passing comparison when
   it helps locate the problem. Record exact package snapshots, the runtime
   or browser, the commands, and the expected and observed results.
3. Open one issue for each independently reproducible bug. Paste the repro
   or link to source that maintainers can access. Mention the downstream
   impact in one sentence and say if you intend to send a fix. For an API
   decision, ask for direction in the issue before investing in a large patch.
   [GitHub issue guidance](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue) ·
   [Open Source Guides](https://opensource.guide/how-to-contribute/#how-to-submit-a-contribution)

The headless-part issue is ready for this workflow. It reproduces with
`@effect/ui` alone, so report the `.forward()` event-routing behavior and
mention how it affects the kit's Button. Ask whether forwarded handlers should
inherit the part's owner. [Issue draft and passing comparison](UPSTREAM.md)

## Send the fix

1. Verify the credential used for GitHub operations with `GET /user`. It
   must identify `Potti1234`. Check `git var GIT_AUTHOR_IDENT` and
   `git var GIT_COMMITTER_IDENT` before committing for GitHub. Both emails
   must be `lukas.pottner@gmail.com`.
2. Start a focused branch in the Effect UI fork from upstream `main`. Reuse
   the upstream tests and add a regression that fails before the fix. For
   the headless-part bug, use an `HtmlPlay` test that asserts the child
   updates and the parent stays mounted. Keep the patch and test in the same
   PR. [Creating a PR from a fork](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork) ·
   [Upstream HtmlPlay tests](https://github.com/Effect-TS/ui/blob/main/packages/ui/test/html/HtmlPlay.test.ts)
3. Install with the checkout's `packageManager` version. On the checked
   snapshot it is `pnpm@11.20.0`, while the shared guide still mentions
   pnpm 8. Run the focused regression, `pnpm check`, and `pnpm lint`. Run
   `pnpm test --run` for the suite and add a changeset with `pnpm changeset`
   for a published package change, as the Effect UI README requests.
   [Effect UI package configuration](https://github.com/Effect-TS/ui/blob/7ef62340bef8776d7d3f0d0668d64525ea8d434f/package.json) ·
   [Development and changesets](https://github.com/Effect-TS/ui#development)
4. Open the PR against `Effect-TS/ui:main`. Fill the template with the change
   type, summary, and test results. Put `Fixes #123` in the PR body if merging
   it should close issue 123. Use a plain issue link for related work or for
   the downstream CreaseUI commit that adopts the fix. [Linking issues and PRs](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
5. Leave **Allow edits by maintainers** enabled as Effect-TS requests. The
   guide says agents help triage and may amend or rebase PRs, while maintainers
   approve merges and closures. The template notes that a team member must
   review fork PRs before CI runs. Keep follow-up evidence in the existing
   thread and give maintainers time to review. [Effect-TS review workflow](https://github.com/Effect-TS/.github/blob/main/CONTRIBUTING.md#ai-assisted-triage-and-review) ·
   [PR template](https://github.com/Effect-TS/.github/blob/main/.github/PULL_REQUEST_TEMPLATE.md)

Keep the upstream repro and issue or PR links in the CreaseUI findings log.
When a fixed snapshot lands, update the snapshot pin in its own CreaseUI commit
and rerun the failing repro and the consumer checks before removing the local
workaround.
