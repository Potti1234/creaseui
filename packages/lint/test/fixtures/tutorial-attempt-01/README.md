# Negative fixture: tutorial attempt 01

Copied unchanged from `archive/tutorial-attempt-01`
(`f723c380ca66da05acca50727b0f210949840342`, `references/tutorial-attempt-01.zip`).
It is a counterexample, not a starter: its ESLint config ignores every
registered design-system implementation and installed component, so only
feature code is linted. `doctor` must report it as feature-only coverage
(exit 2), never as complete enforcement.
