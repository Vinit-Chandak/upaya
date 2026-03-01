import React from 'react';

interface ShieldLockProps {
  size?: number;
  color?: string;
}

const ShieldLock: React.FC<ShieldLockProps> = ({
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
    aria-label="Shield lock"
  >
    {/* Shield outline */}
    <path d="M12 2L3 6V12C3 17 7 21 12 22C17 21 21 17 21 12V6L12 2Z" />
    {/* Lock body */}
    <rect x={9.5} y={11} width={5} height={4} rx={0.5} />
    {/* Lock shackle */}
    <path d="M10.5 11V9C10.5 7.895 11.171 7 12 7C12.829 7 13.5 7.895 13.5 9V11" />
    {/* Keyhole */}
    <circle cx={12} cy={13} r={0.5} fill={color} stroke="none" />
  </svg>
);

export default ShieldLock;
