import React from 'react';

interface ShieldIconProps {
  size?: number;
  color?: string;
}

const ShieldIcon: React.FC<ShieldIconProps> = ({
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
    aria-label="Shield"
  >
    {/* Shield outline */}
    <path d="M12 2L3 6V12C3 17 7 21 12 22C17 21 21 17 21 12V6L12 2Z" />
  </svg>
);

export default ShieldIcon;
