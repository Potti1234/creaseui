# Component parity

The current showcase contains 49 UI modules. Coverage is broad, but a matching
name does not promise byte-for-byte or API-level compatibility with the React
implementation. Parity means comparable appearance and user-facing behavior in
an idiomatic Foldkit API.

## Current modules

Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button,
Button Group, Calendar, Card, Chart, Checkbox, Collapsible, Combobox, Command,
Date Picker, Dialog, Drawer, Dropdown Menu, Empty, Field, Hover Card, Input,
Input Group, Item, Kbd, Label, Native Select, Pagination, Popover, Progress,
Radio Group, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider,
Sonner, Spinner, Switch, Table, Tabs, Textarea, Toggle, Toggle Group, and Tooltip.

The demo application additionally includes 33 create-board cards, 72 ECharts
examples, and 16 sidebar blocks. Those examples exercise combinations of the
modules above; they are not additional primitives.

## Not yet represented as standalone ports

- Attachment
- Bubble
- Carousel
- Context Menu
- Direction
- Form
- Input OTP
- Marker
- Menubar
- Message and Message Scroller
- Navigation Menu
- Resizable

Some of these require new behavior rather than styling alone. Carousel and
Resizable need dedicated interaction engines; Input OTP needs a focused input
model; Context Menu, Menubar, and Navigation Menu require positioning and
keyboard interaction work. Form should integrate with Foldkit's validation model
instead of reproducing React Hook Form.

## Intentional differences

- Stateful controls expose Foldkit models and messages instead of React hooks,
  context, or uncontrolled component state.
- Charts use Apache ECharts because shadcn/ui's Recharts implementation is tied
  to React.
- Icons are rendered from Lucide assets through Foldkit HTML rather than React
  icon components.
- Radix composition APIs such as `asChild` are replaced with explicit Foldkit
  view composition.
- DOM-wide interactions are modeled as subscriptions where Foldkit requires it.

Accessibility behavior should come from Foldkit UI's primitives wherever one is
available. Visual resemblance alone is not sufficient for declaring a component
complete; keyboard behavior, focus management, labels, and relevant ARIA state
must also be verified.

The actionable, machine-readable backlog lives in
[`component-roadmap.json`](component-roadmap.json). A component documentation
page is only marked complete after its live examples pass browser interaction,
typechecking, production build, and registry validation.
