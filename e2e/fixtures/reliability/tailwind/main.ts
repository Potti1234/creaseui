import './styles.css'

import { button } from '@/ui/button'
import { checkbox } from '@/ui/checkbox'
import { input } from '@/ui/input'
import { nativeSelect } from '@/ui/native-select'
import { switchControl } from '@/ui/switch'
import { textarea } from '@/ui/textarea'

import { runMixedForm } from '../shared'

runMixedForm({ button, input, textarea, nativeSelect, checkbox, switchControl })
