import React from 'react';

interface ShriYantraProps {
  size?: number;
  color?: string;
}

const ShriYantra: React.FC<ShriYantraProps> = ({
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
    aria-label="Sri Yantra"
  >
    {/* Upward triangle */}
    <path d="M12 3L21 19H3L12 3Z" />
    {/* Downward triangle */}
    <path d="M12 21L3 5H21L12 21Z" />
    {/* Inner upward triangle */}
    <path d="M12 8L16.5 16H7.5L12 8Z" />
    {/* Inner downward triangle */}
    <path d="M12 16L7.5 8H16.5L12 16Z" />
    {/* Center dot */}
    <circle cx={12} cy={12} r={1} fill={color} stroke="none" />
  </svg>
);

export default ShriYantra;
