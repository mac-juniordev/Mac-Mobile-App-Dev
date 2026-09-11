import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function ProfileIcon({ 
  size = 24, 
  color = '#8A8A8A',
  strokeWidth = 2 
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <Circle
        cx={12}
        cy={8}
        r={4}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Body */}
      <Path
        d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}