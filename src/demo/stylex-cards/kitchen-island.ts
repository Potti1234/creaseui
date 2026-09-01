import { Match as M, Option, Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import * as stylex from '@stylexjs/stylex'
import { Switch as SwitchPrimitive } from '@foldkit/ui'

import * as Icon from '@/demo/icon-preview';
import {
  card,
  cardAction,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitle,
} from '@/stylex/card';
import * as Slider from '@/stylex/slider';
import * as Switch from '@/stylex/switch';
import { toggleGroup } from '@/stylex/toggle-group';
import { className } from '@/stylex/style'
import { foundationTokens } from '../../stylex/foundations-tokens.stylex'
import { tokens } from '../../stylex/tokens.stylex'
import { interactionCardTokens } from './interaction-card-tokens.stylex'
import { interactionTokens } from '../../stylex/interaction-tokens.stylex.const'

const styles = stylex.create({
  body: { gap: '1rem', display: 'flex', flexDirection: 'column', },
  control: { flexGrow: 1 },
  icon: {
    borderColor: tokens.border,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    display: 'flex',
    justifyContent: 'center',
    height: '1rem',
    width: '1rem',
  },
  iconGlyph: { display: 'inline-flex', flexShrink: 0, height: '1rem', width: '1rem' },
  label: { flexShrink: 0, fontSize: '0.875rem', fontWeight: 500 },
  scenes: { gap: '0.5rem', display: 'flex', flexDirection: 'column', },
  setting: {
    borderColor: tokens.border,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    gap: '0.75rem',
    paddingBlock: '0.625rem',
    paddingInline: '0.75rem',
    alignItems: 'center',
    display: 'flex',
  },
  settings: { gap: '0.625rem', display: 'flex', flexDirection: 'column', },
  srOnly: {
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
  switchControl: {
    borderColor: { default: foundationTokens.transparent, ':focus-visible': tokens.ring },
    borderRadius: interactionCardTokens.roundRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: tokens.input,
    boxShadow: { default: foundationTokens.shadowXs, ':focus-visible': tokens.focusRingShadow },
    display: 'inline-flex',
    outlineStyle: 'none',
    height: '1.15rem',
    width: '2rem',
  },
  switchChecked: { backgroundColor: tokens.primary },
  switchRow: { alignItems: 'center', display: 'flex' },
  switchThumb: {
    borderRadius: interactionCardTokens.roundRadius,
    backgroundColor: tokens.background,
    display: 'block',
    pointerEvents: 'none',
    transform: 'translateX(0)',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'transform',
    height: '1rem',
    width: '1rem',
  },
  switchThumbChecked: { transform: 'translateX(calc(100% - 2px))' },
})

type ScenePreset = Readonly<{
  brightness: number;
  colorTemp: number;
  volume: number;
  fade: number;
}>;

const scenePreset = (scene: string): ScenePreset | undefined => {
  switch (scene) {
    case 'cooking':
      return { brightness: 90, colorTemp: 70, volume: 30, fade: 0 };
    case 'dining':
      return { brightness: 50, colorTemp: 40, volume: 20, fade: 60 };
    case 'nightlight':
      return { brightness: 15, colorTemp: 20, volume: 0, fade: 80 };
    case 'focus':
      return { brightness: 100, colorTemp: 85, volume: 0, fade: 0 };
    default:
      return undefined;
  }
};

export const Model = S.Struct({
  isEnabled: S.Boolean,
  scene: S.String,
  brightness: Slider.Model,
  brightnessValue: S.Number,
  colorTemp: Slider.Model,
  colorTempValue: S.Number,
  volume: Slider.Model,
  volumeValue: S.Number,
  fade: Slider.Model,
  fadeValue: S.Number,
});
export type Model = typeof Model.Type;

export const ToggledEnabled = m('ToggledEnabled', { isChecked: S.Boolean });
export const SelectedScene = m('SelectedScene', { value: S.String });
export const GotBrightnessMessage = m('GotBrightnessMessage', {
  message: Slider.Message,
});
export const GotColorTempMessage = m('GotColorTempMessage', {
  message: Slider.Message,
});
export const GotVolumeMessage = m('GotVolumeMessage', {
  message: Slider.Message,
});
export const GotFadeMessage = m('GotFadeMessage', {
  message: Slider.Message,
});

export const Message = S.Union([
  ToggledEnabled,
  SelectedScene,
  GotBrightnessMessage,
  GotColorTempMessage,
  GotVolumeMessage,
  GotFadeMessage,
]);
export type Message = typeof Message.Type;

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const init = (): Model => ({
  isEnabled: true,
  scene: 'cooking',
  brightness: Slider.init({
    id: 'kitchen-island-brightness',
    min: 0,
    max: 100,
    step: 1,
  }),
  brightnessValue: 90,
  colorTemp: Slider.init({
    id: 'kitchen-island-color-temp',
    min: 0,
    max: 100,
    step: 1,
  }),
  colorTempValue: 70,
  volume: Slider.init({
    id: 'kitchen-island-volume',
    min: 0,
    max: 100,
    step: 1,
  }),
  volumeValue: 30,
  fade: Slider.init({
    id: 'kitchen-island-fade',
    min: 0,
    max: 100,
    step: 1,
  }),
  fadeValue: 0,
});

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ToggledEnabled: ({ isChecked }) => [
        { ...model, isEnabled: isChecked },
        [],
      ],
      SelectedScene: ({ value }) => {
        const preset = scenePreset(value);
        return preset === undefined
          ? [model, []]
          : [
              {
                ...model,
                scene: value,
                brightnessValue: preset.brightness,
                colorTempValue: preset.colorTemp,
                volumeValue: preset.volume,
                fadeValue: preset.fade,
              },
              [],
            ];
      },
      GotBrightnessMessage: ({ message: childMessage }) => {
        const [brightness, commands, maybeChange] = Slider.update(
          model.brightness,
          childMessage,
        );
        return [
          {
            ...model,
            brightness,
            brightnessValue: Option.match(maybeChange, {
              onNone: () => model.brightnessValue,
              onSome: (change) => change.value,
            }),
          },
          Command.mapMessages(commands, (next) =>
            GotBrightnessMessage({ message: next }),
          ),
        ];
      },
      GotColorTempMessage: ({ message: childMessage }) => {
        const [colorTemp, commands, maybeChange] = Slider.update(
          model.colorTemp,
          childMessage,
        );
        return [
          {
            ...model,
            colorTemp,
            colorTempValue: Option.match(maybeChange, {
              onNone: () => model.colorTempValue,
              onSome: (change) => change.value,
            }),
          },
          Command.mapMessages(commands, (next) =>
            GotColorTempMessage({ message: next }),
          ),
        ];
      },
      GotVolumeMessage: ({ message: childMessage }) => {
        const [volume, commands, maybeChange] = Slider.update(
          model.volume,
          childMessage,
        );
        return [
          {
            ...model,
            volume,
            volumeValue: Option.match(maybeChange, {
              onNone: () => model.volumeValue,
              onSome: (change) => change.value,
            }),
          },
          Command.mapMessages(commands, (next) =>
            GotVolumeMessage({ message: next }),
          ),
        ];
      },
      GotFadeMessage: ({ message: childMessage }) => {
        const [fade, commands, maybeChange] = Slider.update(
          model.fade,
          childMessage,
        );
        return [
          {
            ...model,
            fade,
            fadeValue: Option.match(maybeChange, {
              onNone: () => model.fadeValue,
              onSome: (change) => change.value,
            }),
          },
          Command.mapMessages(commands, (next) =>
            GotFadeMessage({ message: next }),
          ),
        ];
      },
    }),
  );

