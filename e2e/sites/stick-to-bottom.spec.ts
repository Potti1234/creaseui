import { expect, test, type Locator } from '@playwright/test'

const scrollTop = (viewport: Locator) =>
  viewport.evaluate(node => node.scrollTop)
const bottomGap = (viewport: Locator) =>
  viewport.evaluate(
    node => node.scrollHeight - node.clientHeight - node.scrollTop,
  )
const expectAtTail = async (viewport: Locator) => {
  await expect(viewport).toBeVisible()
  await expect.poll(() => bottomGap(viewport)).toBeLessThanOrEqual(1)
  await expect(viewport).toHaveAttribute('data-following', 'true')
}

const waitForInitialScroll = async (viewport: Locator) => {
  await viewport.scrollIntoViewIfNeeded()
  await expect(viewport).toHaveAttribute('data-pending-scroll', 'false', {
    timeout: 20_000,
  })
}

test('message scroller follows streamed text and resumes with a smooth jump', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/docs/components/message-scroller')
  const example = page.locator('#following-the-live-edge')
  const viewport = example.locator('[data-slot="message-scroller-viewport"]')
  const streamedReply = viewport.getByText(
    'Streaming tokens land chunk by chunk…',
  )
  await waitForInitialScroll(viewport)
  await expectAtTail(viewport)
  await example.getByRole('button', { name: 'Start streaming' }).click()
  await expect(streamedReply).toHaveCount(1, { timeout: 20_000 })
  await expectAtTail(viewport)

  await viewport.hover()
  await page.mouse.wheel(0, -380)
  await expect(viewport).toHaveAttribute('data-following', 'false')
  await expect.poll(() => bottomGap(viewport)).toBeGreaterThan(50)
  const readingPosition = await scrollTop(viewport)
  await example.getByRole('button', { name: 'Start streaming' }).click()
  await expect(viewport).toHaveAttribute('data-new-messages', 'true')
  await expect(streamedReply).toHaveCount(2, { timeout: 20_000 })
  expect(await scrollTop(viewport)).toBe(readingPosition)

  await example.getByRole('button', { name: 'Scroll to end' }).click()
  await expectAtTail(viewport)
  await expect(viewport).toHaveAttribute('data-new-messages', 'false')
})

test('loading earlier messages preserves the reader position', async ({
  page,
}) => {
  await page.goto('/docs/components/message-scroller')
  const example = page.locator('#loading-earlier-messages')
  const viewport = example.locator('[data-slot="message-scroller-viewport"]')
  await waitForInitialScroll(viewport)
  await expectAtTail(viewport)
  const row = viewport.locator('[data-message-id="msg-6"]')
  await row.evaluate(node => {
    const scroller = node.closest('[data-slot="message-scroller-viewport"]')
    if (scroller === null) return
    scroller.scrollTop +=
      node.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top -
      12
  })
  await expect(viewport).toHaveAttribute('data-following', 'false')
  const rowOffset = () =>
    row.evaluate(
      node =>
        node.getBoundingClientRect().top -
        (node
          .closest('[data-slot="message-scroller-viewport"]')
          ?.getBoundingClientRect().top ?? 0),
    )
  const readingOffset = await rowOffset()
  await example.getByRole('button', { name: 'Load earlier messages' }).click()
  await expect(viewport).toContainText('History loaded')
  await expect
    .poll(async () => Math.abs((await rowOffset()) - readingOffset))
    .toBeLessThan(3)
  await expect(viewport).toHaveAttribute('data-new-messages', 'false')
})

test('log stream pauses live updates when scrolled away and repins on jump', async ({
  page,
}) => {
  await page.goto('/docs/components/log-stream')
  const viewport = page.getByRole('log', { name: 'Live log stream' })
  await expect(viewport).toBeVisible()
  await viewport.evaluate(node => {
    node.style.maxHeight = '110px'
  })
  const append = page.getByRole('button', { name: 'Append line' })
  await append.click()
  await expect(viewport).toContainText('GET /v1/projects 200 in 38ms')
  await expectAtTail(viewport)

  await viewport.hover()
  await page.mouse.wheel(0, -380)
  await expect.poll(() => scrollTop(viewport)).toBe(0)
  await expect(viewport).toHaveAttribute('aria-live', 'off')
  await append.click()
  await expect(viewport).toContainText('token cache hit for key sess_9a02')
  expect(await scrollTop(viewport)).toBe(0)
  await page.getByRole('button', { name: 'Jump to latest' }).click()
  await expectAtTail(viewport)
  await expect(viewport).toHaveAttribute('aria-live', 'polite')
})
