import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function MalaIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Main bead circle */}
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
      {/* Top bead (guru bead) */}
      <Circle cx={12} cy={3} r={1.5} stroke={color} strokeWidth={1.5} />
      {/* Bottom beads */}
      <Circle cx={12} cy={21} r={1.5} stroke={color} strokeWidth={1.5} />
      {/* Side beads */}
      <Circle cx={3} cy={12} r={1.5} stroke={color} strokeWidth={1.5} />
      <Circle cx={21} cy={12} r={1.5} stroke={color} strokeWidth={1.5} />
      {/* Diagonal beads */}
      <Circle cx={5.64} cy={5.64} r={1} stroke={color} strokeWidth={1.5} />
      <Circle cx={18.36} cy={5.64} r={1} stroke={color} strokeWidth={1.5} />
      <Circle cx={5.64} cy={18.36} r={1} stroke={color} strokeWidth={1.5} />
      <Circle cx={18.36} cy={18.36} r={1} stroke={color} strokeWidth={1.5} />
      {/* Tassel */}
      <Path d="M12 3V0.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
