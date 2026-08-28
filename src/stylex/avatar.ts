import * as stylex from '@stylexjs/stylex'
import { Schema as S } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'
export const Model=S.Struct({status:S.Literals(['loading','loaded','error'])})
export type Model=typeof Model.Type
export const Loaded=m('Loaded');export const Failed=m('Failed');export const Message=S.Union([Loaded,Failed]);export type Message=typeof Message.Type
export const init=():Model=>({status:'loading'});export const update=(_model:Model,message:Message):Model=>({status:message._tag==='Loaded'?'loaded':'error'})
const styles=stylex.create({root:{overflow:'hidden', display:'flex', flexShrink:0, position:'relative', userSelect:'none', height:'2rem', width:'2rem',},round:{borderRadius:'50%'},sm:{height:'1.5rem',width:'1.5rem'},lg:{height:'2.5rem',width:'2.5rem'},image:{objectFit:'cover', position:'relative', zIndex:10, height:'100%', width:'100%',},loading:{opacity:0},fallback:{inset:0, alignItems:'center', backgroundColor:foundationTokens.muted, color:tokens.mutedForeground, display:'flex', fontSize:'0.875rem', justifyContent:'center', position:'absolute', height:'100%', width:'100%',}})
export type AvatarProps=Readonly<{size?:'default'|'sm'|'lg';layoutStyle?:ComponentLayoutStyle;children:ReadonlyArray<Html|string>}>
export const avatar=<Msg>(p:AvatarProps,h:HtmlBuilder<Msg>):Html=>h.div([h.DataAttribute('slot','avatar'),h.DataAttribute('size',p.size??'default'),h.Class(className(styles.root,styles.round,p.size==='sm'&&styles.sm,p.size==='lg'&&styles.lg,p.layoutStyle))],[...p.children])
export type AvatarImageProps=Readonly<{src:string;alt:string;layoutStyle?:ComponentLayoutStyle;model?:Model}>
export const avatarImage=<Msg>(p:AvatarImageProps&Readonly<{toParentMessage?:(message:Message)=>Msg}>,h:HtmlBuilder<Msg>):Html=>p.model?.status==='error'?h.empty:h.img([h.DataAttribute('slot','avatar-image'),h.Src(p.src),h.Alt(p.alt),...(p.toParentMessage===undefined?[]:[h.OnLoad(p.toParentMessage(Loaded())),h.OnError(p.toParentMessage(Failed()))]),...(p.model?.status==='loaded'?[]:[h.DataAttribute('loading','')]),h.Class(className(styles.image,styles.round,p.model?.status!=='loaded'&&styles.loading,p.layoutStyle))])
export type AvatarFallbackProps=Readonly<{layoutStyle?:ComponentLayoutStyle;children:ReadonlyArray<Html|string>;model?:Model}>
export const avatarFallback=<Msg>(p:AvatarFallbackProps,h:HtmlBuilder<Msg>):Html=>p.model?.status==='loaded'?h.empty:h.div([h.DataAttribute('slot','avatar-fallback'),h.Class(className(styles.fallback,styles.round,p.layoutStyle))],[...p.children])

