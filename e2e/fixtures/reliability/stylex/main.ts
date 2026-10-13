import { alert, alertTitle } from '@/stylex/alert'
import { badge } from '@/stylex/badge'
import { button } from '@/stylex/button'
import { buttonGroup } from '@/stylex/button-group'
import { checkbox } from '@/stylex/checkbox'
import { heading } from '@/stylex/heading'
import { input } from '@/stylex/input'
import { nativeSelect } from '@/stylex/native-select'
import { switchControl } from '@/stylex/switch'
import { text } from '@/stylex/text'
import { textarea } from '@/stylex/textarea'

import { runActionsText } from '../actions'
import { runMixedForm } from '../shared'
import { installThemeVariables } from '../theme'

installThemeVariables()
runMixedForm({ button, input, textarea, nativeSelect, checkbox, switchControl })
runActionsText({ button, buttonGroup, heading, text, badge, alert, alertTitle })
