import React from 'react';

interface ArrowRightProps {
  size?: number;
  color?: string;
}

const ArrowRight: React.FC<ArrowRightProps> = ({
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
    aria-label="Arrow right"
  >
    <path d="M5 12H19" />
    <path d="M13 6L19 12L13 18" />
  </svg>
);

export default ArrowRight;
