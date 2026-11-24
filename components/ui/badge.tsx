import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "status-badge inline-flex items-center border px-1.5 py-0.5",
  {
    variants: {
      tone: {
        neutral: "border-line text-muted",
        good: "border-good/50 bg-good/5 text-good",
        bad: "border-bad/50 bg-bad/5 text-bad",
        amber: "border-amber/50 bg-amber/5 text-amber",
        open: "border-[#b0a6ee]/50 bg-[#b0a6ee]/5 text-[#b0a6ee]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
