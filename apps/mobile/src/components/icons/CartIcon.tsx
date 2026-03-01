import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function CartIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Cart body */}
      <Path d="M1 1H5L7.68 14.39C7.77 14.87 7.93 15.28 8.38 15.54C8.83 15.81 9.23 16 9.76 16H19.4C19.86 16 20.3 15.81 20.62 15.54C20.94 15.27 21.15 14.88 21.23 14.45L23 6H6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Front wheel */}
      <Circle cx={10} cy={20} r={1.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Back wheel */}
      <Circle cx={19} cy={20} r={1.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
