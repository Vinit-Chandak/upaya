import React from 'react';

interface StarRatingProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  size = 24,
  color = 'currentColor',
  filled = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : 'none'}
    stroke={color}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label={filled ? 'Filled star' : 'Empty star'}
  >
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

export default StarRating;
