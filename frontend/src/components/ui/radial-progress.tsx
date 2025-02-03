"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadialProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: "sm" | "md" | "lg";
  color?: string;
}

const sizeClasses = {
  sm: "h-24 w-24",
  md: "h-32 w-32",
  lg: "h-40 w-40",
};

export function RadialProgress({
  value,
  size = "md",
  color = "hsl(var(--primary))",
  className,
  children,
  ...props
}: RadialProgressProps) {
  const circumference = 332; // 2 * π * (outside radius - padding)
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex", sizeClasses[size], className)}
      {...props}
    >
      <svg className="w-full h-full -rotate-90">
        <circle
          className="text-muted-foreground/20"
          cx="50%"
          cy="50%"
          r="53"
          strokeWidth="12"
          fill="none"
          stroke="currentColor"
        />
        <circle
          cx="50%"
          cy="50%"
          r="53"
          strokeWidth="12"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.2s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
