"use client";

import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DayBucket {
  /** ISO date string, e.g. "2026-07-13" */
  date: string;
  /** Human label, e.g. "Jul 13" */
  label: string;
  /** Number of queries that day */
  count: number;
}

interface UsageChartProps {
  /** Pre-bucketed daily data, oldest → newest */
  data: DayBucket[];
  /** Chart height in px */
  height?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * UsageChart
 *
 * A lightweight SVG bar chart that visualises daily query volume.
 * No external charting libraries — renders pure SVG with the project's
 * HSL CSS-variable colours for seamless light/dark support.
 */
export function UsageChart({ data, height = 200 }: UsageChartProps) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-muted-foreground"
        style={{ height }}
      >
        No usage data yet.
      </div>
    );
  }

  // Layout constants
  const paddingTop = 16;
  const paddingBottom = 28; // room for labels
  const paddingX = 8;
  const chartHeight = height - paddingTop - paddingBottom;

  // We'll fill 100% width via viewBox + preserveAspectRatio
  const barGap = 4;
  const barWidth = 32;
  const svgWidth = data.length * (barWidth + barGap) - barGap + paddingX * 2;

  return (
    <div className="w-full overflow-x-auto rounded-xl">
      <svg
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ minWidth: Math.max(svgWidth, 280), height }}
        role="img"
        aria-label="Daily query usage bar chart"
      >
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = paddingTop + chartHeight * (1 - frac);
          return (
            <line
              key={frac}
              x1={paddingX}
              x2={svgWidth - paddingX}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              strokeDasharray={frac === 0 ? undefined : "3,3"}
            />
          );
        })}

        {/* Bars + labels */}
        {data.map((bucket, i) => {
          const barH = (bucket.count / maxCount) * chartHeight;
          const x = paddingX + i * (barWidth + barGap);
          const y = paddingTop + chartHeight - barH;

          return (
            <g key={bucket.date}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 1)}
                rx={4}
                ry={4}
                fill="hsl(var(--primary))"
                fillOpacity={0.8}
                className="transition-all duration-300"
              >
                <title>{`${bucket.label}: ${bucket.count} queries`}</title>
              </rect>

              {/* Count on top */}
              {bucket.count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fill="hsl(var(--foreground))"
                  fillOpacity={0.7}
                >
                  {bucket.count}
                </text>
              )}

              {/* Date label below */}
              <text
                x={x + barWidth / 2}
                y={paddingTop + chartHeight + 16}
                textAnchor="middle"
                fontSize={9}
                fill="hsl(var(--muted-foreground))"
              >
                {bucket.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
