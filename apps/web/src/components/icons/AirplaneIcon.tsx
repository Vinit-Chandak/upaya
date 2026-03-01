import React from 'react';

interface AirplaneIconProps {
  size?: number;
  color?: string;
}

const AirplaneIcon: React.FC<AirplaneIconProps> = ({
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
    aria-label="Airplane"
  >
    {/* Fuselage and wings */}
    <path d="M2 14L10 12L8 22L11 19L14 22L12 12L22 9C22.5 9 23 8.5 23 8C23 7.5 22.5 7 22 7L12 10L14 2L11 5L8 2L10 10L2 12C1.5 12 1 12.5 1 13C1 13.5 1.5 14 2 14Z" />
  </svg>
);

export default AirplaneIcon;
