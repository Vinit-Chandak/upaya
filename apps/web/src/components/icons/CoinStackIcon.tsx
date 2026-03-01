import React from 'react';

interface CoinStackIconProps {
  size?: number;
  color?: string;
}

const CoinStackIcon: React.FC<CoinStackIconProps> = ({
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
    aria-label="Stack of coins"
  >
    {/* Top coin */}
    <ellipse cx={12} cy={6} rx={7} ry={3} />
    {/* Second layer */}
    <path d="M5 6V10C5 11.657 8.134 13 12 13C15.866 13 19 11.657 19 10V6" />
    {/* Third layer */}
    <path d="M5 10V14C5 15.657 8.134 17 12 17C15.866 17 19 15.657 19 14V10" />
    {/* Bottom layer */}
    <path d="M5 14V18C5 19.657 8.134 21 12 21C15.866 21 19 19.657 19 18V14" />
  </svg>
);

export default CoinStackIcon;
