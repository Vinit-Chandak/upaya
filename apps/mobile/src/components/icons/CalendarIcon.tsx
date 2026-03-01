import React from 'react';
import Svg, { Path, Rect, Line } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function CalendarIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Calendar body */}
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Top pins */}
      <Line x1={16} y1={2} x2={16} y2={6} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={8} y1={2} x2={8} y2={6} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Horizontal divider */}
      <Line x1={3} y1={10} x2={21} y2={10} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Grid lines */}
      <Line x1={8} y1={14} x2={8} y2={14} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={12} y1={14} x2={12} y2={14} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={16} y1={14} x2={16} y2={14} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={8} y1={18} x2={8} y2={18} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={12} y1={18} x2={12} y2={18} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={16} y1={18} x2={16} y2={18} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
