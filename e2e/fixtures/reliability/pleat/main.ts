import { button } from '@/pleat/button'
import { checkbox } from '@/pleat/checkbox'
import { input } from '@/pleat/input'
import { nativeSelect } from '@/pleat/native-select'
import { switchControl } from '@/pleat/switch'
import { textarea } from '@/pleat/textarea'

import { runMixedForm } from '../shared'
import { installThemeVariables } from '../theme'

installThemeVariables()
runMixedForm({ button, input, textarea, nativeSelect, checkbox, switchControl })
