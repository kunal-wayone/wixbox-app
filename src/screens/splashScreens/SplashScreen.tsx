import React, {useEffect, useRef} from 'react';
import {View, Animated, Image, Text, Easing} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ImagePath} from '../../constants/ImagePath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {getCurrentUser} from '../../store/slices/userSlice';

const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const text = 'Welcome to WixBox'.split('');
  const charAnims = useRef(text.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const charAnimations = charAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    );

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
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
      Animated.parallel(charAnimations),
    ]).start(() => {
      setTimeout(() => {
        AsyncStorage.getItem('isIntroViewed').then((value: any) => {
          console.log('isIntroViewed:', value);
          if (value === 'true') {
            dispatch(getCurrentUser())
              .unwrap()
              .then((user: any) => {
                console.log('Fetched User:', user);
                navigation.replace('HomeScreen');
              })
              .catch((err: any) => {
                console.log('User not authenticated:', err);
                navigation.replace('LoginScreen');
              });
          } else {
            navigation.replace('SplashScreen1');
          }
        });
      }, 3000);
    });
  }, [fadeAnim, scaleAnim, rotateAnim, navigation, charAnims, dispatch]);

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
                    outputRange: [10, 0],
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
