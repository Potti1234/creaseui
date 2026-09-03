import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { alertFixtures } from '@/docs/components/pages/alert/shared';
import * as Icon from '@/lib/icon';
import * as Alert from '@/stylex/alert';

const styles = stylex.create({
  alert: { maxWidth: '36rem' },
});

export const alertStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const item = alertFixtures[exampleIndex] ?? alertFixtures[0];
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
    layoutStyle: styles.alert,
    children: [
      Alert.alertIcon({ children: [icon] }, h),
      Alert.alertTitle({ children: [item.title] }, h),
      Alert.alertDescription({ children: [item.description] }, h),
    ],
  }, h);
};
