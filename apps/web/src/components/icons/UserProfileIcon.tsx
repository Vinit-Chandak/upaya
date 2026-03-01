import React from 'react';

interface UserProfileIconProps {
  size?: number;
  color?: string;
}

const UserProfileIcon: React.FC<UserProfileIconProps> = ({
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
    aria-label="User profile"
  >
    {/* Head */}
    <circle cx={12} cy={8} r={4} />
    {/* Body */}
    <path d="M4 21V19C4 16.791 6.239 15 9 15H15C17.761 15 20 16.791 20 19V21" />
  </svg>
);

export default UserProfileIcon;
