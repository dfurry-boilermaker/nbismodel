import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "number-input flex w-full border px-3 text-sm placeholder:text-muted/60",
        className,
      )}
      {...props}
    />
  );
}
