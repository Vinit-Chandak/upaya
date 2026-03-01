import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function UsersIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Front person body */}
      <Path d="M17 21V19C17 17.94 16.58 16.92 15.83 16.17C15.08 15.42 14.06 15 13 15H5C3.94 15 2.92 15.42 2.17 16.17C1.42 16.92 1 17.94 1 19V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Front person head */}
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Back person body */}
      <Path d="M23 21V19C22.99 18.13 22.7 17.29 22.18 16.59C21.65 15.89 20.93 15.37 20.1 15.09" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Back person head */}
      <Path d="M16.1 3.09C16.93 3.37 17.66 3.89 18.18 4.59C18.71 5.29 19 6.13 19 7C19 7.87 18.71 8.71 18.18 9.41C17.66 10.11 16.93 10.63 16.1 10.91" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
