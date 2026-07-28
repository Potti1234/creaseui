import { type Html } from "foldkit/html";

import * as Icon from "@/lib/icon";
import { cn } from "@/lib/utils";

export type SpinnerProps = Readonly<{
  class?: string;
}>;

export const spinner = <Msg>(props: SpinnerProps = {}): Html =>
  Icon.loaderCircle<Msg>({
    ariaLabel: "Loading",
    class: cn("size-4 animate-spin", props.class),
  });
