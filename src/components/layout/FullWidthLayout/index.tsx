import { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

/**
 * A single section spanning the full width of the page. Uses the same vertical
 * rhythm as TwoColumnLayout, so the two can be stacked without the spacing
 * jumping between sections.
 */
export const FullWidthLayout = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn("flex w-full flex-col gap-12 pb-6 pt-6 lg:pb-24", className)}
  >
    {children}
  </div>
);
