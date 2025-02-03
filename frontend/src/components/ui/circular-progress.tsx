"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: "sm" | "md" | "lg";
  variant?: "line" | "fill";
  color?: string;
}

const sizeClasses = {
  sm: "h-24 w-24",
  md: "h-32 w-32",
  lg: "h-40 w-40",
};

export function CircularProgress({
  value,
  size = "md",
  variant = "line",
  color = "hsl(var(--primary))",
  className,
  children,
  ...props
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  if (variant === "fill") {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const fillPercent = ((100 - normalizedValue) * circumference) / 100;

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
            r={radius}
            fill="currentColor"
          />
          <path
            d={`
              M 50 50
              m 0 -${radius}
              a ${radius} ${radius} 0 1 1 0 ${2 * radius}
              a ${radius} ${radius} 0 1 1 0 -${2 * radius}
            `}
            fill={color}
            strokeDasharray={circumference}
            strokeDashoffset={fillPercent}
            transform={`rotate(-90 50 50)`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  }

  const circumference = 332; // 2 * π * (outside radius - padding)
  const strokeDashoffset =
    circumference - (normalizedValue / 100) * circumference;

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
