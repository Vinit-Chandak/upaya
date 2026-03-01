import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function ShieldLock({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Shield */}
      <Path d="M12 2L3 6V11C3 16.52 6.84 21.74 12 23C17.16 21.74 21 16.52 21 11V6L12 2Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Lock body */}
      <Rect x={9} y={11} width={6} height={5} rx={1} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Lock shackle */}
      <Path d="M10 11V9C10 7.9 10.9 7 12 7C13.1 7 14 7.9 14 9V11" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Keyhole */}
      <Circle cx={12} cy={14} r={0.5} fill={color} />
    </Svg>
  );
}
