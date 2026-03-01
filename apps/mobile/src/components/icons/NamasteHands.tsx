import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function NamasteHands({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Left hand */}
      <Path d="M8 21V13C8 11 9.5 9 12 7" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Right hand */}
      <Path d="M16 21V13C16 11 14.5 9 12 7" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Fingertips meeting */}
      <Path d="M12 7V3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Left fingers */}
      <Path d="M8 13C8 13 9 11 10 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Right fingers */}
      <Path d="M16 13C16 13 15 11 14 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Palm curve left */}
      <Path d="M8 17C9.5 16 10.5 15 12 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Palm curve right */}
      <Path d="M16 17C14.5 16 13.5 15 12 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
