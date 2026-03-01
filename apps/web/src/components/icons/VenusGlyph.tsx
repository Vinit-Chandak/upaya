import React from 'react';

interface VenusGlyphProps {
  size?: number;
  color?: string;
}

const VenusGlyph: React.FC<VenusGlyphProps> = ({
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
    aria-label="Venus glyph"
  >
    {/* Circle */}
    <circle cx={12} cy={9} r={5} />
    {/* Vertical line below */}
    <path d="M12 14V21" />
    {/* Horizontal cross */}
    <path d="M9 18H15" />
  </svg>
);

export default VenusGlyph;
