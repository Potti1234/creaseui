/* Composition recipes agents should find through registry metadata, the
   catalog and `inspect`, keyed by the components they combine. */
const DOCS = 'https://creaseui.com/docs/components'

export const RECIPES = [
  {
    id: 'dialog-form',
    title: 'Dialog — Invite member form',
    docs: `${DOCS}/dialog`,
    components: ['dialog', 'form', 'field', 'input', 'button'],
    summary:
      "Put a Form with an id in the Dialog content; the footer Button is type: 'submit' with form: that id, Cancel is type: 'button'. Native required/type=email checks run only on a real submit, never on an onClick message; the parent update owns domain validation and shows errors on the Field.",
  },
  {
    id: 'metric-grid',
    title: 'Grid — Adaptive Metric Cards',
    docs: `${DOCS}/grid`,
    components: ['grid', 'card', 'stat'],
    summary:
      "Lay out Stat cards with Grid columns { minWidth: 240, max: 3, repeat: 'fit' } in a product-owned metricGrid wrapper instead of columns: 3, which clips values on phones.",
  },
  {
    id: 'toggle-group-state',
    title: 'Toggle Group — parent-owned selection',
    docs: `${DOCS}/toggle-group`,
    components: ['toggle-group'],
    summary:
      'Start the Model with ToggleGroup.init({ id }) (never build maybeFocusedIndex or activationMode yourself), route ToggleGroup.Message through ToggleGroup.update and pass the selected value from your own Model to toggleGroup({ model, toParentMessage, ariaLabel, value, items }).',
  },
]

export const recipesFor = component =>
  RECIPES.filter(recipe => recipe.components.includes(component)).map(
    ({ components: _components, ...recipe }) => recipe,
  )
