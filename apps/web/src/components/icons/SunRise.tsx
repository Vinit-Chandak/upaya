import React from 'react';

interface SunRiseProps {
  size?: number;
  color?: string;
}

const SunRise: React.FC<SunRiseProps> = ({
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
    aria-label="Sunrise"
  >
    {/* Horizon line */}
    <path d="M2 17H22" />
    {/* Half sun above horizon */}
    <path d="M6 17C6 13.686 8.686 11 12 11C15.314 11 18 13.686 18 17" />
    {/* Top ray */}
    <path d="M12 3V6" />
    {/* Upper left ray */}
    <path d="M5.636 6.636L7.757 8.757" />
    {/* Upper right ray */}
    <path d="M18.364 6.636L16.243 8.757" />
    {/* Left ray */}
    <path d="M2 11H5" />
    {/* Right ray */}
    <path d="M19 11H22" />
    {/* Ground line */}
    <path d="M4 21H20" />
  </svg>
);

export default SunRise;
