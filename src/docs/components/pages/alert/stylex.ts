import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { className } from '@/stylex/style';
import { alertFixtures } from '@/docs/components/pages/alert/shared';
import * as Icon from '@/lib/icon';
import * as Alert from '@/stylex/alert';
import * as Button from '@/stylex/button';

const styles = stylex.create({
  wrap: { gap: '1rem', display: 'grid', maxWidth: '28rem', width: '100%', },
  action: { gridColumnStart: '2', marginTop: '0.5rem' },
});

export const alertStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = alertFixtures[exampleIndex] ?? alertFixtures[0];
  return h.div(
    [
      h.Class(className(styles.wrap)),
      ...(fixture.direction === 'rtl' ? [h.Dir('rtl')] : []),
    ],
    fixture.alerts.map(item =>
      Alert.alert({
        severity: item.severity,
        announcement: item.announcement,
        children: [
          Alert.alertIcon({ children: [Icon.icon(item.icon, {}, h)] }, h),
          Alert.alertTitle({ children: [item.title] }, h),
          Alert.alertDescription({ children: [item.description] }, h),
          ...(item.actionLabel === undefined
            ? []
            : [
                h.div([h.Class(className(styles.action))], [
                  Button.button({ size: 'sm', children: [item.actionLabel] }, h),
                ]),
              ]),
        ],
      }, h),
    ),
  );
};
