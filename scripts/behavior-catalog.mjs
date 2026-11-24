export const groups = {
  'Focus and keyboard': {
    'roving-focus':
      'Gives a composite one Tab stop and moves focus between enabled items.',
    'grid-focus':
      'Navigates by row and column, including cells outside the rendered window.',
    'spatial-focus': 'Finds the next focus target from its position on screen.',
    'focus-recovery':
      'Restores focus when an item is removed or moves to a different collection.',
    shortcuts: 'Matches and formats keyboard shortcuts across platforms.',
    typeahead:
      'Finds options by typed prefix and clears the search after a delay.',
    'input-history': 'Recalls earlier input values from the keyboard.',
    'input-hints':
      'Selects mobile keyboard and autofill hints by field purpose.',
    parts: 'Builds stable part IDs and reads mounted parts in DOM order.',
    'text-dom': 'Resolves typeahead labels, locale, and keyboard composition.',
    'text-match':
      'Ranks search results and identifies matching text for highlighting.',
  },
  'Selection and lists': {
    command:
      'Coordinates command query, highlight, and selection intent for command palettes.',
    tokenizer:
      'Manages a token field, free-text entry, and focus recovery when a token is removed.',
    'multi-selector':
      'Combines listbox navigation with multiple selection and responsive popover or drawer presentation.',
    'overflow-list':
      'Measures items to decide which ones fit and which belong in an overflow menu.',
    pagination:
      'Normalizes page indices and builds ranges with sibling and boundary links.',
    carousel:
      'Owns Embla mounting, selection synchronization, and carousel navigation.',
    'data-grid':
      'Coordinates grid focus, range selection, cell editing, and undoable updates.',
    'list-input':
      'Manages an editable collection with selection and item removal.',
    'message-scroller':
      'Tracks a message list viewport, follow mode, and scroll-to-new-content intent.',
    'transfer-list':
      'Coordinates source and destination collections, transfer, reorder, and focus recovery.',
    'tree-list':
      'Builds visible tree navigation and controlled expansion and selection.',
    selection:
      'Tracks selected keys and computes single, multiple, and range changes.',
    listbox:
      'Calculates option navigation and typeahead targets for listbox views.',
    'anchored-listbox':
      'Manages a listbox popup, active option, selection intent, and focus.',
    combobox:
      'Coordinates editable filtering, active descendants, and single or multiple selection.',
    'radio-group':
      'Coordinates focus and selection intent in a group of radio controls.',
    tabs: 'Routes tab focus and activation while the parent keeps the selected value.',
    'cell-range': 'Tracks a rectangular selection of grid cells.',
    lasso: 'Selects items intersecting a rectangle drawn with the pointer.',
    virtualizer:
      'Tracks scroll and measurement state and computes the visible row window.',
    'stick-to-bottom':
      'Follows appended content while preserving the reader’s position when they scroll back.',
    'scroll-picker': 'Keeps a scrollable wheel aligned to its selected option.',
    'tree-collection':
      'Looks up tree relationships, visible rows, and checked states.',
  },
  'Popups and layers': {
    popup: 'Tracks open state, dismissal reasons, and presence through exit.',
    'popup-behavior':
      'Connects popup state to trigger, panel, and close attributes.',
    modal: 'Manages native modal focus, Escape, and scroll locking.',
    portal:
      'Moves floating surfaces to the top layer or a scoped overlay root.',
    'popup-controller':
      'Requests a model-owned popup and correlates its result.',
    popover:
      'Coordinates an anchored panel, focus return, dismissal, and transitions.',
    drawer:
      'Adds direction, swipe phases, and snap-point decisions to the shared Dialog.',
    sheet:
      'Adds edge placement, detents, and dismissal gestures to the shared Dialog.',
    'alert-dialog':
      'Emits confirm and cancel decisions through a shared Dialog lifecycle.',
    'mobile-nav':
      'Uses Dialog resources to manage a navigation drawer and return focus.',
    lightbox: 'Composes modal media navigation with viewport zoom and pan.',
    'hover-card':
      'Combines hover intent, popup placement, and focus policies for a preview.',
    'dropdown-menu-behavior':
      'Coordinates menu navigation, selection, and dismissal across nested menus.',
    menubar:
      'Routes focus and menu activation through a keyboard-accessible menu bar.',
    'nav-menu': 'Coordinates navigation triggers and their open panels.',
    'sidebar-state':
      'Tracks sidebar open and collapsed state and persists the desktop preference.',
    dialog:
      'Runs a native dialog lifecycle with modal focus, dismissal, and scroll locking.',
    tooltip:
      'Manages tooltip visibility on hover and keyboard focus with versioned delays.',
    'hover-intent':
      'Opens and closes a surface after deliberate hover or focus changes.',
    layer:
      'Orders floating surfaces so Escape and outside interaction dismiss the right layer.',
    position:
      'Positions floating elements beside anchors, points, or live rectangles.',
    'overlay-boundary':
      'Keeps theme variables and direction available when a popup uses a portal.',
    'metadata-list':
      'Tracks whether a metadata list is collapsed or showing every item.',
    'sidebar-modal':
      'Coordinates mobile sidebar dismissal and modal focus resources.',
    disclosure:
      'Builds trigger and panel attributes from parent-owned expanded state.',
    animation:
      'Tracks CSS entry and exit phases and ignores stale completions.',
    motion:
      'Coordinates a mounted view with its animation and presence lifecycle.',
    toast:
      'Manages a notification queue, timeout, pause, swipe, and dismissal.',
  },
  'Direct manipulation': {
    'box-resizer':
      'Applies keyboard or pointer resize intents to a bounded box.',
    resizable:
      'Coordinates resize handles and preserves the space shared by adjacent panels.',
    drag: 'Tracks pointer capture, drag thresholds, movement samples, and cancellation.',
    'drag-and-drop':
      'Tracks pointer or keyboard dragging and emits a drop or cancellation intent.',
    reorder:
      'Keeps a draft list or grid order until a move is committed or canceled.',
    'tree-reorder': 'Reorders and nests tree branches with their descendants.',
    transfer: 'Moves selected items within or between collections.',
    move: 'Tracks pointer and keyboard movement of a freely positioned item.',
    resize: 'Computes size changes from resize handles and configured bounds.',
    'swipe-actions':
      'Reveals row actions and recognizes gestures that commit a swipe.',
    'hold-repeat':
      'Runs actions after a press is held and repeats them while held.',
    velocity: 'Estimates release velocity from recent pointer samples.',
    gesture:
      'Projects release travel, samples springs, and classifies strokes.',
    findable: 'Reveals collapsed content when native browser search matches.',
    'rubber-band':
      'Adds resistance when a gesture moves past its allowed bounds.',
    area: 'Maps input to a bounded value along two axes.',
    spans: 'Draws, moves, resizes, and places ranges on tracks.',
    preview: 'Holds a temporary value while a user explores a control.',
    viewport:
      'Pans and zooms a surface and transforms between screen and content coordinates.',
    connect: 'Tracks connection gestures between ports.',
  },
  'Forms and values': {
    'toggle-group':
      'Coordinates roving focus and parent-owned single or multiple pressed values.',
    'number-input':
      'Parses edits, clamps numeric values, and handles increment and decrement actions.',
    'time-input':
      'Parses editable time and coordinates selectors, segments, and constraints.',
    'color-picker':
      'Tracks color edits, channel values, presets, and the color popup.',
    'date-input':
      'Combines editable date text, parsing and the shared calendar picker.',
    'date-range-input':
      'Coordinates start and end date editing, range validation, and calendar selection.',
    'date-time-input':
      'Coordinates calendar selection, time editing, and time presets.',
    'card-pressable':
      'Routes press and navigation gestures on a card while preserving nested controls.',
    'file-input':
      'Coordinates native file selection, validation, and File Drop updates.',
    stepper:
      'Builds step navigation semantics from the current step and completion state.',
    button:
      'Builds native button and link semantics, including loading, disabled, and toggle semantics.',
    checkbox:
      'Builds checkbox semantics for checked, mixed, disabled, and read-only states.',
    switch: 'Builds switch semantics and routes toggles to the parent.',
    input:
      'Builds native text input attributes and reports edits to the parent.',
    textarea:
      'Builds multiline input attributes and reports edits to the parent.',
    field:
      'Connects labels, descriptions, and validation messages to controls, including fieldsets and native selects.',
    form: 'Coordinates form submission and validation state.',
    'inline-edit': 'Tracks in-place edit, commit, and cancel state.',
    'file-drop':
      'Tracks file drag state and validates files selected or dropped by the user.',
    calendar:
      'Owns calendar grid navigation, date focus, and selectable-date rules.',
    'date-picker':
      'Composes calendar navigation with a popover and emits parent-owned date changes.',
    slider:
      'Coordinates thumb focus, keyboard increments, drag, and bounded ranges.',
    progress:
      'Normalizes determinate and indeterminate progress values for renderers.',
  },
  'Platform and state': {
    alert: 'Resolves status and alert live-region semantics for notifications.',
    breadcrumb:
      'Collapses long trails while preserving the root and current location.',
    announce: 'Queues live-region announcements for assistive technology.',
    'avoid-keyboard':
      'Keeps focused controls visible above an on-screen keyboard.',
    'visual-viewport': 'Observes visible viewport size, offsets, and zoom.',
    'pointer-kind':
      'Observes coarse and fine pointer capabilities and hover support.',
    preference: 'Tracks a serializable preference value across changes.',
    'color-scheme': 'Resolves light, dark, and system preferences.',
    storage: 'Reads and writes browser preferences through Foldkit effects.',
    history: 'Records application changes that can be undone or redone.',
    change:
      'Validates a proposed change and reports the accepted value with its source.',
    'undo-stack': 'Manages reversible operations and bounds their history.',
    observe: 'Exposes application state and change facts for inspection.',
    agent:
      'Coordinates component actions and applies validated changes through the owning application.',
  },
}

