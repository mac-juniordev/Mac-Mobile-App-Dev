import React from 'react';
import Svg, {
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  backgroundColor?: string;
}

export default function Logo({
  size = 100,
  showText = true,
  textColor = '#2563EB',
  backgroundColor = 'transparent',
}: LogoProps) {
  const width = size * 0.8;
  const height = size;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 80 100"
      fill="none"
    >
      <Defs>
        {/* Tooth fill */}
        <LinearGradient
          id="toothFill"
          x1="15"
          y1="5"
          x2="65"
          y2="95"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#E8F1FF" />
        </LinearGradient>

        {/* Tooth outline */}
        <LinearGradient
          id="toothStroke"
          x1="15"
          y1="10"
          x2="65"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#60A5FA" />
          <Stop offset="1" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>

      {/* Optional background */}
      {backgroundColor !== 'transparent' && (
        <Path
          d="M0 0H80V100H0Z"
          fill={backgroundColor}
        />
      )}

      {/* =====================================================
          TOOTH
      ====================================================== */}
      <G>
        {/* Soft tooth shadow */}
        <Path
          d="
            M40 4
            C24 4 12 14 9 29
            C6 43 10 56 14 68
            C18 80 23 90 29 94
            C33 97 37 96 39 93
            C40 91 40 87 40 83
            C40 87 40 91 41 93
            C43 96 47 97 51 94
            C57 90 62 80 66 68
            C70 56 74 43 71 29
            C68 14 56 4 40 4Z
          "
          fill="#D7E7FF"
        />

        {/* Main tooth */}
        <Path
          d="
            M40 6
            C25 6 14 15 11 30
            C8 43 12 55 16 66
            C19 76 24 86 30 91
            C33 94 36 94 38 92
            C40 90 40 86 40 82
            C40 86 40 90 42 92
            C44 94 47 94 50 91
            C56 86 61 76 64 66
            C68 55 72 43 69 30
            C66 15 55 6 40 6Z
          "
          fill="url(#toothFill)"
          stroke="url(#toothStroke)"
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* =================================================
            TOOTH HIGHLIGHT
        ================================================== */}
        <Path
          d="
            M25 17
            C18 22 15 30 15 39
            C15 47 17 54 20 61
          "
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.9}
        />

        {/* =================================================
            DC MONOGRAM
            The D is intentionally larger.
        ================================================== */}
        {showText && (
          <G>
            {/* ---------------- D ---------------- */}

            {/* D vertical stem */}
            <Path
              d="
                M25 38
                L25 67
                L29 67
                L29 38
                Z
              "
              fill={textColor}
            />

            {/* D curved body */}
            <Path
              d="
                M29 38
                H35
                C43 38 47 43 47 52.5
                C47 62 43 67 35 67
                H29
                V63
                H34
                C39 63 42 60 42 52.5
                C42 45 39 42 34 42
                H29
                Z
              "
              fill={textColor}
            />

            {/* ---------------- C ---------------- */}

            <Path
              d="
                M57 45
                C55 42 52 41 49 41
                C43 41 40 46 40 52.5
                C40 59 43 64 49 64
                C52 64 55 63 57 60
                L54 57
                C53 59 51 60 49 60
                C46 60 44 57 44 52.5
                C44 48 46 45 49 45
                C51 45 53 46 54 48
                Z
              "
              fill={textColor}
            />

            {/* Small connecting accent */}
            <Path
              d="
                M37 52
                H43
              "
              stroke="#60A5FA"
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.8}
            />
          </G>
        )}

        {/* =================================================
            BOTTOM TOOTH DETAIL
        ================================================== */}
        <Path
          d="
            M29 89
            C33 92 36 93 38 90
            M42 90
            C44 93 47 92 51 89
          "
          fill="none"
          stroke="#2563EB"
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.35}
        />
      </G>
    </Svg>
  );
}
