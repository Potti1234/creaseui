import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Switch as SwitchPrimitive } from '@foldkit/ui'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
export type SwitchSize='sm'|'default'
const styles=stylex.create({row:{gap:'0.5rem', alignItems:'start', display:'flex',},control:{borderColor:{default:foundationTokens.transparent,':focus-visible':tokens.ring}, borderRadius:'50%', borderStyle:'solid', borderWidth:1, alignItems:'center', backgroundColor:tokens.input, boxShadow:{default:foundationTokens.shadowXs,':focus-visible':tokens.focusRingShadow}, display:'inline-flex', flexShrink:0, outlineStyle:'none', height:'1.15rem', width:'2rem',},sm:{height:'0.875rem',width:'1.5rem'},checked:{backgroundColor:tokens.primary},disabled:{cursor:interactionTokens.cursorDisabled,opacity:.5},thumb:{borderRadius:'50%', backgroundColor:tokens.background, display:'block', pointerEvents:'none', transform:'translateX(0)', transitionDuration:interactionTokens.motionFast, transitionProperty:'transform', height:'1rem', width:'1rem',},thumbSm:{height:'0.75rem',width:'0.75rem'},thumbChecked:{transform:'translateX(calc(100% - 2px))'},text:{gap:'0.375rem', display:'grid',},label:{fontSize:'0.875rem',fontWeight:500,lineHeight:1,userSelect:'none'},description:{color:tokens.mutedForeground,fontSize:'0.875rem'}})
export type SwitchProps<Msg>=Readonly<{id:string;isChecked:boolean;onToggle:(isChecked:boolean)=>Msg;label:string;description?:string;size?:SwitchSize;isDisabled?:boolean;name?:string;value?:string;layoutStyle?:ComponentLayoutStyle}>
export const switchControl=<Msg>(p:SwitchProps<Msg>,h:HtmlBuilder<Msg>):Html=>{const size=p.size??'default';return SwitchPrimitive.view({id:p.id,isChecked:p.isChecked,onToggle:p.onToggle,isDisabled:p.isDisabled??false,...(p.name===undefined?{}:{name:p.name}),...(p.value===undefined?{}:{value:p.value}),toView:({button,label,description,hiddenInput})=>h.div([h.Class(className(styles.row,p.layoutStyle))],[h.button([...button,h.Type('button'),h.DataAttribute('slot','switch'),h.DataAttribute('size',size),h.Class(className(styles.control,size==='sm'&&styles.sm,p.isChecked&&styles.checked,p.isDisabled&&styles.disabled))],[h.span([h.DataAttribute('slot','switch-thumb'),h.Class(className(styles.thumb,size==='sm'&&styles.thumbSm,p.isChecked&&styles.thumbChecked))],[])]),h.div([h.Class(className(styles.text))],[h.label([...label,h.Class(className(styles.label))],[p.label]),...(p.description===undefined?[]:[h.p([...description,h.Class(className(styles.description))],[p.description])])]),...(p.name===undefined?[]:[h.input([...hiddenInput])])])},h)}
export {switchControl as switch}


