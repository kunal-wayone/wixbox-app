import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../constants/ImagePath';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const FreshStoreSection = () => {
  const [stores, setStores] = useState([
    {
      id: 1,
      name: 'Tasty Bites',
      image: ImagePath.restaurant1,
      offer: '20% OFF on all items',
      location: 'Main Street',
      distance: '1.5',
    },
    {
      id: 2,
      name: 'Tasty Bites',
      image: ImagePath.restaurant2,
      offer: '20% OFF on all items',
      location: 'Main Street',
      distance: '1.5',
    },

    {
      id: 3,
      name: 'Tasty Bites',
      image: ImagePath.grandopening,
      offer: '20% OFF on all items',
      location: 'Main Street',
      distance: '1.5',
    },
  ]);

  //   useEffect(() => {
  //     const fetchStores = async () => {
  //       try {
  //         const res = await axios.get('https://your-api.com/fresh-stores');
  //         setStores(res.data);
  //       } catch (err) {
  //         console.error('Error fetching stores:', err);
  //       }
  //     };

  //     fetchStores();
  //   }, []);

  return (
    <View className="pt-6">
      {/* Section Header */}
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Fresh Added Store
        </Text>
        <Text className="text-sm text-gray-500">
          Check out the newest additions near you
        </Text>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        className="space-x-4">
        {stores.map(store => (
          <View
            key={store.id}
            style={{width: CARD_WIDTH}}
            className="mr-4 rounded-xl overflow-hidden">
            {/* Background Image */}
            <ImageBackground
              source={store.image}
              className="h-72 w-full justify-end"
              imageStyle={{borderRadius: 16}}>
              {/* Detail Card Overlay */}
              <View className="bg-white p-3 w-11/12 mx-auto rounded-xl bottom-4">
                {/* Store Name */}
                <Text
                  className="text-base font-semibold p-1 text-gray-900"
                  numberOfLines={1}>
                  {store.name}
                </Text>

                {/* Divider */}
                <View className="h-px bg-gray-300 my-1" />

                {/* Offer */}
                <View className="flex-row items-center gap-2 space-x-2 mb-2">
                  <Icon name="pricetag-outline" size={14} color="#10B981" />
                  <Text className="text-sm text-green-600 font-medium">
                    {store.offer}
                  </Text>
                </View>

                {/* Location and Distance */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-1">
                    <Icon name="location-outline" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500">
                      {store.location}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-1">
                    <Icon name="location-outline" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500">
                      {store.distance} Km
                    </Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default FreshStoreSection;
