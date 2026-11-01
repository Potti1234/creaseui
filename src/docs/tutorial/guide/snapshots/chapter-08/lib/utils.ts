// @ts-nocheck: snapshot of creaseui-demo chapter-08:src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Verbatim shadcn/ui utils.ts — nothing React-specific in it.
export const cn = (...inputs: ReadonlyArray<ClassValue>): string =>
  twMerge(clsx(inputs))
