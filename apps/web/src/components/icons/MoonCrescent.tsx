import React from 'react';

interface MoonCrescentProps {
  size?: number;
  color?: string;
}

const MoonCrescent: React.FC<MoonCrescentProps> = ({
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
    aria-label="Crescent moon"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" />
  </svg>
);

export default MoonCrescent;
