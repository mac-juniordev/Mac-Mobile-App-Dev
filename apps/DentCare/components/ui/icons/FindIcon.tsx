import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function FindIcon({ 
  size = 24, 
  color = '#3A86FF',
  strokeWidth = 2 
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={11}
        cy={11}
        r={7}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M20 20L16 16"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Tooth inside */}
      <Path
        d="M11 8C10 8 9 8.5 8.8 9.5C8.6 10.5 9 11 9.5 11.5C10 12 10.5 12.5 10.5 12.5C10.5 12.5 11 12 11.5 11.5C12 11 12.4 10.5 12.2 9.5C12 8.5 12 8 11 8Z"
        fill={color}
        opacity={0.5}
      />
    </Svg>
  );
}