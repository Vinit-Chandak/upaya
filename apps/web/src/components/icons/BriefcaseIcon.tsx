import React from 'react';

interface BriefcaseIconProps {
  size?: number;
  color?: string;
}

const BriefcaseIcon: React.FC<BriefcaseIconProps> = ({
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
    aria-label="Briefcase"
  >
    {/* Bag body */}
    <rect x={2} y={7} width={20} height={14} rx={2} />
    {/* Handle */}
    <path d="M16 7V5C16 3.895 15.105 3 14 3H10C8.895 3 8 3.895 8 5V7" />
    {/* Middle divider */}
    <path d="M2 13H22" />
    {/* Clasp */}
    <path d="M10 13V15H14V13" />
  </svg>
);

export default BriefcaseIcon;
