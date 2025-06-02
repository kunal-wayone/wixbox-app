import React, {useEffect, useRef} from 'react';
import {View, Animated, Image, Text, Easing} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ImagePath} from '../../constants/ImagePath';

const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Background fade
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Logo scale
  const rotateAnim = useRef(new Animated.Value(0)).current; // Logo rotation
  const text = 'Welcome to the WixBox'.split(''); // Split text into characters
  const charAnims = useRef(text.map(() => new Animated.Value(0))).current; // Animation for each character

  useEffect(() => {
    // Create character animations with staggered delays
    const charAnimations = charAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 100, // Staggered delay for wave effect
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    );

    Animated.sequence([
      // 1. Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      // 2. Scale and rotate logo
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.elastic(1),
        }),
      ]),
      // 3. Animate text characters
      Animated.parallel(charAnimations),
    ]).start(() => {
      // Navigate to the next screen after animations complete
      setTimeout(() => {
        navigation.replace('SplashScreen1'); // Replace 'Home' with your target screen name
      }, 3000); // Wait 3 seconds after animations
    });
  }, [fadeAnim, scaleAnim, rotateAnim, navigation, charAnims]);

  // Interpolate rotation for logo
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      className="flex-1 justify-center items-center bg-white"
      style={{opacity: fadeAnim}}>
      <View className="w-48 h-autorounded-2xl shadow-lg">
        <Animated.Image
          source={ImagePath?.logo}
          className="w-28 h-28 m-auto"
          resizeMode="contain"
          style={{
            transform: [{scale: scaleAnim}, {rotate: rotation}],
          }}
        />
      </View>
      <View className="mt-4 flex-row">
        {text.map((char, index) => (
          <Animated.Text
            key={index}
            className="text-lg font-bold text-primary-100"
            style={{
              opacity: charAnims[index],
              transform: [
                {
                  translateY: charAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0], // Slight upward movement for wave effect
                  }),
                },
              ],
            }}>
            {char}
          </Animated.Text>
        ))}
      </View>
    </Animated.View>
  );
};

export default SplashScreen;
