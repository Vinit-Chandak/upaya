import React from 'react';

interface LotusSymbolProps {
  size?: number;
  color?: string;
}

const LotusSymbol: React.FC<LotusSymbolProps> = ({
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
    aria-label="Lotus symbol"
  >
    {/* Center petal */}
    <path d="M12 4C12 4 9 9 9 13C9 15 10.343 16 12 16C13.657 16 15 15 15 13C15 9 12 4 12 4Z" />
    {/* Left petal */}
    <path d="M7 8C7 8 4 12 5 15C5.5 16.5 7 17 8.5 16C10 15 10 13 10 13" />
    {/* Right petal */}
    <path d="M17 8C17 8 20 12 19 15C18.5 16.5 17 17 15.5 16C14 15 14 13 14 13" />
    {/* Base leaves */}
    <path d="M6 18C8 17 10 16.5 12 17C14 16.5 16 17 18 18" />
    {/* Stem */}
    <path d="M12 17V21" />
  </svg>
);

export default LotusSymbol;
