import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function BotIcon({ 
  size = 24, 
  color = '#8A8A8A',
  strokeWidth = 2 
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bot head */}
      <Path
        d="M12 3C7 3 4 6 4 10V15C4 17 6 19 8 19H16C18 19 20 17 20 15V10C20 6 17 3 12 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Eyes */}
      <Circle cx={9} cy={11} r={1.5} fill={color} />
      <Circle cx={15} cy={11} r={1.5} fill={color} />
      {/* Smile */}
      <Path
        d="M9 15C10 16 14 16 15 15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Antenna */}
      <Path
        d="M12 3V2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={1.5} r={1} fill={color} />
    </Svg>
  );
}