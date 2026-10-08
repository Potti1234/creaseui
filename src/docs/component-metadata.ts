import type { ApiEntry } from './generated-component-api'
export const COMPONENTS = [
  'Accordion',
  'Alert',
  'Alert Dialog',
  'Aspect Ratio',
  'Attachment',
  'Avatar',
  'Avatar Group',
  'Badge',
  'Banner',
  'Blockquote',
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
  'Circular Progress',
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
  'Map',
  'Map Controls',
  'Map Marker',
  'Map Popup',
  'Map Route',
  'Map Arc',
  'Map GeoJSON',
  'Map Cluster',
  'Map Styles',
  'Map Localization',
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
  'Progress',
  'Radio Group',
  'Resizable',
  'Scroll Area',
  'Section',
  'Select',
  'Selectable Card',
  'Separator',
  'Sheet',
  'Sidebar',
  'Skeleton',
  'Slider',
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

export const MAP_COMPONENTS = [
  'Map',
  'Map Controls',
  'Map Marker',
  'Map Popup',
  'Map Route',
  'Map Arc',
  'Map GeoJSON',
  'Map Cluster',
  'Map Styles',
  'Map Localization',
] as const

export const COMPONENT_GROUPS = [
  {
    label: 'Components',
    components: COMPONENTS.filter(name => !name.startsWith('Map')),
  },
  { label: 'Maps', components: MAP_COMPONENTS },
] as const

export const toSlug = (name: string): string =>
  name.toLowerCase().replaceAll(' ', '-')

/** Removed components whose docs URLs now forward to the page that absorbed
    them. */
const COMPONENT_SLUG_ALIASES: Readonly<Record<string, string>> = {
  'bottom-sheet': 'sheet',
}

export const canonicalComponentSlug = (slug: string): string =>
  COMPONENT_SLUG_ALIASES[slug] ?? slug

export const componentTitle = (slug: string): string | undefined =>
  COMPONENTS.find(name => toSlug(name) === canonicalComponentSlug(slug))
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
