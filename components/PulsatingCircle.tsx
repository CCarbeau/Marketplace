import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const PulsatingCircle: React.FC = () => {
  const ringScaleValue = useRef(new Animated.Value(0.33)).current;
  const dotScaleValue = useRef(new Animated.Value(0.8)).current;
  const ringOpacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation for the ring scale and opacity
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScaleValue, {
            toValue: 2, // Scale to 300%
            duration: 1250,
            easing: Easing.bezier(0.215, 0.61, 0.355, 1),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityValue, {
            toValue: 0, // Fade out
            duration: 1250,
            easing: Easing.bezier(0.215, 0.61, 0.355, 1),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScaleValue, {
            toValue: 0.33, // Reset scale
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityValue, {
            toValue: 1, // Reset opacity
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Animation for the dot scale
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScaleValue, {
          toValue: 1,
          duration: 625,
          easing: Easing.bezier(0.455, 0.03, 0.515, 0.955),
          useNativeDriver: true,
        }),
        Animated.timing(dotScaleValue, {
          toValue: 0.8,
          duration: 625,
          easing: Easing.bezier(0.455, 0.03, 0.515, 0.955),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [ringScaleValue, ringOpacityValue, dotScaleValue]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: ringScaleValue }],
            opacity: ringOpacityValue,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [{ scale: dotScaleValue }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },
  ring: {
    position: 'absolute',
    width: 20, 
    height: 20,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
  },
  dot: {
    position: 'absolute',
    width: 15,
    height: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
});

export default PulsatingCircle;