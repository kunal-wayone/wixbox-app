import React, {useEffect, useRef} from 'react';
import {View, Animated, Image, Text, Easing} from 'react-native';
import {ImagePath} from '../../constants/ImagePath';

const SplashScreen = () => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [scaleAnim]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="w-48 h-48 bg-primary">
        <Animated.Image
          source={ImagePath?.logo}
          className="w-28 h-28 m-auto"
          resizeMode="contain"
          style={{transform: [{scale: scaleAnim}]}}
        />
      </View>
    </View>
  );
};

export default SplashScreen;
