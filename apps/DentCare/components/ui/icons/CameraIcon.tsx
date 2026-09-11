import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function CameraIcon({
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Camera body */}
      <Path
        d="M3 8C3 6.89543 3.89543 6 5 6H7L8.5 4H15.5L17 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lens */}
      <Circle
        cx={12}
        cy={13}
        r={3.5}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}