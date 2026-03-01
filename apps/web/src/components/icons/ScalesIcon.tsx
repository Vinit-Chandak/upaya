import React from 'react';

interface ScalesIconProps {
  size?: number;
  color?: string;
}

const ScalesIcon: React.FC<ScalesIconProps> = ({
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
    aria-label="Balance scales"
  >
    {/* Center pillar */}
    <path d="M12 3V19" />
    {/* Top beam */}
    <path d="M4 7H20" />
    {/* Left chain */}
    <path d="M4 7L3 12" />
    {/* Right chain */}
    <path d="M20 7L21 12" />
    {/* Left pan */}
    <path d="M1 12C1 12 2 15 4 15C6 15 7 12 7 12" />
    {/* Right pan */}
    <path d="M17 12C17 12 18 15 20 15C22 15 23 12 23 12" />
    {/* Base */}
    <path d="M8 19H16" />
    {/* Top circle */}
    <circle cx={12} cy={4} r={1} />
  </svg>
);

export default ScalesIcon;