const setting = (
  iconName: string,
  title: string,
  control: Html,
  h: HtmlBuilder<Message>,
): Html => {
  return h.div([h.Class(className(styles.setting))], [
    h.span([h.Class(className(styles.icon))], [
      Icon.icon(iconName, { class: className(styles.iconGlyph) }, h),
    ]),
    h.span([h.Class(className(styles.label))], [title]),
    h.div([h.Class(className(styles.control))], [control]),
  ]);
};

const enabledSwitch = (model: Model, h: HtmlBuilder<Message>): Html =>
  SwitchPrimitive.view(
    {
      id: 'kitchen-island-enabled',
      isChecked: model.isEnabled,
      isDisabled: false,
      onToggle: (isChecked) => ToggledEnabled({ isChecked }),
      toView: ({ button, label }) =>
        h.div([h.Class(className(styles.switchRow))], [
          h.button(
            [
              ...button,
              h.Type('button'),
              h.DataAttribute('slot', 'switch'),
              h.Class(
                className(
                  styles.switchControl,
                  model.isEnabled && styles.switchChecked,
                ),
              ),
            ],
            [
              h.span(
                [
                  h.DataAttribute('slot', 'switch-thumb'),
                  h.Class(
                    className(
                      styles.switchThumb,
                      model.isEnabled && styles.switchThumbChecked,
                    ),
                  ),
                ],
                [],
              ),
            ],
          ),
          h.label([...label, h.Class(className(styles.srOnly))], [
            'Kitchen Island enabled',
          ]),
        ]),
    },
    h,
  )

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const isDisabled = !model.isEnabled;

  return card(
    {
      children: [
        cardHeader(
          {
            children: [
              cardTitle({ children: ['Kitchen Island'] }, h),
              cardDescription({ children: ['Hue Color Ambient'] }, h),
              cardAction(
                {
                  children: [enabledSwitch(model, h)],
                },
                h,
              ),
            ],
          },
          h,
        ),
        cardContent(
          {
            children: [
              h.div([h.Class(className(styles.body))], [
              h.div(
                [h.Class(className(styles.scenes))],
                [
                  h.span([h.Class(className(styles.srOnly))], ['Scenes']),
                  toggleGroup(
                    {
                      value: model.scene,
                      onToggle: (value) => SelectedScene({ value }),
                      arrangement: 'wrapped',
                      variant: 'outline',
                      items: [
                        {
                          value: 'cooking',
                          children: ['Cooking'],
                          isDisabled,
                        },
                        {
                          value: 'dining',
                          children: ['Dining'],
                          isDisabled,
                        },
                        {
                          value: 'nightlight',
                          children: ['Nightlight'],
                          isDisabled,
                        },
                        {
                          value: 'focus',
                          children: ['Focus'],
                          isDisabled,
                        },
                      ],
                    },
                    h,
                  ),
                ],
              ),
              h.div([h.Class(className(styles.settings))], [
                    setting(
                      'sun',
                      'Brightness',
                      Slider.slider(
                        {
                          model: model.brightness,
                          value: model.brightnessValue,
                          toParentMessage: (message) =>
                            GotBrightnessMessage({ message }),
                          ariaLabel: 'Brightness',
                          isDisabled,
                        },
                        h,
                      ),
                      h,
                    ),
                    setting(
                      'thermometer',
                      'Color Temp',
                      Slider.slider(
                        {
                          model: model.colorTemp,
                          value: model.colorTempValue,
                          toParentMessage: (message) =>
                            GotColorTempMessage({ message }),
                          ariaLabel: 'Color Temp',
                          isDisabled,
                        },
                        h,
                      ),
                      h,
                    ),
                    setting(
                      'volume-2',
                      'Volume',
                      Slider.slider(
                        {
                          model: model.volume,
                          value: model.volumeValue,
                          toParentMessage: (message) =>
                            GotVolumeMessage({ message }),
                          ariaLabel: 'Volume',
                          isDisabled,
                        },
                        h,
                      ),
                      h,
                    ),
                    setting(
                      'timer',
                      'Fade',
                      Slider.slider(
                        {
                          model: model.fade,
                          value: model.fadeValue,
                          toParentMessage: (message) =>
                            GotFadeMessage({ message }),
                          ariaLabel: 'Fade',
                          isDisabled,
                        },
                        h,
                      ),
                      h,
                    ),
              ]),
              ]),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );
};

/*
Minimal wiring:
const model = init()
const [nextModel, commands] = update(model, message)
const cardView = view(model)
*/
// Stateful? yes. Submodels wired: switch and four sliders. PORT NOTEs: visually hidden switch label.

// SUBSCRIPTIONS — slider drag needs document-level pointer subscriptions.

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift({
    brightnessPointer: Slider.subscriptions.dragPointer,
    brightnessEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>({
    toChildModel: (model) => model.brightness,
    toParentMessage: (message) => GotBrightnessMessage({ message }),
  }),
  Subscription.lift({
    colorTempPointer: Slider.subscriptions.dragPointer,
    colorTempEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>({
    toChildModel: (model) => model.colorTemp,
    toParentMessage: (message) => GotColorTempMessage({ message }),
  }),
  Subscription.lift({
    volumePointer: Slider.subscriptions.dragPointer,
    volumeEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>({
    toChildModel: (model) => model.volume,
    toParentMessage: (message) => GotVolumeMessage({ message }),
  }),
  Subscription.lift({
    fadePointer: Slider.subscriptions.dragPointer,
    fadeEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>({
    toChildModel: (model) => model.fade,
    toParentMessage: (message) => GotFadeMessage({ message }),
  }),
);

