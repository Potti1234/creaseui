import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXAvatar from '@/stylex/avatar'
import * as TailwindAvatar from '@/ui/avatar'

/**
 * Behavioral parity suite ported from Base UI's avatar tests
 * (base-ui/packages/react/src/avatar/{root,image,fallback}/*.test.tsx,
 * checked at base-ui HEAD).
 *
 * Base UI keeps `imageLoadingStatus` ('idle' | 'loading' | 'loaded' | 'error')
 * in an AvatarRoot context shared by Image and Fallback. creaseui has no
 * context: the app owns an `Avatar.Model` ('loading' | 'loaded' | 'error' —
 * there is no 'idle') and feeds it to `avatarImage`/`avatarFallback` as a prop,
 * with `toParentMessage` wiring the rendered <img>'s load/error events.
 *
 * The scene DSL has no `load`/`error` event step, so the tests assert the
 * OnLoad/OnError handler wiring on the <img> and then feed the Message those
 * handlers would dispatch through `Scene.Subscription.emit`.
 *
 * Cases that have no creaseui analogue are recorded as comments here instead
 * of being dropped silently:
 *  - describeConformance (<Avatar.Root/>, <Avatar.Image/>, <Avatar.Fallback/>):
 *    ref instanceof, render-prop element substitution, React internals.
 *  - Avatar.spec.tsx: type-level render-prop state signatures (typecheck only).
 *  - `onLoad={(event) => event.preventBaseUIHandler()}`: event-object
 *    cancellation — foldkit dispatches plain messages, no DOM event.
 *  - `render=` callback cases: 'does not override source props in a render
 *    callback', 'applies the source props after the ones configuring the
 *    request', 'preserves loaded status when the render element changes',
 *    'keeps the status reported by an element that does not forward a ref'.
 *  - Chromium-only cases: SSR/hydration ('renders the image in the server
 *    HTML and resolves cached images on hydration', 'does not flash fallback
 *    for a cached image during SSR hydration', 'does not replay the enter
 *    animation for a cached image on hydration'), real-image `complete` /
 *    `naturalWidth` checks ('loads the image without a detached preload',
 *    'reports an error when there is no source', 'resets the status when the
 *    source changes to an unloaded one').
 *  - animations describe: `data-starting-style` / `data-ending-style` hooks —
 *    creaseui emits no animation state attributes.
 *  - `prop: delay` describe (5 cases): `avatarFallback` has no delay prop and
 *    the DSL has no timers.
 *  - 'keeps only one of image or fallback mounted when switching to image':
 *    animation-end timing regression, Chromium-only.
 */

type AvatarStatus = 'loading' | 'loaded' | 'error'
type AvatarModel = Readonly<{ status: AvatarStatus }>
type AvatarMessage = Readonly<{ _tag: 'Loaded' } | { _tag: 'Failed' }>

type Model = Readonly<{
  avatar: AvatarModel
  src: string
  showImage: boolean
}>

type Message = Readonly<
  | { _tag: 'GotAvatarMessage'; message: AvatarMessage }
  | { _tag: 'HideImage' }
  | { _tag: 'SwapSrc'; src: string }
>

