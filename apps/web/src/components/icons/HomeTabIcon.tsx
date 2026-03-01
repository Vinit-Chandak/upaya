import React from 'react';

interface HomeTabIconProps {
  size?: number;
  color?: string;
}

const HomeTabIcon: React.FC<HomeTabIconProps> = ({
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
    aria-label="Home"
  >
    {/* Roof */}
    <path d="M3 10L12 3L21 10" />
    {/* House body */}
    <path d="M5 10V19C5 19.552 5.448 20 6 20H18C18.552 20 19 19.552 19 19V10" />
    {/* Door */}
    <path d="M10 20V15H14V20" />
  </svg>
);

export default HomeTabIcon;
