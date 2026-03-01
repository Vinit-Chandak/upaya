import React from 'react';

interface PrasadBoxProps {
  size?: number;
  color?: string;
}

const PrasadBox: React.FC<PrasadBoxProps> = ({
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
    aria-label="Prasad box"
  >
    {/* Ribbon bow */}
    <path d="M8 6C8 6 9 4 12 4C15 4 16 6 16 6" />
    {/* Box lid */}
    <path d="M4 6H20V10H4V6Z" />
    {/* Box body */}
    <path d="M5 10H19V20H5V10Z" />
    {/* Vertical ribbon */}
    <path d="M12 6V20" />
    {/* Horizontal ribbon */}
    <path d="M5 14H19" />
  </svg>
);

export default PrasadBox;
