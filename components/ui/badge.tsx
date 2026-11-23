import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
  {
    variants: {
      tone: {
        neutral: "border-white/15 text-emerald-50/80",
        good: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
        bad: "border-rose-300/40 bg-rose-300/10 text-rose-200",
        amber: "border-amber-300/40 bg-amber-300/10 text-amber-100",
        open: "border-sky-300/40 bg-sky-300/10 text-sky-100",
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
