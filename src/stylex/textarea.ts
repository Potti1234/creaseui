import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { type TextareaBehaviorProps, renderTextarea } from '@/lib/textarea'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
const styles=stylex.create({control:{fieldSizing:'content', borderColor:{default:tokens.input,':focus-visible':tokens.ring}, borderRadius:foundationTokens.radiusMd, borderStyle:'solid', borderWidth:1, paddingBlock:'0.5rem', paddingInline:'0.75rem', backgroundColor:foundationTokens.transparent, boxShadow:{default:foundationTokens.shadowXs,':focus-visible':tokens.focusRingShadow}, display:'flex', fontFamily:'inherit', fontSize:'1rem', outlineStyle:'none', transitionDuration:interactionTokens.motionFast, transitionProperty:'color, box-shadow', minHeight:'4rem', width:'100%',},invalid:{borderColor:tokens.destructive,boxShadow:tokens.destructiveRingShadow},disabled:{cursor:interactionTokens.cursorDisabled,opacity:.5},wrapper:{gap:'0.5rem', display:'grid',},label:{gap:'0.5rem', alignItems:'center', display:'flex', fontSize:'0.875rem', fontWeight:500, lineHeight:1, userSelect:'none',},description:{color:tokens.mutedForeground,fontSize:'0.875rem'}})
const resizeStyles=stylex.create({none:{resize:'none'},vertical:{resize:'vertical'},horizontal:{resize:'horizontal'},both:{resize:'both'}})
export type TextareaProps<Msg>=TextareaBehaviorProps<Msg>&Readonly<{layoutStyle?:ComponentLayoutStyle}>
export const textarea=<Msg>(p:TextareaProps<Msg>,h:HtmlBuilder<Msg>):Html=>renderTextarea(p,{field:[h.Class(className(styles.wrapper))],label:[h.Class(className(styles.label))],textarea:[h.Class(className(styles.control,resizeStyles[p.resize??'vertical'],p.isInvalid&&styles.invalid,p.isDisabled&&styles.disabled,p.layoutStyle))],description:[h.Class(className(styles.description))]},h)

