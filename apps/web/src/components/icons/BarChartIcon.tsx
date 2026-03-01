import React from 'react';

interface BarChartIconProps {
  size?: number;
  color?: string;
}

const BarChartIcon: React.FC<BarChartIconProps> = ({
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
    aria-label="Bar chart"
  >
    {/* Left bar (short) */}
    <path d="M6 20V14" />
    {/* Center bar (tall) */}
    <path d="M12 20V4" />
    {/* Right bar (medium) */}
    <path d="M18 20V10" />
  </svg>
);

export default BarChartIcon;
