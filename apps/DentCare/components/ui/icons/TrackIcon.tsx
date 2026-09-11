import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function TrackIcon({ 
  size = 24, 
  color = '#8A8A8A',
  strokeWidth = 2 
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Chart axis */}
      <Path
        d="M3 3V21H21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Trend line */}
      <Path
        d="M7 15L11 11L14 14L19 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      <Path
        d="M16 8H19V11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tooth at end */}
      <Path
        d="M20 5C19.2 5 18.6 5.5 18.4 6.2C18.2 6.9 18.6 7.3 19 7.7C19.4 8.1 19.8 8.5 19.8 8.5C19.8 8.5 19.4 8.1 19 7.7C18.6 7.3 18.2 6.9 18.4 6.2C18.6 5.5 19.2 5 20 5Z"
        fill={color}
        opacity={0.6}
      />
    </Svg>
  );
}