import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function LightbulbIcon({
  size = 20,
  color = '#FF8C42',
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18H15M10 22H14M12 2C8.68629 2 6 4.68629 6 8C6 10.2208 7.2066 12.1599 9 13.1973V15C9 15.5523 9.44772 16 10 16H14C14.5523 16 15 15.5523 15 15V13.1973C16.7934 12.1599 18 10.2208 18 8C18 4.68629 15.3137 2 12 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}