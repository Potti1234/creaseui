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
import { heading } from '@/ui/heading'
import { input } from '@/ui/input'
import { nativeSelect } from '@/ui/native-select'
import { switchControl } from '@/ui/switch'
import {
  table,
  tableHeader,
  tableBody,
  tableRow,
  tableHead,
  tableCell,
} from '@/ui/table'
import { text } from '@/ui/text'
import { textarea } from '@/ui/textarea'

import { runActionsText } from '../actions'
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
