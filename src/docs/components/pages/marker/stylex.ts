import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Marker from '@/stylex/marker';

const styles = stylex.create({
  marker: { maxWidth: '32rem' },
});

export const markerStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => Marker.marker({
  ...(exampleIndex === 0 ? { variant: 'separator' as const } : {}),
  ...(exampleIndex === 2 ? { variant: 'border' as const } : {}),
  layoutStyle: styles.marker,
  children: exampleIndex === 1
    ? [
        Marker.markerIcon({ children: ['●'] }, h),
        Marker.markerContent({ children: ['Deployment completed'] }, h),
      ]
    : [Marker.markerContent({
        children: [exampleIndex === 0 ? 'Today' : 'Earlier'],
      }, h)],
}, h);
