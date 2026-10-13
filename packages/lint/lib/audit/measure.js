/* Runs inside the audited page via page.evaluate, so it must stay
   self-contained: no imports or closures over module scope. */
export const measurePage = ({ exceptions, minimumTarget }) => {
  const findings = []
  const unresolved = []
  const checked = {}
  const excluded = []
  const count = rule => (checked[rule] = (checked[rule] ?? 0) + 1)

  const selectorOf = element => {
    if (element.id) return `#${CSS.escape(element.id)}`
    const parts = []
    let node = element
    while (
      node &&
      node.nodeType === 1 &&
      node !== document.documentElement &&
      parts.length < 4
    ) {
      if (node.id) {
        parts.unshift(`#${CSS.escape(node.id)}`)
        break
      }
      let part = node.localName
      const slot = node.getAttribute('data-slot')
      if (slot) part += `[data-slot="${slot}"]`
      const parent = node.parentElement
      if (parent) {
        const same = [...parent.children].filter(
          child => child.localName === node.localName,
        )
        if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`
      }
      parts.unshift(part)
      node = parent
    }
    return parts.join(' > ')
  }
  const regionOf = element => {
    const region = element.closest(
      '[data-audit-region],[role="dialog"],[role="alertdialog"],form,main,section,header,nav,aside,footer',
    )
    return region ? selectorOf(region) : null
  }
  const visible = element => {
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return false
    if (element.closest('[aria-hidden="true"],[inert]')) return false
    return typeof element.checkVisibility === 'function'
      ? element.checkVisibility({ visibilityProperty: true })
      : getComputedStyle(element).visibility !== 'hidden'
  }
  const disabled = element =>
    element.closest(':disabled,[aria-disabled="true"]') !== null
  const suppressedBy = (rule, element) =>
    exceptions.find(
      exception =>
        exception.rule === rule &&
        (element.matches(exception.selector) ||
          element.closest(exception.selector) !== null),
    )
  const report = (rule, element, severity, measured, expected, fix) => {
    const finding = {
      rule,
      severity,
      selector: selectorOf(element),
      region: regionOf(element),
      measured,
      expected,
      fix,
    }
    const exception = suppressedBy(rule, element)
    if (exception) excluded.push({ ...finding, exception: exception.index })
    else findings.push(finding)
  }

  const INTERACTIVE =
    'button,a[href],input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="link"],[role="checkbox"],[role="switch"],[role="radio"],[role="tab"],[role="menuitem"],[role="option"],[role="combobox"],[role="slider"]'
  const interactive = [...document.querySelectorAll(INTERACTIVE)].filter(
    element => visible(element) && !disabled(element),
  )

  const textOfIds = ids =>
    ids
      .split(/\s+/u)
      .map(id => document.getElementById(id)?.textContent?.trim() ?? '')
      .join(' ')
      .trim()
  const accessibleName = element => {
    const label = element.getAttribute('aria-label')?.trim()
    if (label) return label
    const labelledBy = element.getAttribute('aria-labelledby')
    if (labelledBy && textOfIds(labelledBy)) return textOfIds(labelledBy)
    if ('labels' in element && element.labels?.length)
      return [...element.labels].map(l => l.textContent.trim()).join(' ')
    const text = ['input', 'select', 'textarea'].includes(element.localName)
      ? ''
      : (element.innerText ?? element.textContent ?? '').trim()
    if (text) return text
    const image = element.querySelector('img[alt]:not([alt=""]),svg title')
    if (image) return image.getAttribute('alt') ?? image.textContent.trim()
    return (
      element.getAttribute('title')?.trim() ||
      element.getAttribute('placeholder')?.trim() ||
      ''
    )
  }
  for (const element of interactive) {
    count('accessible-name')
    if (accessibleName(element) === '')
      report(
        'accessible-name',
        element,
        'error',
        'empty',
        'non-empty accessible name',
        'Give the control visible text, an associated label or aria-label.',
      )
  }

  for (const element of document.querySelectorAll(
    '[aria-labelledby],[aria-describedby],[aria-errormessage],label[for]',
  )) {
    for (const attribute of [
      'aria-labelledby',
      'aria-describedby',
      'aria-errormessage',
      'for',
    ]) {
      const value = element.getAttribute(attribute)
      if (!value) continue
      count('label-reference')
      const missing = value
        .split(/\s+/u)
        .filter(id => id && document.getElementById(id) === null)
      if (missing.length > 0)
        report(
          'label-reference',
          element,
          'error',
          `${attribute} -> ${missing.join(' ')}`,
          'every referenced id exists',
          'Render the referenced label/help/error element or remove the reference.',
        )
    }
  }

  const root = document.documentElement
  count('document-overflow')
  const overflow = root.scrollWidth - root.clientWidth
  if (overflow > 1) {
    const offenders = [...document.body.querySelectorAll('*')].filter(
      element => element.getBoundingClientRect().right > root.clientWidth + 1,
    )
    const topmost =
      offenders.find(element => !offenders.includes(element.parentElement)) ??
      document.body
    report(
      'document-overflow',
      topmost,
      'error',
      `${overflow}px`,
      '0px horizontal document overflow',
      'Constrain the region width or give it an owned scroll container.',
    )
  }

  for (const element of document.querySelectorAll(
    '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"],[role="tooltip"],dialog[open],[popover]:popover-open',
  )) {
    if (!visible(element)) continue
    count('overlay-bounds')
    const rect = element.getBoundingClientRect()
    if (
      rect.left < -1 ||
      rect.top < -1 ||
      rect.right > innerWidth + 1 ||
      rect.bottom > innerHeight + 1
    )
      report(
        'overlay-bounds',
        element,
        'error',
        `${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}x${Math.round(rect.height)}`,
        `inside ${innerWidth}x${innerHeight} viewport`,
        'Enable collision handling or constrain the overlay and scroll its content.',
      )
  }

  for (const element of interactive) {
    if (
      element.localName === 'a' &&
      element.closest('p,li,td') &&
      getComputedStyle(element).display === 'inline'
    )
      continue
    count('target-size')
    const rect = element.getBoundingClientRect()
    if (rect.width < minimumTarget || rect.height < minimumTarget)
      report(
        'target-size',
        element,
        'warning',
        `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        `at least ${minimumTarget}x${minimumTarget}`,
        'Use a larger control size or extend the hit area.',
      )
  }

  const context = document
    .createElement('canvas')
    .getContext('2d', { willReadFrequently: true })
  const rgba = color => {
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = '#000'
    context.fillStyle = color
    context.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
    return [r, g, b, a / 255]
  }
  const over = ([r, g, b, a], [br, bg, bb]) => [
    r * a + br * (1 - a),
    g * a + bg * (1 - a),
    b * a + bb * (1 - a),
  ]
  const luminance = rgb => {
    const [r, g, b] = rgb.map(channel => {
      const value = channel / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const backgroundOf = element => {
    const layers = []
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (Number(style.opacity) < 1) return { reason: 'ancestor opacity' }
      if (style.backgroundImage !== 'none')
        return { reason: 'background image or gradient' }
      const layer = rgba(style.backgroundColor)
      if (layer[3] > 0) layers.unshift(layer)
      if (layer[3] >= 1) break
    }
    return {
      rgb: layers.reduce((base, layer) => over(layer, base), [255, 255, 255]),
    }
  }
  for (const element of document.body.querySelectorAll('*')) {
    const hasText = [...element.childNodes].some(
      node => node.nodeType === 3 && node.textContent.trim() !== '',
    )
    if (!hasText || !visible(element) || disabled(element)) continue
    if (['script', 'style', 'noscript', 'option'].includes(element.localName))
      continue
    const background = backgroundOf(element)
    if (background.reason) {
      unresolved.push({
        rule: 'text-contrast',
        selector: selectorOf(element),
        reason: background.reason,
      })
      continue
    }
    count('text-contrast')
    const style = getComputedStyle(element)
    const text = over(rgba(style.color), background.rgb)
    const [light, dark] = [luminance(text), luminance(background.rgb)].sort(
      (a, b) => b - a,
    )
    const ratio = (light + 0.05) / (dark + 0.05)
    const size = parseFloat(style.fontSize)
    const large =
      size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700)
    const required = large ? 3 : 4.5
    if (ratio < required)
      report(
        'text-contrast',
        element,
        'error',
        `${ratio.toFixed(2)}:1`,
        `>= ${required}:1`,
        'Use the theme foreground role for this surface instead of a muted or custom color.',
      )
  }

  const unsupported = [
    ...[...document.querySelectorAll('iframe,frame')].map(element => ({
      selector: selectorOf(element),
      reason: 'frame content is not inspected',
    })),
    ...[...document.querySelectorAll('*')]
      .filter(element => element.shadowRoot)
      .map(element => ({
        selector: selectorOf(element),
        reason: 'open shadow root content is not inspected',
      })),
  ]

  return { findings, excluded, unresolved, unsupported, checked }
}
