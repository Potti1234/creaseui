import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Checkbox as CheckboxPrimitive } from '@foldkit/ui'
import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
const styles=stylex.create({row:{gap:'0.5rem', alignItems:'start', display:'flex',},control:{borderColor:{default:tokens.input,':focus-visible':tokens.ring}, borderRadius:foundationTokens.checkboxRadius, borderStyle:'solid', borderWidth:1, placeContent:'center', alignItems:'center', backgroundColor:foundationTokens.transparent, boxShadow:{default:foundationTokens.shadowXs,':focus-visible':tokens.focusRingShadow}, display:'grid', flexShrink:0, outlineStyle:'none', height:'1rem', width:'1rem',},checked:{borderColor:tokens.primary, backgroundColor:tokens.primary, color:tokens.primaryForeground,},disabled:{cursor:interactionTokens.cursorDisabled,opacity:.5},indicator:{placeContent:'center', display:'grid', height:'0.875rem', width:'0.875rem',},text:{gap:'0.375rem', display:'grid',},label:{fontSize:'0.875rem',fontWeight:500,lineHeight:1,userSelect:'none'},description:{color:tokens.mutedForeground,fontSize:'0.875rem'}})
export type CheckboxProps<Msg>=Readonly<{id:string;isChecked:boolean;onToggle:(isChecked:boolean)=>Msg;label:string;description?:string;isDisabled?:boolean;isIndeterminate?:boolean;name?:string;value?:string;layoutStyle?:ComponentLayoutStyle}>
export const checkbox=<Msg>(p:CheckboxProps<Msg>,h:HtmlBuilder<Msg>):Html=>CheckboxPrimitive.view({id:p.id,isChecked:p.isChecked,onToggle:p.onToggle,isDisabled:p.isDisabled??false,isIndeterminate:p.isIndeterminate??false,...(p.name===undefined?{}:{name:p.name}),...(p.value===undefined?{}:{value:p.value}),toView:({checkbox:attrs,label,description,hiddenInput})=>h.div([h.Class(className(styles.row,p.layoutStyle))],[h.button([...attrs,h.Type('button'),h.DataAttribute('slot','checkbox'),h.Class(className(styles.control,(p.isChecked||p.isIndeterminate)&&styles.checked,p.isDisabled&&styles.disabled))],[h.span([h.DataAttribute('slot','checkbox-indicator'),h.Class(className(styles.indicator))],[Icon.check({},h)])]),h.div([h.Class(className(styles.text))],[h.label([...label,h.Class(className(styles.label))],[p.label]),...(p.description===undefined?[]:[h.p([...description,h.Class(className(styles.description))],[p.description])])]),...(p.name===undefined?[]:[h.input([...hiddenInput])])])},h)


