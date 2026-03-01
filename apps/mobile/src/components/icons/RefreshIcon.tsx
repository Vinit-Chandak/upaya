import React from 'react';
import Svg, { Path, Polyline } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function RefreshIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top arrow curve */}
      <Path d="M1 4V10H7" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom arrow curve */}
      <Path d="M23 20V14H17" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Top arc */}
      <Path d="M20.49 9C19.84 7.22 18.71 5.66 17.22 4.49C15.73 3.33 13.95 2.6 12.07 2.38C10.2 2.16 8.3 2.47 6.6 3.27C4.9 4.07 3.47 5.33 2.46 6.91L1 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom arc */}
      <Path d="M3.51 15C4.16 16.78 5.29 18.34 6.78 19.51C8.27 20.67 10.05 21.4 11.93 21.62C13.8 21.84 15.7 21.53 17.4 20.73C19.1 19.93 20.53 18.67 21.54 17.09L23 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
