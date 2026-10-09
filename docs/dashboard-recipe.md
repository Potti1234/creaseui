# Dashboard recipe

This checkout's `dashboard-01` registry block installs a complete, source-owned **Foldkit +
CreaseUI + Tailwind** application. It has three routes: analytics (`/`), a users
directory (`/users`), and settings (`/settings`). No React or JSX.

Build and install it from this local checkout:

```sh
npm run registry:generate
npm run registry:install-local -- C:/path/to/consumer dashboard-01
```

After this registry revision is published, the public install command is
`npx shadcn@latest add Potti1234/creaseui/dashboard-01`.

Use a Foldkit + Vite + Tailwind consumer with the matching framework versions
from CreaseUI's package.json. The installer copies files into
`src/components/crease-dashboard/`, plus the component and behavior dependencies.
Import the installed entry from your app entry, after your Tailwind stylesheet:

```ts
import './styles.css'
import '@/components/crease-dashboard/entry'
```

The HTML must contain `<div id="root"></div>`. The recipe starts its own Foldkit
runtime; import it once as the application's entry. Vite's SPA fallback supports
the three routes locally; configure the same fallback when hosting.

| Source                      | What to adapt                                                               |
| --------------------------- | --------------------------------------------------------------------------- |
| `data.ts`                   | User/settings schemas, 24 demo users, metric data and default settings      |
| `main.ts`                   | Root model, validation, mapped child commands, navigation, CSV, persistence |
| `view.ts`                   | Sidebar/header, cards/charts, table/dialog and settings forms               |
| `charts.ts`                 | Three ECharts builders, theme synchronization, range options                |
| `entry.ts`                  | Runtime mount, schema-validated storage loading and theme flags             |
| `icons.ts`, `dashboard.css` | Application icon aliases and optional polish                                |

The responsive sidebar includes icon collapse, mobile dismissal, and
Ctrl/Cmd+B. Breadcrumbs follow the route. Charts include accessible text/data
alternatives and 7/30/90-day ranges. The users directory includes summary cards,
search, status filtering, sorting, selection, column visibility, paging,
filtered CSV, and create/edit dialogs. Dialog submission validates required
fields and duplicate email addresses. Settings include save/discard, workspace
validation, keyboard tabs, and notification switches.

Persistence is explicit: Commands write users/settings to `forma-demo` in
localStorage, theme to `forma-theme`, and sidebar preference to a cookie.
Startup decodes stored data through Effect Schema and restores demo defaults
if data is invalid. Storage failures preserve in-memory state for the session.
The sample has no backend; invitations do not send mail. Analytics are demo USD
data; the saved currency field is a preference for a future backend.

## Composition examples

Keep application filters in the existing table toolbar. The application owns
the extra filter and resets pagination when it changes:

```ts
DataTable.dataTable({
  model: model.table,
  toParentMessage: message => Message.GotTable({ message }),
  rows: filteredUsers(model),
  columns,
  rowKey: user => user.id,
  filterText: user => `${user.name} ${user.email}`,
  enableColumnVisibility: true,
  toolbarContent: [statusSelect],
}, h)
```

For a Switch label outside the component, use its exported IDs. A description
is explicitly linked using `describedBy`; arbitrary external IDs can use
`labelledBy`. A switch with no visible label can use `ariaLabel`.

```ts
const ids = Switch.switchIds('weekly')
Field.field({ children: [
  Field.fieldLabel({ id: ids.labelId, for: ids.controlId, children: ['Weekly digest'] }, h),
  Field.fieldDescription({ id: ids.descriptionId, children: ['A weekly activity summary.'] }, h),
  Switch.switchControl({
    id: 'weekly',
    isChecked: model.weekly,
    onToggle: value => Message.ToggledWeekly({ value }),
    describedBy: ids.descriptionId,
  }, h),
] }, h)
```

Chart helpers return a single axis of the right kind. Numeric label formatters
can be passed without casts:

```ts
valueAxis(theme, {
  showLabels: true,
  axisLabel: { formatter: value => `$${value / 1000}k` },
})
```

See [supported icons](icon-inventory.md) before choosing names for generated
interfaces. `hasIcon(name)` and `iconNames` expose the installed inventory.
