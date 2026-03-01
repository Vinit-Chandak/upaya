import React from 'react';

interface MeditationIconProps {
  size?: number;
  color?: string;
}

const MeditationIcon: React.FC<MeditationIconProps> = ({
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
    aria-label="Meditation"
  >
    {/* Head */}
    <circle cx={12} cy={4.5} r={2.5} />
    {/* Body torso */}
    <path d="M12 7V14" />
    {/* Crossed legs */}
    <path d="M7 20C7 20 8.5 16 12 16C15.5 16 17 20 17 20" />
    {/* Left arm */}
    <path d="M12 10L7.5 13" />
    {/* Right arm */}
    <path d="M12 10L16.5 13" />
    {/* Left knee */}
    <path d="M5 20H10" />
    {/* Right knee */}
    <path d="M14 20H19" />
  </svg>
);

export default MeditationIcon;
