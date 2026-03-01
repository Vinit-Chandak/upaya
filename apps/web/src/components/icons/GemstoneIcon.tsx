import React from 'react';

interface GemstoneIconProps {
  size?: number;
  color?: string;
}

const GemstoneIcon: React.FC<GemstoneIconProps> = ({
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
    aria-label="Gemstone"
  >
    {/* Top edge */}
    <path d="M6 3H18L22 9L12 22L2 9L6 3Z" />
    {/* Crown facet lines */}
    <path d="M2 9H22" />
    {/* Left facet */}
    <path d="M12 22L8 9" />
    {/* Right facet */}
    <path d="M12 22L16 9" />
    {/* Top left facet */}
    <path d="M6 3L8 9" />
    {/* Top right facet */}
    <path d="M18 3L16 9" />
    {/* Top center */}
    <path d="M12 3V9" />
  </svg>
);

export default GemstoneIcon;
