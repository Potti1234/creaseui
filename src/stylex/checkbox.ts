import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Icon from '@/lib/icon'
import { type CheckboxBehaviorProps, renderCheckbox } from '@/lib/checkbox'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
const styles=stylex.create({row:{gap:'0.5rem', alignItems:'start', display:'flex',},control:{borderColor:{default:tokens.input,':focus-visible':tokens.ring}, borderRadius:foundationTokens.checkboxRadius, borderStyle:'solid', borderWidth:1, placeContent:'center', alignItems:'center', backgroundColor:foundationTokens.transparent, boxShadow:{default:foundationTokens.shadowXs,':focus-visible':tokens.focusRingShadow}, display:'grid', flexShrink:0, outlineStyle:'none', height:'1rem', width:'1rem',},checked:{borderColor:tokens.primary, backgroundColor:tokens.primary, color:tokens.primaryForeground,},disabled:{cursor:interactionTokens.cursorDisabled,opacity:.5},indicator:{placeContent:'center', display:'grid', height:'0.875rem', width:'0.875rem',},text:{gap:'0.375rem', display:'grid',},label:{fontSize:'0.875rem',fontWeight:500,lineHeight:1,userSelect:'none'},description:{color:tokens.mutedForeground,fontSize:'0.875rem'}})
export type CheckboxProps<Msg>=CheckboxBehaviorProps<Msg>&Readonly<{layoutStyle?:ComponentLayoutStyle}>
export const checkbox=<Msg>(p:CheckboxProps<Msg>,h:HtmlBuilder<Msg>):Html=>renderCheckbox(p,{root:[h.Class(className(styles.row,p.layoutStyle))],control:[h.Class(className(styles.control,(p.isChecked||p.isIndeterminate)&&styles.checked,(p.isDisabled||p.isReadOnly)&&styles.disabled))],indicator:[h.Class(className(styles.indicator))],text:[h.Class(className(styles.text))],label:[h.Class(className(styles.label))],description:[h.Class(className(styles.description))]},p.isIndeterminate===true?Icon.minus({},h):Icon.check({},h),h)

