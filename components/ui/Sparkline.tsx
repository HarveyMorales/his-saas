"use client";

interface SparklineProps {
  color?: string;
  data?: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ color = "#00BFA6", data, width = 80, height = 32 }: SparklineProps) {
  const pts = data ?? [20, 35, 28, 55, 40, 70, 58, 80, 72, 90];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const range = max - min || 1;
  const id = `spark-${color.replace("#", "")}`;

  const path = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const fillPath = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
