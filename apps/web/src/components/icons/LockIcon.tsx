import React from 'react';

interface LockIconProps {
  size?: number;
  color?: string;
}

const LockIcon: React.FC<LockIconProps> = ({
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
    aria-label="Lock"
  >
    {/* Lock body */}
    <rect x={3} y={11} width={18} height={11} rx={2} />
    {/* Lock shackle */}
    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" />
  </svg>
);

export default LockIcon;
