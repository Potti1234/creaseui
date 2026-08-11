import { Match as M, Schema as S } from 'effect';
import type { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import * as Icon from '@/demo/icon-preview';
import { button } from '@/ui/button';
import {
  card,
  cardContent,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/ui/card';
import { field, fieldGroup, fieldLabel } from '@/ui/field';
import { inputGroup, inputGroupAddon, inputGroupInput } from '@/ui/input-group';

export const Model = S.Struct({
  spotifyUrl: S.String,
  instagramHandle: S.String,
  soundcloudUrl: S.String,
  websiteUrl: S.String,
});
export type Model = typeof Model.Type;

export const UpdatedSpotifyUrl = m('UpdatedSpotifyUrl', {
  value: S.String,
});
export const UpdatedInstagramHandle = m('UpdatedInstagramHandle', {
  value: S.String,
});
export const UpdatedSoundcloudUrl = m('UpdatedSoundcloudUrl', {
  value: S.String,
});
export const UpdatedWebsiteUrl = m('UpdatedWebsiteUrl', {
  value: S.String,
});
export const Message = S.Union([
  UpdatedSpotifyUrl,
  UpdatedInstagramHandle,
  UpdatedSoundcloudUrl,
  UpdatedWebsiteUrl,
]);
export type Message = typeof Message.Type;

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const init = (): Model => ({
  spotifyUrl: 'spotify.com/artist/3j...2k',
  instagramHandle: '@julianduryea_music',
  soundcloudUrl: '',
  websiteUrl: '',
});

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      UpdatedSpotifyUrl: ({ value }) => [{ ...model, spotifyUrl: value }, []],
      UpdatedInstagramHandle: ({ value }) => [
        { ...model, instagramHandle: value },
        [],
      ],
      UpdatedSoundcloudUrl: ({ value }) => [
        { ...model, soundcloudUrl: value },
        [],
      ],
      UpdatedWebsiteUrl: ({ value }) => [{ ...model, websiteUrl: value }, []],
    }),
  );

type SocialFieldProps = Readonly<{
  id: string;
  label: string;
  icon: string;
  value: string;
  onInput: (value: string) => Message;
  placeholder?: string;
}>;

const socialField = (props: SocialFieldProps, h: HtmlBuilder<Message>): Html =>
  field(
    {
      children: [
        fieldLabel({ for: props.id, children: [props.label] }, h),
        inputGroup(
          {
            children: [
              inputGroupAddon(
                {
                  children: [Icon.icon<Message>(props.icon, {}, h)],
                },
                h,
              ),
              inputGroupInput(
                {
                  id: props.id,
                  value: props.value,
                  onInput: props.onInput,
                  ...(props.placeholder === undefined
                    ? {}
                    : { placeholder: props.placeholder }),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  card(
    {
      children: [
        cardHeader(
          {
            children: [cardTitle({ children: ['Social Links'] }, h)],
          },
          h,
        ),
        cardContent(
          {
            children: [
              fieldGroup(
                {
                  class: 'gap-5',
                  children: [
                    socialField(
                      {
                        id: 'spotify-url',
                        label: 'Spotify Artist URL',
                        icon: 'circle-plus',
                        value: model.spotifyUrl,
                        onInput: (value) => UpdatedSpotifyUrl({ value }),
                      },
                      h,
                    ),
                    socialField(
                      {
                        id: 'instagram-handle',
                        label: 'Instagram Handle',
                        icon: 'camera',
                        value: model.instagramHandle,
                        onInput: (value) => UpdatedInstagramHandle({ value }),
                      },
                      h,
                    ),
                    socialField(
                      {
                        id: 'soundcloud-url',
                        label: 'SoundCloud URL',
                        icon: 'cloud',
                        value: model.soundcloudUrl,
                        onInput: (value) => UpdatedSoundcloudUrl({ value }),
                        placeholder: 'soundcloud.com/username',
                      },
                      h,
                    ),
                    socialField(
                      {
                        id: 'website-url',
                        label: 'Website',
                        icon: 'globe',
                        value: model.websiteUrl,
                        onInput: (value) => UpdatedWebsiteUrl({ value }),
                        placeholder: 'https://yoursite.com',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        cardFooter(
          {
            class: 'justify-end gap-2',
            children: [
              button({ variant: 'secondary', children: ['Discard'] }, h),
              button({ children: ['Save Changes'] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

/*
Minimal wiring:
const model = init()
const [nextModel, commands] = update(model, message)
const cardView = view(model)
*/
// Stateful? yes. Submodels wired: none (local controlled inputs). PORT NOTEs: style-sera classes stripped.
