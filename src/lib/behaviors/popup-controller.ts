import { Deferred, Effect } from 'effect'

export type OpenRequest<Input> = Readonly<{
  _tag: 'RequestedPopupOpen'
  correlationId: string
  input: Input
  settleOn?: 'close'
}>

export type OpenOutcome = 'opened' | 'already-open' | 'rejected'
export type OpenResult = OpenOutcome | 'cancelled' | 'disposed'

export type CloseDetails<
  Value,
  Reason extends string,
  Source extends string,
> = Readonly<{ reason: Reason; source: Source; returnValue?: Value }>

type Rejection = 'already-open' | 'rejected'
export type CloseResult<Value, Reason extends string, Source extends string> =
  | (CloseDetails<Value, Reason, Source> & Readonly<{ status: 'closed' }>)
  | Readonly<{ status: 'rejected'; reason: Rejection }>
  | Readonly<{ status: 'cancelled' | 'disposed' }>

let nextCorrelationId = 0n

/** Bridge callers awaiting an outcome to a Foldkit message dispatcher. */
export const make = <
  Input,
  Value = unknown,
  Reason extends string = string,
  Source extends string = string,
>(
  dispatch: (message: OpenRequest<Input>) => void,
) => {
  type Closed = CloseResult<Value, Reason, Source>
  const pending = new Map<string, Deferred.Deferred<OpenResult>>()
  const awaitingClose = new Map<string, Deferred.Deferred<Closed>>()
  let disposed = false

  const settle = <Result>(
    requests: Map<string, Deferred.Deferred<Result>>,
    correlationId: string,
    result: Result,
  ): boolean => {
    const reply = requests.get(correlationId)
    if (reply === undefined) return false
    requests.delete(correlationId)
    return Deferred.doneUnsafe(reply, Effect.succeed(result))
  }

  const request = <Result>(
    requests: Map<string, Deferred.Deferred<Result>>,
    input: Input,
    disposedResult: Result,
    settleOn?: 'close',
  ): Effect.Effect<Result> =>
    Effect.suspend(() => {
      if (disposed) return Effect.succeed(disposedResult)
      const correlationId = String(++nextCorrelationId)
      const reply = Deferred.makeUnsafe<Result>()
      return Effect.sync(() => {
        if (disposed) {
          Deferred.doneUnsafe(reply, Effect.succeed(disposedResult))
          return
        }
        requests.set(correlationId, reply)
        dispatch({
          _tag: 'RequestedPopupOpen',
          correlationId,
          input,
          ...(settleOn === undefined ? {} : { settleOn }),
        })
      }).pipe(
        Effect.andThen(Deferred.await(reply)),
        Effect.ensuring(Effect.sync(() => void requests.delete(correlationId))),
      )
    })

  return {
    requestOpen: (input: Input) => request(pending, input, 'disposed'),
    openUntilClose: (input: Input) =>
      request(awaitingClose, input, { status: 'disposed' }, 'close'),
    isPending: (id: string): boolean =>
      pending.has(id) || awaitingClose.has(id),
    resolve: (id: string, outcome: OpenOutcome): boolean =>
      settle(pending, id, outcome),
    settleClose: (
      id: string,
      details: CloseDetails<Value, Reason, Source>,
    ): boolean => settle(awaitingClose, id, { ...details, status: 'closed' }),
    rejectOpen: (id: string, reason: Rejection): boolean =>
      settle(awaitingClose, id, { status: 'rejected', reason }),
    cancel: (id: string): boolean =>
      settle(pending, id, 'cancelled') ||
      settle(awaitingClose, id, { status: 'cancelled' }),
    dispose: (): void => {
      disposed = true
      for (const id of pending.keys()) settle(pending, id, 'disposed')
      for (const id of awaitingClose.keys())
        settle(awaitingClose, id, { status: 'disposed' })
    },
  }
}
