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
 * there is no 'idle') and feeds it to `avatarImage`/`avatarFallback` as a
 * prop, with `toParentMessage` wiring the <img> load/error events.
 *
 * creaseui mirrors Base UI's two resolution paths:
 *  - default (`keepMounted: false`): the real <img> mounts only once the
 *    status is 'loaded'. A hidden `[data-slot="avatar-image-probe"]` <img>
 *    loads in its place — the analogue of Base UI's detached
 *    `new window.Image()` preload — and reports load/error through
 *    `toParentMessage`.
 *  - `keepMounted: true`: the <img> stays mounted and reports its own
 *    load/error; non-loaded states carry `data-loading`/`data-error` and
 *    `aria-hidden` so only the fallback names the avatar.
 *
 * Base UI resets the status when the requested source changes. creaseui
 * derives that reset: `Avatar.Model.resolvedSrc` records the source a
 * Loaded/Failed Message resolved, and the views treat a `src` mismatch as
 * 'loading' (unmounting the image likewise returns the app-owned Model to
 * `Avatar.init()`, mirroring Base UI's unmount -> 'idle' cleanup).
 *
 * The scene DSL has no `load`/`error` event step, so the tests assert the
 * OnLoad/OnError handler wiring and then feed the Message those handlers
 * would dispatch through `Scene.Subscription.emit`. There is also no
 * `complete`/`naturalWidth` to inspect, so synchronous "cached image"
 * resolution is modeled by feeding the resolution Message the detached
 * probe would have reported.
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
type AvatarModel = Readonly<{ status: AvatarStatus; resolvedSrc?: string }>
type AvatarMessage = Readonly<
  | { _tag: 'Loaded'; src: string }
  | { _tag: 'Failed'; src: string }
>

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
    Loaded: (fields: Readonly<{ src: string }>) => AvatarMessage
    Failed: (fields: Readonly<{ src: string }>) => AvatarMessage
  }>
  avatar: <Msg>(
    props: Readonly<{ size?: 'default' | 'sm' | 'lg'; children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  avatarImage: <Msg>(
    props: Readonly<{
      src: string
      alt: string
      model?: AvatarModel
      keepMounted?: boolean
    }> &
      Readonly<{ toParentMessage?: (message: AvatarMessage) => Msg }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  avatarFallback: <Msg>(
    props: Readonly<{
      children: ReadonlyArray<Html | string>
      model?: AvatarModel
      src?: string
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const initialModel = (status: AvatarStatus = 'loading'): Model => ({
  avatar: {
    status,
    // A resolved Model records the source it resolved for — the same
    // resolvedSrc the Loaded/Failed({ src }) Messages would have stored.
    ...(status === 'loading' ? {} : { resolvedSrc: 'avatar.png' }),
  },
  src: 'avatar.png',
  showImage: true,
})

const makeUpdate =
  (Avatar: AvatarModule) =>
  (model: Model, message: Message): { model: Model } => {
    switch (message._tag) {
      case 'GotAvatarMessage':
        return {
          model: { ...model, avatar: Avatar.update(model.avatar, message.message) },
        }
      case 'HideImage':
        // Base UI's Avatar.Image unmount resets the root status to 'idle';
        // the app-owned Model resets the same way when the image leaves.
        return { model: { ...model, showImage: false, avatar: Avatar.init() } }
      case 'SwapSrc':
        return { model: { ...model, src: message.src } }
    }
  }

const image = Scene.selector('[data-slot="avatar-image"]')
const probe = Scene.selector('[data-slot="avatar-image-probe"]')
const fallback = Scene.selector('[data-slot="avatar-fallback"]')
const namedImage = Scene.role('img', { name: 'Jane Doe' })

// Standard wiring: load/error handlers reach the app via toParentMessage and
// both parts read the shared Avatar.Model, exactly like the docs previews.
// `keepMounted` selects Base UI's two rendering modes.
const avatarView =
  (Avatar: AvatarModule, options?: Readonly<{ keepMounted?: boolean }>) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    Avatar.avatar(
      {
        children: [
          Avatar.avatarImage(
            {
              src: model.src,
              alt: 'Jane Doe',
              model: model.avatar,
              ...(options?.keepMounted === true ? { keepMounted: true } : {}),
              toParentMessage: message => ({
                _tag: 'GotAvatarMessage',
                message,
              }),
            },
            h,
          ),
          Avatar.avatarFallback(
            { model: model.avatar, src: model.src, children: ['JD'] },
            h,
          ),
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
                { model: model.avatar, src: model.src, children: ['JD'] },
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
      it('renders a <span> root', () => {
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
          // No load-event step exists in the DSL: assert the OnLoad wiring on
          // the hidden probe <img> (Base UI's detached preload analogue),
          // then feed the Message it would dispatch through update.
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toBeAbsent(),
            Scene.expect(probe).toHaveHandler('load'),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Loaded({ src: 'avatar.png' }),
            }),
            Scene.expect(image).not.toHaveAttr('data-loading'),
            Scene.expect(probe).toBeAbsent(),
            Scene.expect(namedImage).toExist(),
            Scene.expect(fallback).toBeAbsent(),
          )
        })

        it('fires when the image errors', () => {
          // Base UI's default (non-keepMounted) keeps the <img> unmounted on
          // error and shows the fallback — creaseui matches that path.
          Scene.scene(
            { update, view: avatarView(Avatar) },
            Scene.given(initialModel('loading')),
            Scene.expect(probe).toHaveHandler('error'),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Failed({ src: 'avatar.png' }),
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
          // keepMounted mounts the <img> in place and flags it data-loading;
          // no probe is rendered (Base UI's `imageMock.images.length === 0`).
          Scene.scene(
            { update, view: avatarView(Avatar, { keepMounted: true }) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toExist(),
            Scene.expect(image).toHaveAttr('src', 'avatar.png'),
            Scene.expect(image).toHaveAttr('data-loading', ''),
            Scene.expect(probe).toBeAbsent(),
            Scene.expect(fallback).toHaveText('JD'),
          )
        })

        it('keeps the image mounted when it fails to load', () => {
          Scene.scene(
            { update, view: avatarView(Avatar, { keepMounted: true }) },
            Scene.given(initialModel('loading')),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Failed({ src: 'avatar.png' }),
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
            { update, view: avatarView(Avatar, { keepMounted: true }) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toHaveHandler('load'),
            Scene.expect(image).toHaveHandler('error'),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Loaded({ src: 'avatar.png' }),
            }),
            Scene.expect(fallback).toBeAbsent(),
          )
        })

        it('resets the status when the src prop changes', () => {
          // The reset is derived: the Model's resolvedSrc ('avatar.png') no
          // longer matches the requested src, so the effective status is
          // 'loading' — data-loading returns and the fallback reappears.
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
                    avatarView(Avatar, { keepMounted: true })(model, h),
                  ],
                ),
            },
            Scene.given(initialModel('loaded')),
            Scene.expect(fallback).toBeAbsent(),
            Scene.click(Scene.text('Swap src')),
            Scene.expectHandled(),
            Scene.expect(image).toHaveAttr('data-loading', ''),
            Scene.expect(image).toHaveAttr('src', 'avatar-2.png'),
            Scene.expect(fallback).toHaveText('JD'),
          )
        })

        it('hides the image from assistive technology until it loads', () => {
          Scene.scene(
            { update, view: avatarView(Avatar, { keepMounted: true }) },
            Scene.given(initialModel('loading')),
            Scene.expect(image).toHaveAttr('aria-hidden', 'true'),
          )
        })

        it('keeps the image hidden from assistive technology after an error', () => {
          Scene.scene(
            { update, view: avatarView(Avatar, { keepMounted: true }) },
            Scene.given(initialModel('loading')),
            Scene.Subscription.emit({
              _tag: 'GotAvatarMessage',
              message: Avatar.Message.Failed({ src: 'avatar.png' }),
            }),
            Scene.expect(image).toExist(),
            Scene.expect(image).toHaveAttr('aria-hidden', 'true'),
          )
        })

        it('hides the image from assistive technology again when the source changes', () => {
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
                    avatarView(Avatar, { keepMounted: true })(model, h),
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
      })

      it('shows the image immediately for a cached src', () => {
        // Base UI resolves a cached image synchronously — the img is
        // available and the fallback never paints. The DSL has no `complete`
        // to inspect, so the emit stands in for the probe reporting before
        // the next render.
        Scene.scene(
          { update, view: avatarView(Avatar) },
          Scene.given(initialModel('loading')),
          Scene.expect(probe).toHaveHandler('load'),
          Scene.Subscription.emit({
            _tag: 'GotAvatarMessage',
            message: Avatar.Message.Loaded({ src: 'avatar.png' }),
          }),
          Scene.expect(namedImage).toExist(),
          Scene.expect(fallback).toBeAbsent(),
        )
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
            'only src/alt/class/model/keepMounted',
        )

        it.todo(
          'shows the image when only srcSet is provided — creaseui has no ' +
            'srcSet prop',
        )

        it.todo(
          'passes responsive image props (sizes, srcSet) to the loading ' +
            'probe — creaseui avatarImage exposes only src/alt',
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

      // Base UI's unmount cleanup resets the root status to 'idle'; the
      // app-owned Model does the same — the fixture's HideImage resets it to
      // Avatar.init().
      it('shows the fallback when a loaded image is unmounted', () => {
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

      it('keeps fallback mounted and image unmounted while the image is loading', () => {
        // Base UI's default keeps the <img> unmounted until loaded — only
        // the hidden probe is in the tree.
        Scene.scene(
          { update, view: avatarView(Avatar) },
          Scene.given(initialModel('loading')),
          Scene.expect(fallback).toHaveText('JD'),
          Scene.expect(image).toBeAbsent(),
          Scene.expect(probe).toExist(),
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