export const companionModules = {
  'combobox-multi': 'combobox',
  'combobox-shared': 'combobox',
  'position-native': 'position',
  'reorder-dom': 'reorder',
  'scroll-picker-dom': 'scroll-picker',
  'spans-pointer': 'spans',
  'virtualizer-layout': 'virtualizer',
}

// These modules combine primitives into a specific widget or presentation.
export const compositionModules = new Set([
  'alert',
  'alert-dialog',
  'box-resizer',
  'breadcrumb',
  'calendar',
  'carousel',
  'color-picker',
  'combobox',
  'command',
  'data-grid',
  'date-input',
  'date-picker',
  'date-range-input',
  'date-time-input',
  'dialog',
  'drawer',
  'dropdown-menu-behavior',
  'file-input',
  'hover-card',
  'lightbox',
  'list-input',
  'menubar',
  'message-scroller',
  'metadata-list',
  'mobile-nav',
  'multi-selector',
  'nav-menu',
  'number-input',
  'popover',
  'progress',
  'radio-group',
  'resizable',
  'sheet',
  'sidebar-modal',
  'sidebar-state',
  'slider',
  'stepper',
  'tabs',
  'time-input',
  'toast',
  'toggle-group',
  'tokenizer',
  'tooltip',
  'transfer-list',
  'tree-list',
])
