import type { ApiEntry } from './generated-component-api'
export const COMPONENTS = [
  'Accordion',
  'Alert',
  'Alert Dialog',
  'App Shell',
  'Aspect Ratio',
  'Attachment',
  'Avatar',
  'Avatar Group',
  'Badge',
  'Banner',
  'Blockquote',
  'Bottom Sheet',
  'Breadcrumb',
  'Button',
  'Button Group',
  'Bubble',
  'Calendar',
  'Carousel',
  'Card',
  'Chart',
  'Chat Reasoning',
  'Checkbox',
  'Center',
  'Checkbox List',
  'Circular Progress',
  'Clickable Card',
  'Code',
  'Code Block',
  'Collapsible',
  'Combobox',
  'Command',
  'Context Menu',
  'Data Table',
  'Date Input',
  'Date Picker',
  'Date Range Input',
  'Date Time Input',
  'Dialog',
  'Direction',
  'Dropdown Menu',
  'Drawer',
  'Empty',
  'Field',
  'Field Status',
  'File Input',
  'Form',
  'Grid',
  'Heading',
  'Hover Card',
  'Indicator',
  'Info Tip',
  'Input',
  'Input Group',
  'Input OTP',
  'Item',
  'Kbd',
  'Label',
  'Lightbox',
  'Link',
  'List',
  'List Input',
  'Log Stream',
  'Markdown',
  'Marker',
  'Message',
  'Message Scroller',
  'Menubar',
  'Metadata List',
  'Mobile Nav',
  'More Menu',
  'Multi Selector',
  'Native Select',
  'Navigation Menu',
  'Number Input',
  'Overflow List',
  'Pagination',
  'Popover',
  'Power Search',
  'Progress',
  'Radio Group',
  'Resizable',
  'Scroll Area',
  'Section',
  'Segmented Control',
  'Select',
  'Selectable Card',
  'Separator',
  'Sheet',
  'Side Nav',
  'Sidebar',
  'Skeleton',
  'Slider',
  'Sonner',
  'Spinner',
  'Stack',
  'Stat',
  'Status Dot',
  'Stepper',
  'Switch',
  'Table',
  'Tabs',
  'Text',
  'Textarea',
  'Thumbnail',
  'Time Input',
  'Timer',
  'Timestamp',
  'Toast',
  'Toggle',
  'Toggle Group',
  'Token',
  'Tokenizer',
  'Toolbar',
  'Tooltip',
  'Top Nav',
  'Tour',
  'Transfer List',
  'Tree List',
  'Typography',
  'Visually Hidden',
] as const

export const toSlug = (name: string): string =>
  name.toLowerCase().replaceAll(' ', '-')

export const componentTitle = (slug: string): string | undefined =>
  COMPONENTS.find(name => toSlug(name) === slug)
export const apiPurpose = (entry: ApiEntry): string => {
  switch (entry.name) {
    case 'Model':
      return 'State owned by the component and stored in the parent model.'
    case 'Message':
      return 'Child events delegated through the parent update loop.'
    case 'OutMessage':
      return 'Typed events emitted for the parent domain to interpret.'
    case 'init':
      return 'Creates the initial component model.'
    case 'update':
      return 'Applies a child message and returns state, commands, and optional output.'
    case 'view':
      return 'Submodel view embedded with h.submodel.'
    default:
      return entry.kind === 'function'
        ? 'Public operation or render helper.'
        : entry.kind === 'type'
          ? 'Public configuration or data contract.'
          : 'Public schema, message constructor, or compatibility export.'
  }
}
