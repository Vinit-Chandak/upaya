import React from 'react';

interface CalendarIconProps {
  size?: number;
  color?: string;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({
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
    aria-label="Calendar"
  >
    {/* Calendar body */}
    <rect x={3} y={4} width={18} height={18} rx={2} />
    {/* Top pins */}
    <path d="M8 2V6" />
    <path d="M16 2V6" />
    {/* Horizontal divider */}
    <path d="M3 10H21" />
    {/* Grid dots */}
    <path d="M8 14H8.01" />
    <path d="M12 14H12.01" />
    <path d="M16 14H16.01" />
    <path d="M8 18H8.01" />
    <path d="M12 18H12.01" />
    <path d="M16 18H16.01" />
  </svg>
);

export default CalendarIcon;
