import React from 'react';

interface NamasteHandsProps {
  size?: number;
  color?: string;
}

const NamasteHands: React.FC<NamasteHandsProps> = ({
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
    aria-label="Namaste hands"
  >
    {/* Left hand */}
    <path d="M8 21V13C8 11 9.5 9 12 7" />
    {/* Right hand */}
    <path d="M16 21V13C16 11 14.5 9 12 7" />
    {/* Fingertips meeting */}
    <path d="M12 7V3" />
    {/* Left fingers */}
    <path d="M8 13C8 13 9 11 10 10" />
    {/* Right fingers */}
    <path d="M16 13C16 13 15 11 14 10" />
    {/* Palm curve left */}
    <path d="M8 17C9.5 16 10.5 15 12 14" />
    {/* Palm curve right */}
    <path d="M16 17C14.5 16 13.5 15 12 14" />
  </svg>
);

export default NamasteHands;
