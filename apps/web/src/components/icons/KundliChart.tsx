import React from 'react';

interface KundliChartProps {
  size?: number;
  color?: string;
}

const KundliChart: React.FC<KundliChartProps> = ({
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Kundli chart"
  >
    {/* Outer rotated square (diamond) */}
    <path d="M12 2L22 12L12 22L2 12L12 2Z" />
    {/* Inner lines forming the grid */}
    <path d="M12 2L12 22" />
    <path d="M2 12H22" />
    {/* Diagonal lines forming houses */}
    <path d="M7 7L17 17" />
    <path d="M17 7L7 17" />
  </svg>
);

export default KundliChart;
