import './styles.css'

import { alert, alertTitle } from '@/ui/alert'
import { badge } from '@/ui/badge'
import { button } from '@/ui/button'
import { buttonGroup } from '@/ui/button-group'
import {
  card,
  cardHeader,
  cardTitle,
  cardDescription,
  cardContent,
} from '@/ui/card'
import { checkbox } from '@/ui/checkbox'
import { themeScope } from '@/ui/composition/theme'
import { heading } from '@/ui/heading'
import { item, itemContent, itemGroup, itemTitle } from '@/ui/item'
import { input } from '@/ui/input'
import { nativeSelect } from '@/ui/native-select'
import { datePicker } from '@/ui/date-picker'
import { popover } from '@/ui/popover'
import { stat } from '@/ui/stat'
import { switchControl } from '@/ui/switch'
import {
  table,
  tableHeader,
  tableBody,
  tableRow,
  tableHead,
  tableCell,
} from '@/ui/table'
import { tabs, update as tabsUpdate } from '@/ui/tabs'
import { text } from '@/ui/text'
import { textarea } from '@/ui/textarea'

import { runActionsText } from '../actions'
import { runDashboard } from '../dashboard'
import { runItemGroups } from '../items'
import { runScopeOverlay } from '../scope'
import { runSettings } from '../settings'
import { runMixedForm } from '../shared'
import { runSurfacesData } from '../surfaces'

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
runItemGroups({ itemGroup, item, itemContent, itemTitle })
