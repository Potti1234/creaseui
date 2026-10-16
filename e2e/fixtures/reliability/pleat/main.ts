import { alert, alertTitle } from '@/pleat/alert'
import { badge } from '@/pleat/badge'
import { button } from '@/pleat/button'
import { buttonGroup } from '@/pleat/button-group'
import {
  card,
  cardHeader,
  cardTitle,
  cardDescription,
  cardContent,
} from '@/pleat/card'
import { checkbox } from '@/pleat/checkbox'
import { themeScope } from '@/pleat/composition/theme'
import { heading } from '@/pleat/heading'
import {
  item,
  itemContent,
  itemGroup,
  itemGroupSeparator,
  itemTitle,
} from '@/pleat/item'
import { input } from '@/pleat/input'
import { nativeSelect } from '@/pleat/native-select'
import { datePicker } from '@/pleat/date-picker'
import { popover } from '@/pleat/popover'
import { stat } from '@/pleat/stat'
import { switchControl } from '@/pleat/switch'
import {
  table,
  tableHeader,
  tableBody,
  tableRow,
  tableHead,
  tableCell,
} from '@/pleat/table'
import { tabs, update as tabsUpdate } from '@/pleat/tabs'
import { text } from '@/pleat/text'
import { textarea } from '@/pleat/textarea'

import { runActionsText } from '../actions'
import { runDashboard } from '../dashboard'
import { runItemGroups } from '../items'
import { runScopeOverlay } from '../scope'
import { runSettings } from '../settings'
import { runMixedForm } from '../shared'
import { runSurfacesData } from '../surfaces'
import { installThemeVariables } from '../theme'

installThemeVariables()
runMixedForm({ button, input, textarea, nativeSelect, checkbox, switchControl })
runActionsText({ button, buttonGroup, heading, text, badge, alert, alertTitle })
runSurfacesData({
  card,
  cardHeader,
  cardTitle,
  cardDescription,
  cardContent,
  table,
  tableHeader,
  tableBody,
  tableRow,
  tableHead,
  tableCell,
})
runScopeOverlay({ button, popover, themeScope, datePicker })
runSettings({ tabs, tabsUpdate, switchControl })
runDashboard({ stat })
runItemGroups({
  itemGroup,
  itemGroupSeparator,
  item,
  itemContent,
  itemTitle,
})
