import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Animated,
  ScrollView,
  Easing,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import {ImagePath} from '../../constants/ImagePath';

// Create an Animated ScrollView
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const LoadingComponent = () => {
  // Animation refs for fade, scale, and rotation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // State for cycling dots in "Loading..."
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Continuous rotation animation for the image
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Pulsing scale animation for the image
    const scalePulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Fade-in animation for the entire component
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });

    // Start image and fade animations
    Animated.parallel([fadeIn, scalePulse, rotateLoop]).start();

    // Dot cycling for "Loading..." text using setInterval
    const dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500); // Cycle dots every 500ms

    // Cleanup: Reset animations and clear interval
    return () => {
      rotateAnim.setValue(0);
      clearInterval(dotInterval);
    };
  }, [fadeAnim, scaleAnim, rotateAnim]);

  // Interpolate rotation for continuous spinning
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <AnimatedScrollView
      contentContainerStyle={[styles.container, {opacity: fadeAnim}]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.imageWrapper}>
        <Animated.Image
          source={ImagePath?.logo}
          style={[
            styles.image,
            {transform: [{scale: scaleAnim}, {rotate: rotation}]},
          ]}
          resizeMode="contain"
        />
        {/* <ActivityIndicator size="large" color="#B68AD4" style={styles.spinner} /> */}
        {/* <Text style={styles.loadingText}>
          Loading{dots}
        </Text> */}
      </View>
    </AnimatedScrollView>
  );
};

// Styles for structure and appearance
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: '100%',
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
  },
  spinner: {
    marginVertical: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default LoadingComponent;

export const loadingSpinner = (
  <View className="absolute inset-0 bg-black/60 flex justify-center items-center z-10">
    <ActivityIndicator size="large" color="#B68AD4" />
  </View>
);
