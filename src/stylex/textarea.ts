import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Textarea as TextareaPrimitive } from '@foldkit/ui'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
const styles=stylex.create({control:{fieldSizing:'content', borderColor:{default:tokens.input,':focus-visible':tokens.ring}, borderRadius:foundationTokens.radiusMd, borderStyle:'solid', borderWidth:1, paddingBlock:'0.5rem', paddingInline:'0.75rem', backgroundColor:foundationTokens.transparent, boxShadow:{default:foundationTokens.shadowXs,':focus-visible':tokens.focusRingShadow}, display:'flex', fontFamily:'inherit', fontSize:'1rem', outlineStyle:'none', transitionDuration:interactionTokens.motionFast, transitionProperty:'color, box-shadow', minHeight:'4rem', width:'100%',},invalid:{borderColor:tokens.destructive,boxShadow:tokens.destructiveRingShadow},disabled:{cursor:interactionTokens.cursorDisabled,opacity:.5},wrapper:{gap:'0.5rem', display:'grid',},label:{gap:'0.5rem', alignItems:'center', display:'flex', fontSize:'0.875rem', fontWeight:500, lineHeight:1, userSelect:'none',},description:{color:tokens.mutedForeground,fontSize:'0.875rem'}})
export type TextareaProps<Msg>=Readonly<{id:string;value:string;onInput:(value:string)=>Msg;label?:string;description?:string;placeholder?:string;name?:string;rows?:number;isDisabled?:boolean;isInvalid?:boolean;layoutStyle?:ComponentLayoutStyle}>
export const textarea=<Msg>(p:TextareaProps<Msg>,h:HtmlBuilder<Msg>):Html=>TextareaPrimitive.view({id:p.id,value:p.value,onInput:p.onInput,isDisabled:p.isDisabled??false,isInvalid:p.isInvalid??false,...(p.name===undefined?{}:{name:p.name}),...(p.rows===undefined?{}:{rows:p.rows}),...(p.placeholder===undefined?{}:{placeholder:p.placeholder}),toView:({textarea:attrs,label,description})=>{const control=h.textarea([...attrs,h.DataAttribute('slot','textarea'),h.Class(className(styles.control,p.isInvalid&&styles.invalid,p.isDisabled&&styles.disabled,p.layoutStyle))],[]);return p.label===undefined&&p.description===undefined?control:h.div([h.Class(className(styles.wrapper))],[...(p.label===undefined?[]:[h.label([...label,h.Class(className(styles.label))],[p.label])]),control,...(p.description===undefined?[]:[h.p([...description,h.Class(className(styles.description))],[p.description])])])}},h)


