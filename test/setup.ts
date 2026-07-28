const browserWindow = {
  requestAnimationFrame: (callback: FrameRequestCallback): number =>
    setTimeout(() => callback(Date.now()), 0) as unknown as number,
}

Object.defineProperty(globalThis, 'window', {
  value: browserWindow,
  configurable: true,
})
