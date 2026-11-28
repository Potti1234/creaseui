import { Banner, Button } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './banner.css'

type Spec = Readonly<{
  status: 'info' | 'warning' | 'error' | 'success'
  title: string
  description?: string
  endActionLabel?: string
  dismissible?: boolean
  container?: 'card' | 'section'
  elevation?: 'none' | 'low' | 'med' | 'high'
  details?: boolean
}>

const sets: ReadonlyArray<
  readonly [string, ReadonlyArray<Spec>, number | undefined]
> = [
  [
    'Banner — Statuses',
    [
      { status: 'info', title: 'A new software update is available.' },
      { status: 'success', title: 'Your changes have been saved.' },
      {
        status: 'warning',
        title: 'Your trial expires in 3 days.',
        description: 'Upgrade to keep access to all features.',
      },
      {
        status: 'error',
        title: 'Payment failed.',
        description: 'Update your billing information to continue.',
      },
    ],
    800,
  ],
  [
    'Banner — Statuses (detailed)',
    [
      {
        status: 'info',
        title: 'A new software update is available',
        description:
          'Version 2.4.1 includes performance improvements and bug fixes.',
      },
      {
        status: 'success',
        title: 'Changes saved',
        description: 'Your profile information has been updated successfully.',
      },
      {
        status: 'warning',
        title: 'Storage almost full',
        description: 'You have used 90% of your available storage.',
      },
      {
        status: 'error',
        title: 'Build failed',
        description: '3 tests did not pass. Check the logs for details.',
      },
    ],
    undefined,
  ],
  [
    'Banner — Dismiss',
    [
      {
        status: 'success',
        title: 'Deployment complete',
        description: 'Version 3.2.0 is now live in production.',
        dismissible: true,
      },
      {
        status: 'warning',
        title: 'Scheduled maintenance tonight',
        description:
          'The system will be briefly unavailable from 2:00–3:00 AM.',
        dismissible: true,
      },
      {
        status: 'info',
        title: 'New feature available',
        description: 'Try the new dashboard layout in Settings.',
        dismissible: true,
      },
    ],
    undefined,
  ],
  [
    'Banner — Action',
    [
      {
        status: 'info',
        title: 'Your trial expires in 3 days',
        description: 'Upgrade now to keep access to all features.',
        endActionLabel: 'Upgrade',
      },
      {
        status: 'warning',
        title: 'API key expires soon',
        description:
          'Generate a new key before December 1 to avoid service interruption.',
        endActionLabel: 'Renew key',
      },
      {
        status: 'error',
        title: 'Payment failed',
        description: 'We could not process your last payment.',
        endActionLabel: 'Retry',
      },
    ],
    undefined,
  ],
  [
    'Banner — Collapsible',
    [
      {
        status: 'warning',
        title: 'Configuration changes detected',
        description: 'Review the changes before they take effect.',
        endActionLabel: 'Review',
        dismissible: true,
        details: true,
      },
    ],
    undefined,
  ],
  [
    'Banner — Floating',
    [
      {
        status: 'info',
        title: 'You have unsaved changes',
        description:
          'A raised banner reads as an overlay floating above the page.',
        elevation: 'med',
      },
    ],
    undefined,
  ],
  [
    'Banner — Full Width',
    [
      {
        status: 'warning',
        title: 'Scheduled downtime',
        description:
          'All services will be unavailable on Sunday from 2:00–4:00 AM.',
        container: 'section',
        dismissible: true,
      },
      {
        status: 'info',
        title: 'Welcome to the new dashboard',
        description: 'We have redesigned the layout based on your feedback.',
        container: 'section',
        endActionLabel: 'Take a tour',
      },
    ],
    undefined,
  ],
]

const render =
  (
    specs: ReadonlyArray<Spec>,
    maxWidth: number | undefined,
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div
      .class('banner-docs-stack')
      .attrs({
        style: maxWidth === undefined ? undefined : `max-width:${maxWidth}px`,
      })
      .children(
        specs.map((spec, index) =>
          Banner(h, {
            key: `${context.idPrefix}-banner-${index}`,
            props: spec.details ? { defaultOpen: true } : {},
            id: `${context.idPrefix}-banner-${index}`,
            status: spec.status,
            title: spec.title,
            ...(spec.description === undefined
              ? {}
              : { description: spec.description }),
            ...(spec.endActionLabel === undefined
              ? {}
              : {
                  endContent: [
                    Button(h, { variant: 'secondary', size: 'sm' }).children(
                      spec.endActionLabel,
                    ),
                  ],
                }),
            ...(spec.dismissible === true ? { dismissible: true } : {}),
            ...(spec.container === undefined
              ? {}
              : { container: spec.container }),
            ...(spec.elevation === undefined
              ? {}
              : { elevation: spec.elevation }),
            ...(spec.details === true
              ? {
                  children: [
                    h.div
                      .class('banner-docs-detail')
                      .children(
                        h.p
                          .class('banner-docs-detail-title')
                          .children('Changed settings:'),
                        h.ul
                          .class('banner-docs-detail-list')
                          .children(
                            h.li.children('Authentication method updated'),
                            h.li.children('Rate limits modified'),
                          ),
                      ),
                  ],
                }
              : {}),
          }),
        ),
      )

const source = exampleApplicationSource({
  imports: `import { Banner, Button } from '@/ui/effect/ui'
import './banner.css'`,
  body: `Banner(h, {
  key: 'update-banner',
  props: {},
  id: 'update-banner',
  status: 'info',
  title: 'A new software update is available.',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Banner } from '@/ui/effect/ui'

Banner(h, {
  key: 'update-banner',
  props: {},
  id: 'update-banner',
  status: 'success',
  title: 'Changes saved',
})`,
  examples: sets.map(([title, specs, maxWidth]) => ({
    title,
    view: render(specs, maxWidth),
    source,
  })),
})
