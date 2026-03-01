import React from 'react';

interface MarriageIconProps {
  size?: number;
  color?: string;
}

const MarriageIcon: React.FC<MarriageIconProps> = ({
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
    aria-label="Marriage rings"
  >
    {/* Left ring */}
    <circle cx={9} cy={12} r={5} />
    {/* Right ring */}
    <circle cx={15} cy={12} r={5} />
  </svg>
);

export default MarriageIcon;
