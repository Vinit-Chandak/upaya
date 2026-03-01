import React from 'react';

interface ShareIconProps {
  size?: number;
  color?: string;
}

const ShareIcon: React.FC<ShareIconProps> = ({
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
    aria-label="Share"
  >
    {/* Box */}
    <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" />
    {/* Upward arrow */}
    <path d="M16 6L12 2L8 6" />
    <path d="M12 2V15" />
  </svg>
);

export default ShareIcon;
