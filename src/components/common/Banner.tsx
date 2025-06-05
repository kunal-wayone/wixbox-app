import React from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const Banner = ({
  imageUrl,
  title,
  subtitle,
  description,
  subDescription,
  showOverlay = true,
  overlayOpacity = 0.5,
  showNavigation = false,
  navigationRoute,
  buttonText = 'Explore',
}: any) => {
  const navigation = useNavigation<any>();

  return (
    <View className="w-full rounded-2xl overflow-hidden mb-4">
      <ImageBackground
        source={imageUrl}
        className="w-full h-52 relative"
        resizeMode="cover">
        {showOverlay && (
          <View
            className="absolute inset-0 bg-black"
            style={{opacity: overlayOpacity}}
          />
        )}
        <View className="flex-1 justify-center p-6">
          {subtitle && (
            <Text className="text-white text-sm font-semibold uppercase mb-1">
              {subtitle}
            </Text>
          )}
          {title && (
            <Text className="text-white text-2xl font-bold mb-2">{title}</Text>
          )}
          {description && (
            <Text className="text-white text-base mb-2">{description}</Text>
          )}
          {subDescription && (
            <Text className="text-gray-300 text-sm">{subDescription}</Text>
          )}
          {showNavigation && navigationRoute && (
            <TouchableOpacity
              className="mt-4 bg-blue-600 px-4 py-2 rounded-lg w-32"
              onPress={() => navigation.navigate(navigationRoute)}>
              <Text className="text-white text-center font-semibold">
                {buttonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default Banner;
