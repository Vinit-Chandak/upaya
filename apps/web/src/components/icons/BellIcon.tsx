import React from 'react';

interface BellIconProps {
  size?: number;
  color?: string;
}

const BellIcon: React.FC<BellIconProps> = ({
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
    aria-label="Notification bell"
  >
    {/* Bell body */}
    <path d="M18 8C18 6.4 17.36 4.86 16.24 3.76C15.12 2.64 13.6 2 12 2C10.4 2 8.88 2.64 7.76 3.76C6.64 4.88 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
    {/* Clapper */}
    <path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.7 21.91 12.36 22 12 22C11.64 22 11.3 21.91 11 21.73C10.7 21.55 10.45 21.3 10.27 21" />
  </svg>
);

export default BellIcon;
