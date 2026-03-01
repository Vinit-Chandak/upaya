import React from 'react';

interface TargetIconProps {
  size?: number;
  color?: string;
}

const TargetIcon: React.FC<TargetIconProps> = ({
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
    aria-label="Target"
  >
    {/* Outer circle */}
    <circle cx={12} cy={12} r={10} />
    {/* Middle circle */}
    <circle cx={12} cy={12} r={6} />
    {/* Inner circle */}
    <circle cx={12} cy={12} r={2} />
  </svg>
);

export default TargetIcon;
