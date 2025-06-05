import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const Button = ({
  text,
  iconUrl,
  iconPosition = 'left', // 'left' or 'right'
  color = 'button-purple-primary-10', // Default color class
  addClass = '', // Optional additional Tailwind classes
  navigationRoute, // Optional navigation route
  onPress, // Optional custom press handler
}: any) => {
  const navigation = useNavigation<any>();

  // Handle press action
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigationRoute) {
      navigation.navigate(navigationRoute);
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center px-4 py-2 rounded-lg ${color} ${addClass}`}
      onPress={handlePress}
      activeOpacity={0.9}>
      {iconUrl && iconPosition === 'left' && (
        <Image
          source={{uri: iconUrl}}
          className="w-5 h-5 mr-2"
          resizeMode="contain"
        />
      )}
      {text && (
        <Text className="text-foreground text-base font-semibold">{text}</Text>
      )}
      {iconUrl && iconPosition === 'right' && (
        <Image
          source={{uri: iconUrl}}
          className="w-5 h-5 ml-2"
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
};

export default Button;
