import React from 'react';

interface FamilyIconProps {
  size?: number;
  color?: string;
}

const FamilyIcon: React.FC<FamilyIconProps> = ({
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
    aria-label="Family"
  >
    {/* Left adult head */}
    <circle cx={7} cy={5} r={2.5} />
    {/* Right adult head */}
    <circle cx={17} cy={5} r={2.5} />
    {/* Child head */}
    <circle cx={12} cy={9} r={2} />
    {/* Left adult body */}
    <path d="M3 21V17C3 15.343 4.343 14 6 14H8C9.657 14 11 15.343 11 17" />
    {/* Right adult body */}
    <path d="M13 17C13 15.343 14.343 14 16 14H18C19.657 14 21 15.343 21 17V21" />
    {/* Child body */}
    <path d="M9 21V18C9 16.343 10.343 15 12 15C13.657 15 15 16.343 15 18V21" />
  </svg>
);

export default FamilyIcon;
