import { Match as M, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { defineView } from 'foldkit/submodel';
import { evo } from 'foldkit/struct';

import * as B01 from '@/demo/blocks/sidebar-01';
import * as B02 from '@/demo/blocks/sidebar-02';
import * as B03 from '@/demo/blocks/sidebar-03';
import * as B04 from '@/demo/blocks/sidebar-04';
import * as B05 from '@/demo/blocks/sidebar-05';
import * as B06 from '@/demo/blocks/sidebar-06';
import * as B07 from '@/demo/blocks/sidebar-07';
import * as B08 from '@/demo/blocks/sidebar-08';
import * as B09 from '@/demo/blocks/sidebar-09';
import * as B10 from '@/demo/blocks/sidebar-10';
import * as B11 from '@/demo/blocks/sidebar-11';
import * as B12 from '@/demo/blocks/sidebar-12';
import * as B13 from '@/demo/blocks/sidebar-13';
import * as B14 from '@/demo/blocks/sidebar-14';
import * as B15 from '@/demo/blocks/sidebar-15';
import * as B16 from '@/demo/blocks/sidebar-16';

/* One submodel wrapping all 16 sidebar blocks so main.ts wires a single field.
   Each block module owns its Elm quadruple; this file only aggregates. */

// MODEL

export const Model = S.Struct({
  b01: B01.Model,
  b02: B02.Model,
  b03: B03.Model,
  b04: B04.Model,
  b05: B05.Model,
  b06: B06.Model,
  b07: B07.Model,
  b08: B08.Model,
  b09: B09.Model,
  b10: B10.Model,
  b11: B11.Model,
  b12: B12.Model,
  b13: B13.Model,
  b14: B14.Model,
  b15: B15.Model,
  b16: B16.Model,
});
export type Model = typeof Model.Type;

// MESSAGE

export const GotB01 = m('GotB01', { message: B01.Message });
export const GotB02 = m('GotB02', { message: B02.Message });
export const GotB03 = m('GotB03', { message: B03.Message });
export const GotB04 = m('GotB04', { message: B04.Message });
export const GotB05 = m('GotB05', { message: B05.Message });
export const GotB06 = m('GotB06', { message: B06.Message });
export const GotB07 = m('GotB07', { message: B07.Message });
export const GotB08 = m('GotB08', { message: B08.Message });
export const GotB09 = m('GotB09', { message: B09.Message });
export const GotB10 = m('GotB10', { message: B10.Message });
export const GotB11 = m('GotB11', { message: B11.Message });
export const GotB12 = m('GotB12', { message: B12.Message });
export const GotB13 = m('GotB13', { message: B13.Message });
export const GotB14 = m('GotB14', { message: B14.Message });
export const GotB15 = m('GotB15', { message: B15.Message });
export const GotB16 = m('GotB16', { message: B16.Message });

export const Message = S.Union([
  GotB01,
  GotB02,
  GotB03,
  GotB04,
  GotB05,
  GotB06,
  GotB07,
  GotB08,
  GotB09,
  GotB10,
  GotB11,
  GotB12,
  GotB13,
  GotB14,
  GotB15,
  GotB16,
]);
export type Message = typeof Message.Type;

// INIT

export const init = (): Model => ({
  b01: B01.init(),
  b02: B02.init(),
  b03: B03.init(),
  b04: B04.init(),
  b05: B05.init(),
  b06: B06.init(),
  b07: B07.init(),
  b08: B08.init(),
  b09: B09.init(),
  b10: B10.init(),
  b11: B11.init(),
  b12: B12.init(),
  b13: B13.init(),
  b14: B14.init(),
  b15: B15.init(),
  b16: B16.init(),
});

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotB01: ({ message: child }) => {
        const [next, commands] = B01.update(model.b01, child);
        return [
          evo(model, { b01: () => next }),
          Command.mapMessages(commands, (inner) => GotB01({ message: inner })),
        ];
      },
      GotB02: ({ message: child }) => {
        const [next, commands] = B02.update(model.b02, child);
        return [
          evo(model, { b02: () => next }),
          Command.mapMessages(commands, (inner) => GotB02({ message: inner })),
        ];
      },
      GotB03: ({ message: child }) => {
        const [next, commands] = B03.update(model.b03, child);
        return [
          evo(model, { b03: () => next }),
          Command.mapMessages(commands, (inner) => GotB03({ message: inner })),
        ];
      },
      GotB04: ({ message: child }) => {
        const [next, commands] = B04.update(model.b04, child);
        return [
          evo(model, { b04: () => next }),
          Command.mapMessages(commands, (inner) => GotB04({ message: inner })),
        ];
      },
      GotB05: ({ message: child }) => {
        const [next, commands] = B05.update(model.b05, child);
        return [
          evo(model, { b05: () => next }),
          Command.mapMessages(commands, (inner) => GotB05({ message: inner })),
        ];
      },
      GotB06: ({ message: child }) => {
        const [next, commands] = B06.update(model.b06, child);
        return [
          evo(model, { b06: () => next }),
          Command.mapMessages(commands, (inner) => GotB06({ message: inner })),
        ];
      },
      GotB07: ({ message: child }) => {
        const [next, commands] = B07.update(model.b07, child);
        return [
          evo(model, { b07: () => next }),
          Command.mapMessages(commands, (inner) => GotB07({ message: inner })),
        ];
      },
      GotB08: ({ message: child }) => {
        const [next, commands] = B08.update(model.b08, child);
        return [
          evo(model, { b08: () => next }),
          Command.mapMessages(commands, (inner) => GotB08({ message: inner })),
        ];
      },
      GotB09: ({ message: child }) => {
        const [next, commands] = B09.update(model.b09, child);
        return [
          evo(model, { b09: () => next }),
          Command.mapMessages(commands, (inner) => GotB09({ message: inner })),
        ];
      },
      GotB10: ({ message: child }) => {
        const [next, commands] = B10.update(model.b10, child);
        return [
          evo(model, { b10: () => next }),
          Command.mapMessages(commands, (inner) => GotB10({ message: inner })),
        ];
      },
      GotB11: ({ message: child }) => {
        const [next, commands] = B11.update(model.b11, child);
        return [
          evo(model, { b11: () => next }),
          Command.mapMessages(commands, (inner) => GotB11({ message: inner })),
        ];
      },
      GotB12: ({ message: child }) => {
        const [next, commands] = B12.update(model.b12, child);
        return [
          evo(model, { b12: () => next }),
          Command.mapMessages(commands, (inner) => GotB12({ message: inner })),
        ];
      },
      GotB13: ({ message: child }) => {
        const [next, commands] = B13.update(model.b13, child);
        return [
          evo(model, { b13: () => next }),
          Command.mapMessages(commands, (inner) => GotB13({ message: inner })),
        ];
      },
      GotB14: ({ message: child }) => {
        const [next, commands] = B14.update(model.b14, child);
        return [
          evo(model, { b14: () => next }),
          Command.mapMessages(commands, (inner) => GotB14({ message: inner })),
        ];
      },
      GotB15: ({ message: child }) => {
        const [next, commands] = B15.update(model.b15, child);
        return [
          evo(model, { b15: () => next }),
          Command.mapMessages(commands, (inner) => GotB15({ message: inner })),
        ];
      },
      GotB16: ({ message: child }) => {
        const [next, commands] = B16.update(model.b16, child);
        return [
          evo(model, { b16: () => next }),
          Command.mapMessages(commands, (inner) => GotB16({ message: inner })),
        ];
      },
    }),
  );

