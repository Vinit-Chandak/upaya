import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function MicrophoneIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Mic body */}
      <Rect x={9} y={2} width={6} height={11} rx={3} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Outer arc */}
      <Path d="M19 10V12C19 13.86 18.26 15.64 16.95 16.95C15.64 18.26 13.86 19 12 19C10.14 19 8.36 18.26 7.05 16.95C5.74 15.64 5 13.86 5 12V10" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Stand */}
      <Path d="M12 19V23" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Base */}
      <Path d="M8 23H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
