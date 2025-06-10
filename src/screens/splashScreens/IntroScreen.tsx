import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import React, {useRef, useEffect, useState, useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {ImagePath} from '../../constants/ImagePath';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('screen');

const splash1 = ImagePath.splash1;
const splash2 = ImagePath.splash2;
const splash3 = ImagePath.splash3;
const splash4 = ImagePath.splash4;
const splash5 = ImagePath.splash5;

const spTop1 = ImagePath.sp1;
const spTop2 = ImagePath.sp2;
const spTop3 = ImagePath.sp3;
const spTop4 = ImagePath.sp4;
const spTop5 = ImagePath.sp5;

const shi = [
  {
    id: 1,
    title: 'Find out anything Nearby',
    splash: splash1,
    spTop: spTop1,
  },
  {
    id: 2,
    title: 'Navigate to any store',
    splash: splash2,
    spTop: spTop2,
  },
  {
    id: 3,
    title: 'Highlights your fav Spots',
    splash: splash3,
    spTop: spTop3,
  },
  {
    id: 4,
    title: 'Promote any product or service',
    splash: splash4,
    spTop: spTop4,
  },
  {
    id: 5,
    title: 'Engage with your Customers',
    splash: splash5,
    spTop: spTop5,
  },
];

// Preload images
const preloadImages = [
  splash1,
  splash2,
  splash3,
  splash4,
  splash5,
  spTop1,
  spTop2,
  spTop3,
  spTop4,
  spTop5,
];

// Define rotation angles and positions for each index
const rotationAngles = ['65deg', '10deg', '5deg', '20deg', '-5deg'];
const translateXPositions = [
  -width - 70,
  -width * 0.1,
  -width * 0.22,
  width * 0,
  -width * 0.15,
];
const translateYPositions = [
  height * 0,
  -height * 0.52,
  -height * 0.55,
  -height * 0.53,
  -height * 0.55,
];

const IntroScreen = () => {
  const navigation = useNavigation<any>();
  const [index, setIndex] = useState(0);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const fadeAnimMain = useRef(new Animated.Value(0)).current;
  const fadeAnimTop = useRef(new Animated.Value(0)).current;
  const fadeAnimText = useRef(new Animated.Value(0)).current;
  const slideAnimMain = useRef(new Animated.Value(width / 2)).current;
  const slideAnimText = useRef(new Animated.Value(100)).current;
  const scaleAnimTop = useRef(new Animated.Value(0.8)).current;
  const translateXAnimTop = useRef(
    new Animated.Value(translateXPositions[0]),
  ).current;
  const translateYAnimTop = useRef(
    new Animated.Value(translateYPositions[0]),
  ).current;
  const rotationAnimTop = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Pulse animation for the button
  const startButtonPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [buttonScale]);

  // Continuous subtle rotation for top image
  const startTopImageRotation = useCallback(() => {
    rotationAnimTop.setValue(0);
    Animated.loop(
      Animated.timing(rotationAnimTop, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotationAnimTop]);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    preloadImages.forEach(image => {
      Image.prefetch(Image.resolveAssetSource(image).uri)
        .then(() => {
          loadedCount += 1;
          if (loadedCount === preloadImages.length) {
            setIsImagesLoaded(true);
            // Initial animations with stagger
            Animated.sequence([
              Animated.parallel([
                Animated.timing(fadeAnimMain, {
                  toValue: 1,
                  duration: 600,
                  easing: Easing.out(Easing.elastic(1)),
                  useNativeDriver: true,
                }),
                Animated.timing(slideAnimMain, {
                  toValue: 0,
                  duration: 600,
                  easing: Easing.out(Easing.elastic(1)),
                  useNativeDriver: true,
                }),
              ]),
              Animated.parallel([
                Animated.timing(fadeAnimTop, {
                  toValue: 1,
                  duration: 600,
                  easing: Easing.out(Easing.cubic),
                  useNativeDriver: true,
                }),
                Animated.spring(scaleAnimTop, {
                  toValue: 1,
                  friction: 5,
                  tension: 40,
                  useNativeDriver: true,
                }),
                Animated.timing(translateXAnimTop, {
                  toValue: translateXPositions[0],
                  duration: 600,
                  easing: Easing.out(Easing.cubic),
                  useNativeDriver: true,
                }),
                Animated.timing(translateYAnimTop, {
                  toValue: translateYPositions[0],
                  duration: 600,
                  easing: Easing.out(Easing.cubic),
                  useNativeDriver: true,
                }),
              ]),
              Animated.parallel([
                Animated.timing(fadeAnimText, {
                  toValue: 1,
                  duration: 600,
                  easing: Easing.out(Easing.bounce),
                  useNativeDriver: true,
                }),
                Animated.spring(slideAnimText, {
                  toValue: 0,
                  friction: 6,
                  tension: 50,
                  useNativeDriver: true,
                }),
              ]),
            ]).start(() => {
              startButtonPulse();
              startTopImageRotation();
            });
          }
        })
        .catch(err => console.warn('Image prefetch failed:', err));
    });
  }, [startButtonPulse, startTopImageRotation]);

  const handleNext = useCallback(() => {
    // Fade out and slide out with stagger
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnimMain, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimMain, {
          toValue: -width / 2,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnimTop, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimTop, {
          toValue: 0.8,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnimTop, {
          toValue: translateXPositions[index],
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnimTop, {
          toValue: translateYPositions[index],
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnimText, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimText, {
          toValue: 100,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      requestAnimationFrame(() => {
        const nextIndex = index + 1;
        if (nextIndex >= shi.length) {
          handleDenyAndContinue();
        } else {
          setIndex(nextIndex);
          // Reset animations
          fadeAnimMain.setValue(0);
          slideAnimMain.setValue(width / 2);
          fadeAnimTop.setValue(0);
          scaleAnimTop.setValue(0.8);
          translateXAnimTop.setValue(translateXPositions[nextIndex]);
          translateYAnimTop.setValue(translateYPositions[nextIndex]);
          fadeAnimText.setValue(0);
          slideAnimText.setValue(100);
          rotationAnimTop.setValue(0);
          // Fade in and slide in with stagger
          Animated.sequence([
            Animated.parallel([
              Animated.timing(fadeAnimMain, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.elastic(1)),
                useNativeDriver: true,
              }),
              Animated.timing(slideAnimMain, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.elastic(1)),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(fadeAnimTop, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnimTop, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.timing(translateXAnimTop, {
                toValue: translateXPositions[nextIndex],
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(translateYAnimTop, {
                toValue: translateYPositions[nextIndex],
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(fadeAnimText, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.bounce),
                useNativeDriver: true,
              }),
              Animated.spring(slideAnimText, {
                toValue: 0,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            startButtonPulse();
            startTopImageRotation();
          });
        }
      });
    });
  }, [index, navigation, startButtonPulse, startTopImageRotation]);

  const handleDenyAndContinue = async () => {
    await AsyncStorage.setItem('isIntroViewed', 'true');
    navigation.replace('AccountTypeScreen');
  };

  const handleSkip = useCallback(() => {
    handleDenyAndContinue();
  }, [navigation]);

  if (!isImagesLoaded) {
    return (
      <View className="w-full h-full bg-white flex justify-center items-center">
        <Text className="text-lg font-poppins text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="w-full h-full bg-white p-4">
      {/* Top Image */}
      <Animated.Image
        source={ImagePath.sp}
        resizeMode="contain"
        className="absolute"
        style={{
          opacity: fadeAnimTop,
          width: width * 1.2,
          height: height * 0.9,
          transform: [
            {scale: scaleAnimTop},
            {
              rotate: rotationAnimTop.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  rotationAngles[index],
                  `${parseFloat(rotationAngles[index]) + 5}deg`,
                ],
              }),
            },
            {translateX: translateXAnimTop},
            {translateY: translateYAnimTop},
          ],
        }}
      />

      {/* Skip Button */}
      <TouchableOpacity
        className="absolute z-50 top-8 right-10"
        onPress={handleSkip}>
        <Text className="font-poppins font-semibold text-base text-gray-600">
          Skip
        </Text>
      </TouchableOpacity>

      {/* Main Image */}
      <View className="w-full h-80 mt-40 mx-auto">
        <Animated.Image
          source={shi[index]?.splash}
          resizeMode="contain"
          className="w-full h-full"
          style={{
            opacity: fadeAnimMain,
            transform: [{translateX: slideAnimMain}],
          }}
        />
      </View>

      {/* Title and Button */}
      <View className="p-4 pt-16">
        <Animated.Text
          className="text-2xl text-center font-poppins font-semibold w-3/5 mx-auto text-gray-800"
          style={{
            opacity: fadeAnimText,
            transform: [{translateY: slideAnimText}],
          }}>
          {shi[index]?.title}
        </Animated.Text>

        <TouchableOpacity
          className="bg-black w-16 h-16 rounded-full p-4 mt-10 flex justify-center items-center mx-auto"
          onPress={handleNext}>
          <Animated.View style={{transform: [{scale: buttonScale}]}}>
            <Feather name="fast-forward" color="#fff" size={30} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IntroScreen;
