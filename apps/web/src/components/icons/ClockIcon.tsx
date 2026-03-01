import React from 'react';

interface ClockIconProps {
  size?: number;
  color?: string;
}

const ClockIcon: React.FC<ClockIconProps> = ({
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
    aria-label="Clock"
  >
    {/* Clock face */}
    <circle cx={12} cy={12} r={10} />
    {/* Hour hand */}
    <path d="M12 6V12" />
    {/* Minute hand */}
    <path d="M12 12L16 14" />
  </svg>
);

export default ClockIcon;
