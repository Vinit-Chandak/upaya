import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function FamilyIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Left adult head */}
      <Circle cx={7} cy={5} r={2} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Right adult head */}
      <Circle cx={17} cy={5} r={2} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Child head */}
      <Circle cx={12} cy={9} r={1.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Left adult body */}
      <Path d="M3 21V17C3 15.34 4.34 14 6 14H8C9.66 14 11 15.34 11 17" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Right adult body */}
      <Path d="M13 17C13 15.34 14.34 14 16 14H18C19.66 14 21 15.34 21 17V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Child body */}
      <Path d="M9 21V18C9 16.9 9.9 16 11 16H13C14.1 16 15 16.9 15 18V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
