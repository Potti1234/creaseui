# Principles and decisions

A principle says what we want. A decision says what a builder does about it, and it names the place in the code that enforces it. When a decision has no enforcing place yet, the last column says which chapter adds one.

## 1. The issue is the loudest thing on the screen

Navigation, toolbars and metadata stay quiet so a person scanning the list reads titles first.

| Decision                                                                                                                           | Enforced by                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| D1. An issue row has one height (36px) and never wraps. A long title is cut with an ellipsis; metadata keeps its place at the end. | The row component's variant (chapter 5)                                 |
| D2. Metadata in a row (identifier, labels, date, assignee) uses the small secondary text style.                                    | The row component (chapter 5), later the `IssueRow` pattern (chapter 7) |
| D3. Every view shows an issue with the same row: same parts, same order.                                                           | The `IssueRow` pattern (chapter 7)                                      |

## 2. Actions are few and predictable

| Decision                                                                                                                                        | Enforced by                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| D4. A regular button has two intents: `primary` for the one main action of a region, `secondary` for everything else. It has one height (28px). | Button's own API (chapter 5)        |
| D5. An icon-only button always has an accessible name.                                                                                          | Button's types (chapter 5)          |
| D6. The main action of a page sits in the header's action area.                                                                                 | The page header pattern (chapter 7) |

## 3. Small changes happen in place

| Decision                                                                                                                                      | Enforced by                              |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| D7. Status, priority and assignee change through a picker opened from the row, without leaving the list. Focus returns to the row afterwards. | The `PropertyPicker` pattern (chapter 7) |
| D8. Creating an issue opens the composer, the only way to create one. The draft survives closing it.                                          | The composer (chapter 8)                 |

## 4. The keyboard reaches everything, the pointer too

| Decision                                                                      | Enforced by                           |
| ----------------------------------------------------------------------------- | ------------------------------------- |
| D9. Every action has a pointer route. Keys are shortcuts, never the only way. | Review and browser checks (chapter 9) |

## 5. One vocabulary

| Decision                                                                                                                                               | Enforced by                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| D10. Priorities are Urgent, High, Medium, Low and No priority, in that order, everywhere. Statuses are Backlog, Todo, In Progress, In Review and Done. | The domain schemas in `src/domain.ts` |

## How these change

A decision changes in a commit that also changes its enforcing code, with the reason in the commit message. A view that needs something these decisions forbid is a design-system question first: either the decision gains a case, or the view changes.
