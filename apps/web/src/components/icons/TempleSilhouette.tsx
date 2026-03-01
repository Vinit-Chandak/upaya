import React from 'react';

interface TempleSilhouetteProps {
  size?: number;
  color?: string;
}

const TempleSilhouette: React.FC<TempleSilhouetteProps> = ({
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
    aria-label="Temple silhouette"
  >
    {/* Shikhara (spire) */}
    <path d="M12 2L12 5" />
    <path d="M10 5C10 5 10 3.5 12 2C14 3.5 14 5 14 5" />
    {/* Temple dome */}
    <path d="M8 10C8 7 10 5 12 5C14 5 16 7 16 10" />
    {/* Temple body */}
    <path d="M6 10H18V14H6V10Z" />
    {/* Pillars */}
    <path d="M7 14V20" />
    <path d="M17 14V20" />
    {/* Steps/base */}
    <path d="M5 20H19" />
    {/* Door */}
    <path d="M10 20V16H14V20" />
  </svg>
);

export default TempleSilhouette;
