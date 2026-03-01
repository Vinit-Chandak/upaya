import React from 'react';

interface RefreshIconProps {
  size?: number;
  color?: string;
}

const RefreshIcon: React.FC<RefreshIconProps> = ({
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
    aria-label="Refresh"
  >
    {/* Top arrow arc */}
    <path d="M1 4V10H7" />
    <path d="M3.51 15C4.15839 16.8404 5.38734 18.4202 7.01166 19.5014C8.63598 20.5826 10.5677 21.1066 12.5157 20.9945C14.4637 20.8824 16.3226 20.1402 17.8121 18.8798C19.3017 17.6193 20.3413 15.9090 20.7742 14.0064" />
    {/* Bottom arrow arc */}
    <path d="M23 20V14H17" />
    <path d="M20.49 9C19.8416 7.15957 18.6127 5.57976 16.9883 4.49856C15.364 3.41736 13.4323 2.89336 11.4843 3.00548C9.53627 3.11761 7.67737 3.85977 6.18785 5.12022C4.69833 6.38067 3.65872 8.09098 3.22583 9.99365" />
  </svg>
);

export default RefreshIcon;
