import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LumenButtonProps = React.ComponentProps<typeof Button> & {
  tone?: "theme" | "ember" | "lagoon" | "lilac";
};

export const LumenButton = React.forwardRef<HTMLButtonElement, LumenButtonProps>(function LumenButton({ className, tone = "theme", variant = "outline", ...props }, ref) {
  return (
    <Button
      {...props}
      ref={ref}
      variant={variant}
      data-lumen-tone={tone}
      className={cn("lumenmorph lumenmorph-border lumenmorph-theme", className)}
    />
  );
});
