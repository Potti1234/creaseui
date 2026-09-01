import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { type ErrorSummaryProps as SharedErrorSummaryProps, type FormBehaviorProps, renderErrorSummary, renderForm } from '@/lib/form'
import * as Field from './field'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
export type { FormError, FormMethod } from '@/lib/form'
export { formControlIds } from '@/lib/form'
type Slot=Readonly<{layoutStyle?:ComponentLayoutStyle;children:ReadonlyArray<Html|string>}>
const styles=stylex.create({form:{gap:'1.5rem', display:'flex', flexDirection:'column'},description:{color:tokens.mutedForeground,fontSize:'0.875rem'},summary:{padding:'1rem', borderColor:tokens.destructive, borderRadius:tokens.controlRadius, borderStyle:'solid', borderWidth:'1px', color:tokens.foreground, fontSize:'0.875rem',},summaryTitle:{fontWeight:500},summaryList:{paddingInlineStart:'1.25rem', marginTop:'0.5rem',},summaryLink:{textDecoration:'underline', color:tokens.foreground, textUnderlineOffset:'4px',}})
export type FormProps<Msg>=FormBehaviorProps<Msg>&Readonly<{layoutStyle?:ComponentLayoutStyle}>
export const form=<Msg>(p:FormProps<Msg>,h:HtmlBuilder<Msg>):Html=>renderForm(p,[h.Class(className(styles.form,p.layoutStyle))],h)
export type ErrorSummaryProps=SharedErrorSummaryProps&Readonly<{layoutStyle?:ComponentLayoutStyle}>
export const errorSummary=<Msg>(p:ErrorSummaryProps,h:HtmlBuilder<Msg>):Html=>renderErrorSummary(p,{root:[h.Class(className(styles.summary,p.layoutStyle))],title:[h.Class(className(styles.summaryTitle))],list:[h.Class(className(styles.summaryList))],link:[h.Class(className(styles.summaryLink))]},h)
export type FormItemProps=Slot&Readonly<{id:string;isInvalid?:boolean;isDisabled?:boolean}>
export const formItem=<Msg>(p:FormItemProps,h:HtmlBuilder<Msg>):Html=>Field.field({...p},h)
export type FormLabelProps=Slot&Readonly<{for:string}>
export const formLabel=<Msg>(p:FormLabelProps,h:HtmlBuilder<Msg>):Html=>Field.fieldLabel({...p},h)
export type FormDescriptionProps=Slot&Readonly<{id?:string}>
export const formDescription=<Msg>(p:FormDescriptionProps,h:HtmlBuilder<Msg>):Html=>h.p([...(p.id===undefined?[]:[h.Id(p.id)]),h.DataAttribute('slot','form-description'),h.Class(className(styles.description,p.layoutStyle))],[...p.children])
export type FormMessageProps=Readonly<{id?:string;layoutStyle?:ComponentLayoutStyle;message?:string;errors?:ReadonlyArray<Field.FieldError>}>
export const formMessage=<Msg>(p:FormMessageProps={},h:HtmlBuilder<Msg>):Html=>{const content=Field.fieldError({layoutStyle:p.layoutStyle,children:p.message===undefined?[]:[p.message],...(p.errors===undefined?{}:{errors:p.errors})},h);return p.id===undefined?content:h.div([h.Id(p.id),h.DataAttribute('slot','form-message')],[content])}
