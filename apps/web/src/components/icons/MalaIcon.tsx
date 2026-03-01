import React from 'react';

interface MalaIconProps {
  size?: number;
  color?: string;
}

const MalaIcon: React.FC<MalaIconProps> = ({
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
    aria-label="Prayer beads mala"
  >
    {/* Main circle of beads */}
    <circle cx={12} cy={11} r={8} />
    {/* Beads around the circle */}
    <circle cx={12} cy={3} r={1} fill={color} stroke="none" />
    <circle cx={16.5} cy={4.5} r={1} fill={color} stroke="none" />
    <circle cx={19.5} cy={8} r={1} fill={color} stroke="none" />
    <circle cx={19.5} cy={13} r={1} fill={color} stroke="none" />
    <circle cx={16.5} cy={17} r={1} fill={color} stroke="none" />
    <circle cx={12} cy={19} r={1} fill={color} stroke="none" />
    <circle cx={7.5} cy={17} r={1} fill={color} stroke="none" />
    <circle cx={4.5} cy={13} r={1} fill={color} stroke="none" />
    <circle cx={4.5} cy={8} r={1} fill={color} stroke="none" />
    <circle cx={7.5} cy={4.5} r={1} fill={color} stroke="none" />
    {/* Sumeru bead (larger, at bottom with tassel) */}
    <circle cx={12} cy={19} r={1.5} fill="none" stroke={color} />
    {/* Tassel */}
    <path d="M12 20.5V23" />
    <path d="M10.5 23L12 21.5L13.5 23" />
  </svg>
);

export default MalaIcon;
