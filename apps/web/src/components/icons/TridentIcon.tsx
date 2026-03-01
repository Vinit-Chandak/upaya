import React from 'react';

interface TridentIconProps {
  size?: number;
  color?: string;
}

const TridentIcon: React.FC<TridentIconProps> = ({
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
    aria-label="Trident"
  >
    {/* Center prong */}
    <path d="M12 2V22" />
    {/* Left prong */}
    <path d="M5 4L5 10C5 12 8 13 12 13" />
    {/* Right prong */}
    <path d="M19 4L19 10C19 12 16 13 12 13" />
    {/* Center prong tip */}
    <path d="M12 2L12 5" />
    {/* Left prong tip */}
    <path d="M5 2V4" />
    {/* Right prong tip */}
    <path d="M19 2V4" />
    {/* Cross bar */}
    <path d="M9 17H15" />
  </svg>
);

export default TridentIcon;
