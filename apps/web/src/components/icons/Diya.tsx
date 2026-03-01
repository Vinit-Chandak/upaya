import React from 'react';

interface DiyaProps {
  size?: number;
  color?: string;
}

const Diya: React.FC<DiyaProps> = ({
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
    aria-label="Diya oil lamp"
  >
    {/* Flame */}
    <path d="M12 4C12 4 10 6 10 8C10 9.105 10.895 10 12 10C13.105 10 14 9.105 14 8C14 6 12 4 12 4Z" />
    {/* Wick */}
    <path d="M12 10V12" />
    {/* Oil bowl */}
    <path d="M6 14C6 12 8.686 11 12 11C15.314 11 18 12 18 14" />
    {/* Lamp base curve */}
    <path d="M5 14C5 17 8 19 12 19C16 19 19 17 19 14" />
    {/* Spout */}
    <path d="M18 14L20 13" />
    {/* Base */}
    <path d="M9 19L8 21H16L15 19" />
  </svg>
);

export default Diya;
