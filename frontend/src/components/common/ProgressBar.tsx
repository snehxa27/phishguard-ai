import { motion } from "framer-motion";

interface ProgressBarProps {
  label: string;
  value: number;
  variant?: "primary" | "danger" | "warning";
}

export function ProgressBar({ label, value, variant = "primary" }: ProgressBarProps) {
  const colorMap = {
    primary: "bg-primary",
    danger: "bg-destructive",
    warning: "bg-warning",
  };

  const glowMap = {
    primary: "shadow-[0_0_8px_hsl(var(--primary)/0.4)]",
    danger: "shadow-[0_0_8px_hsl(var(--destructive)/0.4)]",
    warning: "shadow-[0_0_8px_hsl(var(--warning)/0.4)]",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">{value}%</span>
      </div>
      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorMap[variant]} ${glowMap[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}
