import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'
export type ButtonGroupVariants=Readonly<{orientation?:'horizontal'|'vertical'|null}>
const styles=stylex.create({base:{alignItems:'stretch',display:'flex',width:'fit-content'},horizontal:{flexDirection:'row'},vertical:{flexDirection:'column'},separatorH:{backgroundColor:tokens.input,height:'1px',width:'100%'},separatorV:{alignSelf:'stretch',backgroundColor:tokens.input,width:'1px'},text:{borderColor:tokens.border, borderRadius:foundationTokens.radiusMd, borderStyle:'solid', borderWidth:1, gap:'0.5rem', paddingInline:'1rem', alignItems:'center', backgroundColor:foundationTokens.muted, boxShadow:foundationTokens.shadowXs, display:'flex', fontSize:'0.875rem', fontWeight:500,}})
export const buttonGroupVariants=(o:ButtonGroupVariants={}):string=>className(styles.base,styles[o.orientation??'horizontal'])
export type ButtonGroupProps=Readonly<{children:ReadonlyArray<Html|string>;orientation?:ButtonGroupVariants['orientation'];layoutStyle?:ComponentLayoutStyle}>
export const buttonGroup=<Msg>(p:ButtonGroupProps,h:HtmlBuilder<Msg>):Html=>{const orientation=p.orientation??'horizontal';return h.div([h.Role('group'),h.DataAttribute('slot','button-group'),h.DataAttribute('orientation',orientation),h.Class(className(styles.base,styles[orientation],p.layoutStyle))],[...p.children])}
export type ButtonGroupSeparatorProps=Readonly<{orientation?:'horizontal'|'vertical';layoutStyle?:ComponentLayoutStyle}>
export const buttonGroupSeparator=<Msg>(p:ButtonGroupSeparatorProps={},h:HtmlBuilder<Msg>):Html=>{const orientation=p.orientation??'vertical';return h.div([h.Role('none'),h.DataAttribute('slot','button-group-separator'),h.DataAttribute('orientation',orientation),h.Class(className(orientation==='horizontal'?styles.separatorH:styles.separatorV,p.layoutStyle))],[])}
export type ButtonGroupTextProps=Readonly<{children:ReadonlyArray<Html|string>;layoutStyle?:ComponentLayoutStyle}>
export const buttonGroupText=<Msg>(p:ButtonGroupTextProps,h:HtmlBuilder<Msg>):Html=>h.div([h.DataAttribute('slot','button-group-text'),h.Class(className(styles.text,p.layoutStyle))],[...p.children])

