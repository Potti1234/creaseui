import { button } from '@/stylex/button'
import { checkbox } from '@/stylex/checkbox'
import { input } from '@/stylex/input'
import { nativeSelect } from '@/stylex/native-select'
import { switchControl } from '@/stylex/switch'
import { textarea } from '@/stylex/textarea'

import { runMixedForm } from '../shared'
import { installThemeVariables } from '../theme'

installThemeVariables()
runMixedForm({ button, input, textarea, nativeSelect, checkbox, switchControl })
