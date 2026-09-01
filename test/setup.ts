let nextAnimationFrameId = 0

const browserWindow = {
  requestAnimationFrame: (callback: FrameRequestCallback): number => {
    const id = ++nextAnimationFrameId
    setTimeout(() => callback(Date.now()), 0)
    return id
  },
}

Object.defineProperty(globalThis, 'window', {
  value: browserWindow,
  configurable: true,
})
