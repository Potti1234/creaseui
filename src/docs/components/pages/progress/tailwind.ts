import type { HtmlBuilder } from 'foldkit/html';

import * as Progress from '@/ui/progress';

export const progressTailwindStaticPreviews = [
  <Msg>(_model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) =>
    Progress.progress({
      value: 64,
      max: 80,
      ariaLabel: 'Upload progress',
      valueText: '64 of 80 files',
      class: 'max-w-md',
    }, h),
  <Msg>(_model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) =>
    Progress.progress({
      value: null,
      ariaLabel: 'Loading report',
      valueText: 'Loading',
      class: 'max-w-md',
    }, h),
  <Msg>(_model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) =>
    Progress.progress({
      value: 3,
      max: 4,
      ariaLabel: 'Setup progress',
      valueText: '3 of 4 steps',
      class: 'w-24',
    }, h),
] as const;
