import React from 'react';

interface ScrollRemedyProps {
  size?: number;
  color?: string;
}

const ScrollRemedy: React.FC<ScrollRemedyProps> = ({
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
    aria-label="Scroll remedy"
  >
    {/* Scroll body */}
    <path d="M8 3C6.343 3 5 4.343 5 6V18C5 19.657 6.343 21 8 21H18C19.657 21 19 19.657 19 18V6" />
    {/* Top curl */}
    <path d="M5 6C5 4.343 6.343 3 8 3H17C18.657 3 19 4.343 19 6" />
    {/* Bottom curl */}
    <path d="M5 18C5 19.657 6.343 21 8 21" />
    {/* Remedy lines */}
    <path d="M9 8H15" />
    <path d="M9 11H15" />
    <path d="M9 14H13" />
  </svg>
);

export default ScrollRemedy;
