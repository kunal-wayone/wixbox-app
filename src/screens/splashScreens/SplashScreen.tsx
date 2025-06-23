import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Text, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ImagePath } from '../../constants/ImagePath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { TokenStorage } from '../../utils/apiUtils';
import { fetchUser } from '../../store/slices/userSlice';
import { RootState } from '../../store/store';

const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [isLoading, setIsLoading] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const text = 'Welcome to WixBox'.split('');
  const charAnims = useRef(text.map(() => new Animated.Value(0))).current;

  const getUserData = async () => {
    try {
      setIsLoading(true);
      const data = await dispatch(fetchUser());
      console.log(data?.payload)
      return data?.payload;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const animateLogo = () => {
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
      ]).start();
    };

    const checkAuthAndNavigate = async () => {
      const introViewed = await AsyncStorage.getItem('isIntroViewed');
      const token: any = await TokenStorage.getToken();


      if (introViewed !== 'true') {
        navigation.replace('SplashScreen1');
        return;
      }
      if (!token) {
        navigation.replace('LoginScreen');
        return;
      }

      console.log(token)
      if (!token) {
        console.log("No Token")
        return;
      }
      const user = await getUserData()

      if (user) {
        console.log(user, "dskjfkjjdsk")
        if (user?.role === 'user') {
          navigation.navigate('HomeScreen', {
            screen: 'Market',
          });
        } else {
          if (user?.shopcreated) {
            navigation.navigate('HomeScreen', {
              screen: 'Home',
            });
          } else {
            navigation.navigate('CreateShopScreen');
          }
        }
      } else {
        TokenStorage.removeToken();
        TokenStorage.removeUser();
        TokenStorage.removeRole();
        navigation.replace('LoginScreen');
        return;
      }


    };

    animateLogo();
    const timer = setTimeout(checkAuthAndNavigate, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, [dispatch, navigation]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      className="flex-1 justify-center items-center bg-white"
      style={{ opacity: fadeAnim }}>
      <View className="w-48 h-auto rounded-2xl shadow-lg">
        <Animated.Image
          source={ImagePath?.logo}
          className="w-28 h-28 m-auto"
          resizeMode="contain"
          style={{ transform: [{ scale: scaleAnim }, { rotate: rotation }] }}
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
