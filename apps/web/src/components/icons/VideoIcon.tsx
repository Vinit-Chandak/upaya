import React from 'react';

interface VideoIconProps {
  size?: number;
  color?: string;
}

const VideoIcon: React.FC<VideoIconProps> = ({
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
    aria-label="Video"
  >
    {/* Camera body */}
    <rect x={2} y={5} width={14} height={14} rx={2} />
    {/* Lens / viewfinder triangle */}
    <path d="M16 10L22 6V18L16 14" />
  </svg>
);

export default VideoIcon;
