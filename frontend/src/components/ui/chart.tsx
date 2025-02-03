"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { cn } from "@/lib/utils";

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
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

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius}
        fill={fill}
      />
    </g>
  );
};

export function Chart({
  value,
  size = "md",
  variant = "line",
  color = "hsl(var(--primary))",
  className,
  children,
  ...props
}: ChartProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const [activeIndex, setActiveIndex] = React.useState(0);

  const data = [{ value: normalizedValue }, { value: 100 - normalizedValue }];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div
      className={cn("relative inline-flex", sizeClasses[size], className)}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={variant === "line" ? "80%" : "0%"}
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            onMouseEnter={onPieEnter}
          >
            <Cell fill={color} />
            <Cell fill="hsl(var(--muted-foreground) / 0.2)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