type AvatarModule = Readonly<{
  init: () => AvatarModel
  update: (model: AvatarModel, message: AvatarMessage) => AvatarModel
  Message: Readonly<{
    Loaded: () => AvatarMessage
    Failed: () => AvatarMessage
  }>
  avatar: <Msg>(
    props: Readonly<{
      size?: 'default' | 'sm' | 'lg'
      children: ReadonlyArray<Html | string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  avatarImage: <Msg>(
    props: Readonly<{ src: string; alt: string; model?: AvatarModel }> &
      Readonly<{ toParentMessage?: (message: AvatarMessage) => Msg }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  avatarFallback: <Msg>(
    props: Readonly<{
      children: ReadonlyArray<Html | string>
      model?: AvatarModel
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const initialModel = (status: AvatarStatus = 'loading'): Model => ({
  avatar: { status },
  src: 'avatar.png',
  showImage: true,
})

const makeUpdate =
  (Avatar: AvatarModule) =>
  (model: Model, message: Message): { model: Model } => {
    switch (message._tag) {
      case 'GotAvatarMessage':
        return {
          model: {
            ...model,
            avatar: Avatar.update(model.avatar, message.message),
          },
        }
      case 'HideImage':
        return { model: { ...model, showImage: false } }
      case 'SwapSrc':
        return { model: { ...model, src: message.src } }
    }
  }

const image = Scene.selector('[data-slot="avatar-image"]')
const fallback = Scene.selector('[data-slot="avatar-fallback"]')
const namedImage = Scene.role('img', { name: 'Jane Doe' })

// Standard wiring: <img> carries load/error handlers via toParentMessage and
// both parts read the shared Avatar.Model, exactly like the docs previews.
const avatarView =
  (Avatar: AvatarModule) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    Avatar.avatar(
      {
        children: [
          Avatar.avatarImage(
            {
              src: model.src,
              alt: 'Jane Doe',
              model: model.avatar,
              toParentMessage: message => ({
                _tag: 'GotAvatarMessage',
                message,
              }),
            },
            h,
          ),
          Avatar.avatarFallback({ model: model.avatar, children: ['JD'] }, h),
        ],
      },
      h,
    )

// Adds a 'Hide image' button that unmounts the <img>, mirroring the Base UI
// fixtures that toggle image presence.
const avatarViewWithToggle =
  (Avatar: AvatarModule) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.div(
      [],
      [
        h.button(
          [h.Type('button'), h.OnClick({ _tag: 'HideImage' })],
          ['Hide image'],
        ),
        Avatar.avatar(
          {
            children: [
              ...(model.showImage
                ? [
                    Avatar.avatarImage(
                      {
                        src: model.src,
                        alt: 'Jane Doe',
                        model: model.avatar,
                        toParentMessage: message => ({
                          _tag: 'GotAvatarMessage',
                          message,
                        }),
                      },
                      h,
                    ),
                  ]
                : []),
              Avatar.avatarFallback(
                { model: model.avatar, children: ['JD'] },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    )

const verifyRenderer = (name: string, Avatar: AvatarModule) => {
  const update = makeUpdate(Avatar)

  describe(`${name} Avatar (Base UI port)`, () => {
    describe('Avatar.Root', () => {
      // DIVERGENCE (documented): Base UI's Avatar.Root renders a <span>;
      // creaseui renders a <div data-slot="avatar">. Low severity — only
      // matters for element-level CSS selectors.
      it.fails('renders a <span> root', () => {
        Scene.scene(
          { update, view: avatarView(Avatar) },
          Scene.given(initialModel()),
          Scene.expect(Scene.selector('span[data-slot="avatar"]')).toExist(),
        )
      })
    })

    describe('Avatar.Image', () => {
      describe('prop: onLoadingStatusChange', () => {
        it('fires when the image loads', () => {
          // No load-event step exists in the DSL: assert the OnLoad wiring,
          // then feed the Message it would dispatch through update.
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toHaveHandler('load'),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Loaded(),
            }),
            Scene.expect(image).not.toHaveAttr('data-loading'),
            Scene.expect(namedImage).toExist(),
            Scene.expect(fallback).toBeAbsent(),
          )
        })

        it('fires when the image errors', () => {
          // Base UI's default (non-keepMounted) also unmounts the <img> on
          // error and shows the fallback — creaseui matches that path.
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toHaveHandler('error'),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Failed(),
            }),
            Scene.expect(image).toBeAbsent(),
            Scene.expect(fallback).toHaveText('JD'),
          )
        })

        it.todo(
          'fires for cached image errors without emitting idle — creaseui has ' +
            'no detached preload probe, no cached/complete detection, and no ' +
            "'idle' status (init is 'loading')",
        )
      })

      describe('prop: keepMounted', () => {
        it('mounts the image while loading without preloading it', () => {
          // creaseui only has the keepMounted rendering model: the <img> is
          // always in the tree while status !== 'error', flagged data-loading.
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toExist(),
            Scene.expect(image).toHaveAttr('src', 'avatar.png'),
            Scene.expect(image).toHaveAttr('data-loading', ''),
            Scene.expect(fallback).toHaveText('JD'),
          )
        })

        // DIVERGENCE: Base UI keepMounted keeps the <img> mounted with
        // data-error after a failed load. creaseui unmounts it (h.empty on
        // status 'error') and never emits data-error.
        it.fails('keeps the image mounted when it fails to load', () => {
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Failed(),
            }),
            Scene.expect(image).toExist(),
            Scene.expect(image).toHaveAttr('data-error', ''),
            Scene.expect(fallback).toHaveText('JD'),
          )
        })

        it('derives the status from the rendered element load event', () => {
          // Base UI derives status from the element's own load event; the
          // creaseui analogue is the OnLoad -> toParentMessage wiring.
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toHaveHandler('load'),
            Scene.expect(image).toHaveHandler('error'),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Loaded(),
            }),
            Scene.expect(fallback).toBeAbsent(),
          )
        })

        // DIVERGENCE: Base UI resets status to 'loading' when src changes.
        // creaseui's status is app-owned model state — nothing observes the
        // src prop, so a loaded avatar stays 'loaded' over a new image.
        it.fails('resets the status when the src prop changes', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                h.div(
                  [],
                  [
                    h.button(
                      [
                        h.Type('button'),
                        h.OnClick({ _tag: 'SwapSrc', src: 'avatar-2.png' }),
                      ],
                      ['Swap src'],
                    ),
                    avatarView(Avatar)(model, h),
                  ],
                ),
            },
            Scene.given(initialModel('loaded')),
            Scene.expect(fallback).toBeAbsent(),
            Scene.click(Scene.text('Swap src')),
            Scene.expectHandled(),
            // Base UI expectation: status reset to loading — data-loading
            // returns and the fallback reappears over the new image.
            Scene.expect(image).toHaveAttr('data-loading', ''),
            Scene.expect(image).toHaveAttr('src', 'avatar-2.png'),
            Scene.expect(fallback).toHaveText('JD'),
          )
        })

        // DIVERGENCE: Base UI sets aria-hidden="true" on the <img> in every
        // non-loaded state so only the fallback names the avatar. creaseui
        // only hides it visually (data-loading -> opacity-0) and leaves it
        // in the a11y tree.
        it.fails('hides the image from assistive technology until it loads', () => {
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toHaveAttr('aria-hidden', 'true'),
          )
        })

        // DIVERGENCE: same aria-hidden rule after error — and creaseui also
        // unmounts the <img> entirely.
        it.fails('keeps the image hidden from assistive technology after an error', () => {
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Failed(),
            }),
            Scene.expect(image).toExist(),
            Scene.expect(image).toHaveAttr('aria-hidden', 'true'),
          )
        })

        // DIVERGENCE: combines the two above — Base UI re-hides the <img>
        // (aria-hidden + data-loading) when src changes; creaseui keeps it
        // exposed under the stale 'loaded' status.
        it.fails('hides the image from assistive technology again when the source changes', () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                h.div(
                  [],
                  [
                    h.button(
                      [
                        h.Type('button'),
                        h.OnClick({ _tag: 'SwapSrc', src: 'avatar-2.png' }),
                      ],
                      ['Swap src'],
                    ),
                    avatarView(Avatar)(model, h),
                  ],
                ),
            },
            Scene.given(initialModel('loaded')),
            Scene.expect(image).not.toHaveAttr('aria-hidden'),
            Scene.click(Scene.text('Swap src')),
            Scene.expectHandled(),
            Scene.expect(image).toHaveAttr('aria-hidden', 'true'),
          )
        })

        // DIVERGENCE: Base UI resolves a cached image synchronously — the img
        // is available and the fallback never paints. creaseui always starts
        // 'loading', so the fallback renders until the load event arrives.
        it.fails('shows the image immediately for a cached src', () => {
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.expect(namedImage).toExist(),
            Scene.expect(fallback).toBeAbsent(),
          )
        })
      })

      describe('native image props', () => {
        it('passes src and alt to the rendered image', () => {
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loaded')),
            Scene.expect(namedImage).toExist(),
            Scene.expect(image).toHaveAttr('src', 'avatar.png'),
            Scene.expect(image).toHaveAttr('alt', 'Jane Doe'),
          )
        })

        it.todo(
          'passes native image props (crossOrigin, referrerPolicy, sizes, ' +
            'srcSet) to the rendered image — creaseui avatarImage exposes ' +
            'only src/alt/class/model',
        )

        it.todo(
          'shows the image when only srcSet is provided — creaseui has no ' +
            'srcSet prop',
        )

        it.todo(
          'passes responsive image props to the loading probe — creaseui ' +
            'has no detached preload probe; status comes only from ' +
            'rendered-element load/error events',
        )

        it.todo(
          'preserves an explicitly provided aria-hidden value — creaseui ' +
            'avatarImage does not accept aria props',
        )
      })
    })

    describe('Avatar.Fallback', () => {
      it('should not render the children if the image loaded', () => {
        Scene.scene(
          { update, view: avatarView(Avatar) },
          Scene.given(initialModel('loaded')),
          Scene.expect(fallback).toBeAbsent(),
          Scene.expect(namedImage).toExist(),
        )
      })

      it('should render the fallback if the image fails to load', () => {
        Scene.scene(
          { update, view: avatarView(Avatar) },
          Scene.given(initialModel('error')),
          Scene.expect(fallback).toHaveText('JD'),
          Scene.expect(image).toBeAbsent(),
        )
      })

      // DIVERGENCE: in Base UI the status lives in root context, so
      // unmounting Avatar.Image reverts it to 'idle' and the fallback
      // reappears. creaseui's status is app-owned: unmounting the <img>
      // leaves model.status 'loaded' and the fallback hidden.
      it.fails('shows the fallback when a loaded image is unmounted', () => {
        Scene.scene(
          { update, view: avatarViewWithToggle(Avatar) },
          Scene.given(initialModel('loaded')),
          Scene.expect(fallback).toBeAbsent(),
          Scene.click(Scene.text('Hide image')),
          Scene.expectHandled(),
          Scene.expect(image).toBeAbsent(),
          Scene.expect(fallback).toHaveText('JD'),
        )
      })

      // DIVERGENCE: Base UI's default keeps the <img> unmounted until loaded.
      // creaseui always mounts it (keepMounted-style) with data-loading.
      it.fails('keeps fallback mounted and image unmounted while the image is loading', () => {
        Scene.scene(
          { update, view: avatarView(Avatar) },
          Scene.given(initialModel('loading')),
          Scene.expect(fallback).toHaveText('JD'),
          Scene.expect(image).toBeAbsent(),
        )
      })

      it.todo(
        'prop: delay — creaseui avatarFallback has no delay prop, and the ' +
          'scene DSL has no timers (5 Base UI cases)',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindAvatar)
verifyRenderer('StyleX', StyleXAvatar)
