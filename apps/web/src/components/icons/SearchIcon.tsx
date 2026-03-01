import React from 'react';

interface SearchIconProps {
  size?: number;
  color?: string;
}

const SearchIcon: React.FC<SearchIconProps> = ({
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
    aria-label="Search"
  >
    {/* Magnifying glass circle */}
    <circle cx={11} cy={11} r={8} />
    {/* Handle */}
    <path d="M21 21L16.65 16.65" />
  </svg>
);

export default SearchIcon;
