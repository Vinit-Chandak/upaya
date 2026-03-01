import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function FireIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer flame */}
      <Path d="M12 2C12 2 8 6 8 10C8 11.86 8.63 13.29 9.76 14.24C10.28 14.67 10.54 15.36 10.32 16C10.08 16.72 9.4 17.18 8.64 17.12C6.5 16.96 5 15.28 5 13C5 11.17 6.47 8.44 7.5 7C5 9.5 3 13 3 16C3 19.87 6.13 23 10 23H14C17.87 23 21 19.87 21 16C21 10 12 2 12 2Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Inner flame */}
      <Path d="M12 18C13.66 18 15 16.66 15 15C15 13.34 12 10 12 10C12 10 9 13.34 9 15C9 16.66 10.34 18 12 18Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
