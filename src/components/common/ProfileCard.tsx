import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const ProfileCard = ({
  profileImageUrl,
  name,
  iconImageUrl,
  status,
  rating,
  layout = 'col', // 'row' or 'col' for flex direction
  onProfilePress, // Optional callback for profile image press
}: any) => {
  const navigation = useNavigation<any>();

  // Helper to render star icons based on rating (1 to 5)
  const renderStars = (rating: any) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          className={`text-lg ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}>
          ★
        </Text>,
      );
    }
    return stars;
  };

  return (
    <View
      className={`py-4 bg-white rounded-2xl shadow-md ${
        layout === 'row' ? 'flex-row' : 'flex-col'
      } items-center justify-start w-full mb-4`}>
      {/* Section 1: Profile Image */}
      {profileImageUrl && (
        <TouchableOpacity
          onPress={
            onProfilePress
              ? () => onProfilePress()
              : () => navigation.navigate('ProfileDetails')
          }
          className="">
          <Image
            source={profileImageUrl}
            className="w-16 h-16 rounded-full border-2 border-gray-200"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {/* Section 2: Name and Icon */}
      {(name || iconImageUrl) && (
        <View
          className={`flex-col items-center ${
            layout === 'col' ? 'mb-4' : 'mx-4'
          }`}>
          <View className='flex-row items-center justify-start  '>
            {name && (
              <Text className="text-lg font-semibold text-gray-800 mr-2">
                {name}
              </Text>
            )}
            {iconImageUrl && (
              <Image
                source={iconImageUrl}
                className="w-4 h-4 rounded-full"
                resizeMode="contain"
              />
            )}
          </View>
          {status && (
            <Text className="text-sm w-full text-gray-500 mt-1">{status}</Text>
          )}
        </View>
      )}

      {/* Section 3: Rating Stars */}
      {/* {rating && <View className="flex-row">{renderStars(rating)}</View>} */}
    </View>
  );
};

export default ProfileCard;
