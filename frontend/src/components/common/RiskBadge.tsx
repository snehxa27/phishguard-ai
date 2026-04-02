import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "high" | "medium" | "low" | "secure";
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = {
    high: { label: "HIGH RISK", bg: "bg-destructive/15 text-destructive border-destructive/30" },
    medium: { label: "MODERATE", bg: "bg-warning/15 text-warning border-warning/30" },
    low: { label: "LOW RISK", bg: "bg-primary/15 text-primary border-primary/30" },
    secure: { label: "SECURE", bg: "bg-safe/15 text-safe border-safe/30" },
  };

  const { label, bg } = config[level];

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider rounded-full border", bg, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {label}
    </span>
  );
}
