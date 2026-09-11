import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface EyeIconProps {
  size?: number;
  color?: string;
  isVisible?: boolean;
}

export default function EyeIcon({ 
  size = 20, 
  color = '#8A8A8A',
  isVisible = true 
}: EyeIconProps) {
  if (isVisible) {
    // Open eye
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // Closed eye (with slash)
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3L21 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M10.5 10.5C11.2089 9.79112 12.7911 9.79112 13.5 10.5C14.2089 11.2089 14.2089 12.7911 13.5 13.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M17.5 17.5C15.8333 18.5 13.9167 19 12 19C5 19 2 12 2 12C3.5 9.5 6 7.5 9.5 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M14.5 6.5C17.5 7.5 20.5 10 22 12C21.5 13 20.5 14.5 19 15.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}