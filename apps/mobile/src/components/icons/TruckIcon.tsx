import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function TruckIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Truck cargo area */}
      <Rect x={1} y={3} width={15} height={13} rx={1} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Cab */}
      <Path d="M16 8H20L23 11V16H16V8Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Front wheel */}
      <Circle cx={5.5} cy={18.5} r={2.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Back wheel */}
      <Circle cx={18.5} cy={18.5} r={2.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
