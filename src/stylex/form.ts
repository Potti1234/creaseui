import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Field from './field'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
type Slot=Readonly<{layoutStyle?:ComponentLayoutStyle;children:ReadonlyArray<Html|string>}>
const styles=stylex.create({form:{gap:'1.5rem', display:'flex', flexDirection:'column',},description:{color:tokens.mutedForeground,fontSize:'0.875rem'}})
export type FormProps<Msg>=Slot&Readonly<{onSubmit?:Msg;ariaLabel?:string}>
export const form=<Msg>(p:FormProps<Msg>,h:HtmlBuilder<Msg>):Html=>h.form([h.DataAttribute('slot','form'),...(p.ariaLabel===undefined?[]:[h.AriaLabel(p.ariaLabel)]),...(p.onSubmit===undefined?[]:[h.OnSubmit(p.onSubmit)]),h.Class(className(styles.form,p.layoutStyle))],[...p.children])
export type FormItemProps=Slot&Readonly<{id:string;isInvalid?:boolean;isDisabled?:boolean}>
export const formItem=<Msg>(p:FormItemProps,h:HtmlBuilder<Msg>):Html=>Field.field({...p},h)
export type FormLabelProps=Slot&Readonly<{for:string}>
export const formLabel=<Msg>(p:FormLabelProps,h:HtmlBuilder<Msg>):Html=>Field.fieldLabel({...p},h)
export type FormDescriptionProps=Slot&Readonly<{id?:string}>
export const formDescription=<Msg>(p:FormDescriptionProps,h:HtmlBuilder<Msg>):Html=>h.p([...(p.id===undefined?[]:[h.Id(p.id)]),h.DataAttribute('slot','form-description'),h.Class(className(styles.description,p.layoutStyle))],[...p.children])
export type FormMessageProps=Readonly<{id?:string;layoutStyle?:ComponentLayoutStyle;message?:string;errors?:ReadonlyArray<Field.FieldError>}>
export const formMessage=<Msg>(p:FormMessageProps={},h:HtmlBuilder<Msg>):Html=>{const content=Field.fieldError({layoutStyle:p.layoutStyle,children:p.message===undefined?[]:[p.message],...(p.errors===undefined?{}:{errors:p.errors})},h);return p.id===undefined?content:h.div([h.Id(p.id),h.DataAttribute('slot','form-message')],[content])}
export const formControlIds=(id:string):Readonly<{descriptionId:string;messageId:string;describedBy:string}>=>{const descriptionId=`${id}-description`,messageId=`${id}-message`;return{descriptionId,messageId,describedBy:`${descriptionId} ${messageId}`}}

