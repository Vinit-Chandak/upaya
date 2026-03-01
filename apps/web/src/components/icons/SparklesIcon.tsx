import React from 'react';

interface SparklesIconProps {
  size?: number;
  color?: string;
}

const SparklesIcon: React.FC<SparklesIconProps> = ({
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
    aria-label="Sparkles"
  >
    {/* Large star */}
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    {/* Small star top-right */}
    <path d="M19 1L19.5 3L21.5 3.5L19.5 4L19 6L18.5 4L16.5 3.5L18.5 3L19 1Z" />
    {/* Small star bottom-right */}
    <path d="M19 17L19.5 19L21.5 19.5L19.5 20L19 22L18.5 20L16.5 19.5L18.5 19L19 17Z" />
  </svg>
);

export default SparklesIcon;
