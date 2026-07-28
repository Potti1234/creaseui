import { type VariantProps, cva } from "class-variance-authority";
import { type Html, html } from "foldkit/html";

import { cn } from "@/lib/utils";

export const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;

type Slot = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export type AlertProps = Slot &
  Readonly<{
    variant?: AlertVariants["variant"];
  }>;

export const alert = <Msg>(props: AlertProps): Html => {
  const h = html<Msg>();

  return h.div(
    [
      h.DataAttribute("slot", "alert"),
      h.Role("alert"),
      h.Class(
        cn(alertVariants({ variant: props.variant ?? "default" }), props.class),
      ),
    ],
    [...props.children],
  );
};

export const alertTitle = <Msg>(props: Slot): Html => {
  const h = html<Msg>();

  return h.div(
    [
      h.DataAttribute("slot", "alert-title"),
      h.Class(
        cn(
          "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export const alertDescription = <Msg>(props: Slot): Html => {
  const h = html<Msg>();

  return h.div(
    [
      h.DataAttribute("slot", "alert-description"),
      h.Class(
        cn(
          "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};
