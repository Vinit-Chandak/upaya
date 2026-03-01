import React from 'react';

interface ClipboardIconProps {
  size?: number;
  color?: string;
}

const ClipboardIcon: React.FC<ClipboardIconProps> = ({
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
    aria-label="Clipboard"
  >
    {/* Clipboard body */}
    <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" />
    {/* Clip */}
    <rect x={8} y={2} width={8} height={4} rx={1} />
    {/* Text lines */}
    <path d="M8 12H16" />
    <path d="M8 16H12" />
  </svg>
);

export default ClipboardIcon;
