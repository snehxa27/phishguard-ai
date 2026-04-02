import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhishingScoreCircleProps {
  score: number;
  size?: number;
  label?: string;
}

export function PhishingScoreCircle({ score, size = 180, label }: PhishingScoreCircleProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getRiskColor = () => {
    if (score >= 70) return "hsl(var(--destructive))";
    if (score >= 40) return "hsl(var(--warning))";
    return "hsl(var(--safe))";
  };

  const getRiskGlow = () => {
    if (score >= 70) return "drop-shadow(0 0 12px hsl(var(--destructive) / 0.6))";
    if (score >= 40) return "drop-shadow(0 0 12px hsl(var(--warning) / 0.6))";
    return "drop-shadow(0 0 12px hsl(var(--safe) / 0.6))";
  };

  const getRiskLabel = () => {
    if (label) return label;
    if (score >= 70) return "HIGH RISK";
    if (score >= 40) return "MEDIUM RISK";
    return "LOW RISK";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90" style={{ filter: getRiskGlow() }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getRiskColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <motion.span
          className="text-3xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium tracking-wider">PHISH SCORE</span>
      </div>
      <span className="text-xs font-semibold tracking-wider mt-1" style={{ color: getRiskColor() }}>
        {getRiskLabel()}
      </span>
    </div>
  );
}
