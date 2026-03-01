import React from 'react';

interface HourglassClockProps {
  size?: number;
  color?: string;
}

const HourglassClock: React.FC<HourglassClockProps> = ({
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
    aria-label="Hourglass"
  >
    {/* Top bar */}
    <path d="M6 2H18" />
    {/* Bottom bar */}
    <path d="M6 22H18" />
    {/* Hourglass shape */}
    <path d="M7 2V7C7 9 9 11 12 12C9 13 7 15 7 17V22" />
    <path d="M17 2V7C17 9 15 11 12 12C15 13 17 15 17 17V22" />
    {/* Sand trickle */}
    <path d="M12 12V14" />
  </svg>
);

export default HourglassClock;
