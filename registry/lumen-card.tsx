import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type LumenCardProps = React.ComponentProps<typeof Card> & {
  tone?: "theme" | "ember" | "lagoon" | "lilac";
};

export const LumenCard = React.forwardRef<HTMLDivElement, LumenCardProps>(function LumenCard({ className, tone = "theme", ...props }, ref) {
  return (
    <Card
      {...props}
      ref={ref}
      data-lumen-tone={tone}
      className={cn("lumenmorph lumenmorph-border lumenmorph-theme", className)}
    />
  );
});
