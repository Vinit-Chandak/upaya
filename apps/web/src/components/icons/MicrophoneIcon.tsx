import React from 'react';

interface MicrophoneIconProps {
  size?: number;
  color?: string;
}

const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({
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
    aria-label="Microphone"
  >
    {/* Mic body */}
    <rect x={9} y={2} width={6} height={11} rx={3} />
    {/* Stand curve */}
    <path d="M5 10C5 13.866 8.134 17 12 17C15.866 17 19 13.866 19 10" />
    {/* Stand line */}
    <path d="M12 17V21" />
    {/* Base */}
    <path d="M8 21H16" />
  </svg>
);

export default MicrophoneIcon;
