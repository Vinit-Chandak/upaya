import React from 'react';

interface BookOpenIconProps {
  size?: number;
  color?: string;
}

const BookOpenIcon: React.FC<BookOpenIconProps> = ({
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
    aria-label="Open book"
  >
    {/* Left page */}
    <path d="M2 4C2 4 5 2 12 2V20C5 20 2 18 2 18V4Z" />
    {/* Right page */}
    <path d="M22 4C22 4 19 2 12 2V20C19 20 22 18 22 18V4Z" />
    {/* Spine */}
    <path d="M12 2V20" />
  </svg>
);

export default BookOpenIcon;
