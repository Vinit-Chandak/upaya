import React from 'react';

interface SunFullProps {
  size?: number;
  color?: string;
}

const SunFull: React.FC<SunFullProps> = ({
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
    aria-label="Full sun"
  >
    {/* Sun circle */}
    <circle cx={12} cy={12} r={5} />
    {/* Top ray */}
    <path d="M12 2V5" />
    {/* Bottom ray */}
    <path d="M12 19V22" />
    {/* Right ray */}
    <path d="M22 12H19" />
    {/* Left ray */}
    <path d="M5 12H2" />
    {/* Top-right ray */}
    <path d="M19.071 4.929L16.95 7.05" />
    {/* Top-left ray */}
    <path d="M4.929 4.929L7.05 7.05" />
    {/* Bottom-right ray */}
    <path d="M19.071 19.071L16.95 16.95" />
    {/* Bottom-left ray */}
    <path d="M4.929 19.071L7.05 16.95" />
  </svg>
);

export default SunFull;
