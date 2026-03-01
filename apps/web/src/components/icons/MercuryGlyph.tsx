import React from 'react';

interface MercuryGlyphProps {
  size?: number;
  color?: string;
}

const MercuryGlyph: React.FC<MercuryGlyphProps> = ({
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
    aria-label="Mercury glyph"
  >
    {/* Horns/crescent on top */}
    <path d="M8 5C8 3 10 1.5 12 1.5C14 1.5 16 3 16 5" />
    {/* Circle */}
    <circle cx={12} cy={9} r={4} />
    {/* Vertical line below */}
    <path d="M12 13V20" />
    {/* Horizontal cross */}
    <path d="M9 17.5H15" />
  </svg>
);

export default MercuryGlyph;
