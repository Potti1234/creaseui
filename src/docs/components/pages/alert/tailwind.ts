import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { alertFixtures } from '@/docs/components/pages/alert/shared';
import * as Icon from '@/lib/icon';
import * as Alert from '@/ui/alert';

const InteractedWithAlertPreview = m('InteractedWithAlertPreview');
type InteractedWithAlertPreview = typeof InteractedWithAlertPreview.Type;
const AlertPreviewModel = S.Struct({ _docsPage: S.Literal('alert') });
type AlertPreviewModel = typeof AlertPreviewModel.Type;

export const alertTailwindPreviewProgram = definePreviewProgram<
  AlertPreviewModel,
  InteractedWithAlertPreview
>({
  Model: AlertPreviewModel,
  Message: InteractedWithAlertPreview,
  init: () => ({ _docsPage: 'alert' }),
  update: model => [model, []],
  view: (index, _model, h) => {
    const item = alertFixtures[index] ?? alertFixtures[0];
    const icon = item.icon === 'circleCheck'
      ? Icon.circleCheck({}, h)
      : item.icon === 'triangleAlert'
        ? Icon.triangleAlert({}, h)
        : item.icon === 'octagonX'
          ? Icon.octagonX({}, h)
          : Icon.info({}, h);
    return Alert.alert({
      severity: item.severity,
      announcement: item.announcement,
      class: 'max-w-xl',
      children: [
        Alert.alertIcon({ children: [icon] }, h),
        Alert.alertTitle({ children: [item.title] }, h),
        Alert.alertDescription({ children: [item.description] }, h),
      ],
    }, h);
  },
});
