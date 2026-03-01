import React from 'react';

interface GiftIconProps {
  size?: number;
  color?: string;
}

const GiftIcon: React.FC<GiftIconProps> = ({
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
    aria-label="Gift"
  >
    {/* Box body */}
    <rect x={3} y={10} width={18} height={12} rx={1} />
    {/* Lid */}
    <rect x={2} y={6} width={20} height={4} rx={1} />
    {/* Vertical ribbon */}
    <path d="M12 6V22" />
    {/* Bow left */}
    <path d="M12 6C12 6 9 2 6 2C4 2 3 3.5 3 4.5C3 6 5 6 6 6H12" />
    {/* Bow right */}
    <path d="M12 6C12 6 15 2 18 2C20 2 21 3.5 21 4.5C21 6 19 6 18 6H12" />
  </svg>
);

export default GiftIcon;
