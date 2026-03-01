import React from 'react';
import Svg, { Path, Rect, Line } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function GiftIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Box bottom */}
      <Rect x={3} y={12} width={18} height={8} rx={1} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Box lid */}
      <Rect x={2} y={7} width={20} height={5} rx={1} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Vertical ribbon */}
      <Line x1={12} y1={7} x2={12} y2={20} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Bow left */}
      <Path d="M12 7C12 7 9 4 7.5 3.5C6 3 5 4 5.5 5.5C6 7 12 7 12 7Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Bow right */}
      <Path d="M12 7C12 7 15 4 16.5 3.5C18 3 19 4 18.5 5.5C18 7 12 7 12 7Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
