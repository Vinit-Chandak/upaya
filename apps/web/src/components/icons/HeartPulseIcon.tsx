import React from 'react';

interface HeartPulseIconProps {
  size?: number;
  color?: string;
}

const HeartPulseIcon: React.FC<HeartPulseIconProps> = ({
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
    aria-label="Heart with pulse"
  >
    {/* Heart shape */}
    <path d="M20.42 4.58C19.92 4.08 19.33 3.68 18.68 3.4C18.03 3.12 17.33 2.97 16.62 2.97C15.91 2.97 15.21 3.12 14.56 3.4C13.91 3.68 13.32 4.08 12.82 4.58L12 5.4L11.18 4.58C10.07 3.47 8.57 2.85 7 2.97C5.43 2.85 3.93 3.47 2.82 4.58C1.71 5.69 1.09 7.19 1.09 8.76C1.09 10.33 1.71 11.83 2.82 12.94L12 22L21.18 12.94C22.29 11.83 22.91 10.33 22.91 8.76C22.91 7.19 22.29 5.69 21.18 4.58H20.42Z" />
    {/* Pulse line */}
    <path d="M4 13H8L10 10L12 16L14 11L16 13H20" />
  </svg>
);

export default HeartPulseIcon;
