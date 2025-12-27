import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 80, showText = false }: LogoProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Shield background */}
        <Path
          d="M50 5 L80 20 L80 40 Q80 70 50 95 Q20 70 20 40 L20 20 Z"
          fill="#DC2626"
          stroke="#B91C1C"
          strokeWidth="2"
        />
        
        {/* Mesh network pattern */}
        <Circle cx="35" cy="30" r="2" fill="white" opacity="0.8" />
        <Circle cx="65" cy="30" r="2" fill="white" opacity="0.8" />
        <Circle cx="30" cy="50" r="2" fill="white" opacity="0.8" />
        <Circle cx="50" cy="45" r="2" fill="white" opacity="0.8" />
        <Circle cx="70" cy="50" r="2" fill="white" opacity="0.8" />
        <Circle cx="40" cy="70" r="2" fill="white" opacity="0.8" />
        <Circle cx="60" cy="70" r="2" fill="white" opacity="0.8" />
        
        {/* Connecting lines */}
        <Line x1="35" y1="30" x2="50" y2="45" stroke="white" strokeWidth="1" opacity="0.6" />
        <Line x1="65" y1="30" x2="50" y2="45" stroke="white" strokeWidth="1" opacity="0.6" />
        <Line x1="30" y1="50" x2="50" y2="45" stroke="white" strokeWidth="1" opacity="0.6" />
        <Line x1="70" y1="50" x2="50" y2="45" stroke="white" strokeWidth="1" opacity="0.6" />
        <Line x1="40" y1="70" x2="50" y2="45" stroke="white" strokeWidth="1" opacity="0.6" />
        <Line x1="60" y1="70" x2="50" y2="45" stroke="white" strokeWidth="1" opacity="0.6" />
        
        {/* Central SOS text */}
        <SvgText
          x="50"
          y="50"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="12"
          fontWeight="bold"
          fill="white"
        >
          SOS
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});