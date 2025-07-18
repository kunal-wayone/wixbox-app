import React from 'react';
import { View, Text, Image, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileCard = ({
  profileImageUrl,
  name,
  iconImageUrl,
  status,
  rating,
  layout = 'col', // 'row' or 'col' for flex direction
  onProfilePress, // Optional callback for profile image press
  toggleLoadingIds,
  toggleStoreStatus,
  storeStatus,
  shopId,
  shopCategory
}: any) => {
  const navigation = useNavigation<any>();

  // Helper to render star icons based on rating (1 to 5)
  const renderStars = (rating: any) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}>
          ★
        </Text>,
      );
    }
    return stars;
  };

  return (
    <View
      className={` bg-white rounded-2xl shadow-md ${layout === 'row' ? 'flex-row' : 'flex-col'
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
          className={`flex-col items-center ${layout === 'col' ? 'mb-4' : 'mx-4'
            }`}>
          <View className='flex-row items-center justify-start  '>
            {name && (
              <Text className="text-lg font-semibold text-gray-800 mr-2">
                {name}
              </Text>
            )}
            {status && (
              <View className={`w-3 h-3 rounded-full ${status === "Online" ? "bg-green-500" : "bg-red-500"}`} />
            )}
          </View>
          {rating && <View className="flex-row mr-auto">{renderStars(rating)}</View>}
          {/* {shopCategory && (
            <Text className="text-  text-gray-500 mr-auto">{shopCategory}</Text>
          )} */}
        </View>
      )}

      {/* Section 3: Rating Stars */}
      <View className="flex-col items-center justify-between ml-auto">
        {/* {rating && <Text className="flex-row gap-1 mr-auto">
          <Icon name='star' size={14} className='text-yellow-400' color={"#FFE015"} />
          {(rating).toFixed(1)}</Text>} */}

        {toggleLoadingIds ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 8 }} />
        ) : (
          <Switch
            value={storeStatus}
            onValueChange={val => {
              toggleStoreStatus(shopId, val);
            }}
          />)}
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          // thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          // ios_backgroundColor="#3e3e3e"
          // onValueChange={toggleSwitch}
          // value={isEnabled}
        />
      </View>
    </View>
  );
};

export default ProfileCard;
