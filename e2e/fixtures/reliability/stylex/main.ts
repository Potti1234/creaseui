import { alert, alertTitle } from '@/stylex/alert'
import { badge } from '@/stylex/badge'
import { button } from '@/stylex/button'
import { buttonGroup } from '@/stylex/button-group'
import {
  card,
  cardHeader,
  cardTitle,
  cardDescription,
  cardContent,
} from '@/stylex/card'
import { checkbox } from '@/stylex/checkbox'
import { themeScope } from '@/stylex/composition/theme'
import { heading } from '@/stylex/heading'
import { input } from '@/stylex/input'
import { nativeSelect } from '@/stylex/native-select'
import { datePicker } from '@/stylex/date-picker'
import { popover } from '@/stylex/popover'
import { stat } from '@/stylex/stat'
import { switchControl } from '@/stylex/switch'
import {
  table,
  tableHeader,
  tableBody,
  tableRow,
  tableHead,
  tableCell,
} from '@/stylex/table'
import { tabs, update as tabsUpdate } from '@/stylex/tabs'
import { text } from '@/stylex/text'
import { textarea } from '@/stylex/textarea'

import { runActionsText } from '../actions'
import { runDashboard } from '../dashboard'
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
