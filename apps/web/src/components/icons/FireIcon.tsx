import React from 'react';

interface FireIconProps {
  size?: number;
  color?: string;
}

const FireIcon: React.FC<FireIconProps> = ({
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
    aria-label="Fire"
  >
    {/* Outer flame */}
    <path d="M12 2C12 2 7 7 7 12C7 14.5 8.5 17 10 18.5C10 18.5 9 16 10 13C11 10 12 8 12 8C12 8 13 10 14 13C15 16 14 18.5 14 18.5C15.5 17 17 14.5 17 12C17 7 12 2 12 2Z" />
    {/* Inner flame */}
    <path d="M12 22C9.5 22 7 20 7 17.5C7 15 9 13 10.5 12C10.5 12 10 14.5 12 16.5C14 14.5 13.5 12 13.5 12C15 13 17 15 17 17.5C17 20 14.5 22 12 22Z" />
  </svg>
);

export default FireIcon;
