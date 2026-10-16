/** Algebraic styles for Effect and Foldkit.
 *
 *  - {@link Style}: declarations under conditions, an idempotent monoid compiled to atomic classes.
 *  - {@link When}: the conditions a declaration can hold under, with a total precedence order.
 *  - {@link Recipe}: Schema-typed variant families, every branch compiled ahead of time.
 *  - {@link Var}: typed custom properties for values that vary continuously with the Model.
 *  - {@link Token} and {@link Theme}: design tokens and the values that fill them.
 *  - {@link Global}: element rules, themes, font faces, and keyframes.
 *  - {@link Sheet}: the stylesheet, for server rendering and the browser.
 *  - {@link Calc} and {@link Color}: value helpers that compile to CSS functions.
 *
 *  @packageDocumentation */

export * as Calc from './calc'
export * as Color from './color'
export type { Declarations, Properties } from './declarations'
export * as Global from './global'
export * as Recipe from './recipe'
export * as Sheet from './sheet'
export * as Style from './style'
export * as Theme from './theme'
export * as Token from './token'
export * as Var from './var'
export * as When from './when'
