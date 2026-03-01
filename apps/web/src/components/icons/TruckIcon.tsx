import React from 'react';

interface TruckIconProps {
  size?: number;
  color?: string;
}

const TruckIcon: React.FC<TruckIconProps> = ({
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
    aria-label="Truck"
  >
    {/* Cargo body */}
    <path d="M1 3H16V16H1V3Z" />
    {/* Cab */}
    <path d="M16 8H20L23 11V16H16V8Z" />
    {/* Left wheel */}
    <circle cx={5.5} cy={18.5} r={2.5} />
    {/* Right wheel */}
    <circle cx={18.5} cy={18.5} r={2.5} />
  </svg>
);

export default TruckIcon;
