export { MessageScrollerBehavior as LogStreamBehavior } from './message-scroller'

export type LogStreamLevel = 'info' | 'warn' | 'error' | 'debug'
export type LogEntry = {
  readonly id: string
  readonly timestamp: string
  readonly level: LogStreamLevel
  readonly source?: string
  readonly message: string
  readonly detail?: string
}

export const logStreamColumns = (timestamps: boolean, source: boolean) =>
  [timestamps ? '6rem' : '', '3.25rem', source ? '8rem' : '', 'minmax(0, 1fr)']
    .filter(Boolean)
    .join(' ')
