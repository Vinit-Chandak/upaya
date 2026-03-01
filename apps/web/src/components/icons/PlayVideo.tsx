import React from 'react';

interface PlayVideoProps {
  size?: number;
  color?: string;
}

const PlayVideo: React.FC<PlayVideoProps> = ({
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
    aria-label="Play video"
  >
    {/* Circle */}
    <circle cx={12} cy={12} r={10} />
    {/* Play triangle */}
    <path d="M10 8L16 12L10 16V8Z" fill={color} />
  </svg>
);

export default PlayVideo;
