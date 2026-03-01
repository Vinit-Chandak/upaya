import React from 'react';

interface UsersIconProps {
  size?: number;
  color?: string;
}

const UsersIcon: React.FC<UsersIconProps> = ({
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
    aria-label="Users"
  >
    {/* Front person head */}
    <circle cx={9} cy={7} r={4} />
    {/* Front person body */}
    <path d="M1 21V19C1 17.9391 1.42143 16.9217 2.17157 16.1716C2.92172 15.4214 3.93913 15 5 15H13C14.0609 15 15.0783 15.4214 15.8284 16.1716C16.5786 16.9217 17 17.9391 17 19V21" />
    {/* Back person head */}
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" />
    {/* Back person body */}
    <path d="M23 21V19C22.9949 18.1172 22.6979 17.2608 22.1553 16.5644C21.6126 15.868 20.8548 15.3707 20 15.15" />
  </svg>
);

export default UsersIcon;