// VIEW

const v01 = defineView<B01.Model, B01.Message>(B01.view);
const v02 = defineView<B02.Model, B02.Message>(B02.view);
const v03 = defineView<B03.Model, B03.Message>(B03.view);
const v04 = defineView<B04.Model, B04.Message>(B04.view);
const v05 = defineView<B05.Model, B05.Message>(B05.view);
const v06 = defineView<B06.Model, B06.Message>(B06.view);
const v07 = defineView<B07.Model, B07.Message>(B07.view);
const v08 = defineView<B08.Model, B08.Message>(B08.view);
const v09 = defineView<B09.Model, B09.Message>(B09.view);
const v10 = defineView<B10.Model, B10.Message>(B10.view);
const v11 = defineView<B11.Model, B11.Message>(B11.view);
const v12 = defineView<B12.Model, B12.Message>(B12.view);
const v13 = defineView<B13.Model, B13.Message>(B13.view);
const v14 = defineView<B14.Model, B14.Message>(B14.view);
const v15 = defineView<B15.Model, B15.Message>(B15.view);
const v16 = defineView<B16.Model, B16.Message>(B16.view);

const withHtml = M.withReturnType<Html>();

export const view = (
  model: Model,
  blockId: string,
  h: HtmlBuilder<Message>,
): Html => {
  const embed = <ChildModel, ChildMessage>(
    id: string,
    childModel: ChildModel,
    childView: ReturnType<typeof defineView<ChildModel, ChildMessage>>,
    wrap: (message: ChildMessage) => Message,
  ): Html =>
    h.keyed('div')(
      `block-${id}`,
      [],
      [
        h.submodel({
          slotId: `block-${id}`,
          model: childModel,
          view: childView,
          toParentMessage: wrap,
        }),
      ],
    );

  return M.value(blockId).pipe(
    withHtml,
    M.when('01', () =>
      embed('01', model.b01, v01, (message) => GotB01({ message })),
    ),
    M.when('02', () =>
      embed('02', model.b02, v02, (message) => GotB02({ message })),
    ),
    M.when('03', () =>
      embed('03', model.b03, v03, (message) => GotB03({ message })),
    ),
    M.when('04', () =>
      embed('04', model.b04, v04, (message) => GotB04({ message })),
    ),
    M.when('05', () =>
      embed('05', model.b05, v05, (message) => GotB05({ message })),
    ),
    M.when('06', () =>
      embed('06', model.b06, v06, (message) => GotB06({ message })),
    ),
    M.when('07', () =>
      embed('07', model.b07, v07, (message) => GotB07({ message })),
    ),
    M.when('08', () =>
      embed('08', model.b08, v08, (message) => GotB08({ message })),
    ),
    M.when('09', () =>
      embed('09', model.b09, v09, (message) => GotB09({ message })),
    ),
    M.when('10', () =>
      embed('10', model.b10, v10, (message) => GotB10({ message })),
    ),
    M.when('11', () =>
      embed('11', model.b11, v11, (message) => GotB11({ message })),
    ),
    M.when('12', () =>
      embed('12', model.b12, v12, (message) => GotB12({ message })),
    ),
    M.when('13', () =>
      embed('13', model.b13, v13, (message) => GotB13({ message })),
    ),
    M.when('14', () =>
      embed('14', model.b14, v14, (message) => GotB14({ message })),
    ),
    M.when('15', () =>
      embed('15', model.b15, v15, (message) => GotB15({ message })),
    ),
    M.when('16', () =>
      embed('16', model.b16, v16, (message) => GotB16({ message })),
    ),
    M.orElse(() =>
      h.div(
        [
          h.Class(
            'flex min-h-svh items-center justify-center text-sm text-muted-foreground',
          ),
        ],
        [`Unknown block: sidebar-${blockId}`],
      ),
    ),
  );
};
