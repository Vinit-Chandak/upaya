import React from 'react';

interface HouseIconProps {
  size?: number;
  color?: string;
}

const HouseIcon: React.FC<HouseIconProps> = ({
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
    aria-label="House"
  >
    {/* Roof */}
    <path d="M3 12L12 3L21 12" />
    {/* Walls */}
    <path d="M5 10V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10" />
    {/* Door */}
    <path d="M10 21V15H14V21" />
  </svg>
);

export default HouseIcon;
