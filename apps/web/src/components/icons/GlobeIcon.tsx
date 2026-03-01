import React from 'react';

interface GlobeIconProps {
  size?: number;
  color?: string;
}

const GlobeIcon: React.FC<GlobeIconProps> = ({
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
    aria-label="Globe"
  >
    {/* Outer circle */}
    <circle cx={12} cy={12} r={10} />
    {/* Vertical meridian */}
    <ellipse cx={12} cy={12} rx={4} ry={10} />
    {/* Horizontal equator */}
    <path d="M2 12H22" />
    {/* Upper latitude */}
    <path d="M4 7.5H20" />
    {/* Lower latitude */}
    <path d="M4 16.5H20" />
  </svg>
);

export default GlobeIcon;
