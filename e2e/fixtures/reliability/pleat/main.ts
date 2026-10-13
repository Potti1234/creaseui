import { alert, alertTitle } from '@/pleat/alert'
import { badge } from '@/pleat/badge'
import { button } from '@/pleat/button'
import { buttonGroup } from '@/pleat/button-group'
import { checkbox } from '@/pleat/checkbox'
import { heading } from '@/pleat/heading'
import { input } from '@/pleat/input'
import { nativeSelect } from '@/pleat/native-select'
import { switchControl } from '@/pleat/switch'
import { text } from '@/pleat/text'
import { textarea } from '@/pleat/textarea'

import { runActionsText } from '../actions'
import { runMixedForm } from '../shared'
import { installThemeVariables } from '../theme'

installThemeVariables()
runMixedForm({ button, input, textarea, nativeSelect, checkbox, switchControl })
runActionsText({ button, buttonGroup, heading, text, badge, alert, alertTitle })
