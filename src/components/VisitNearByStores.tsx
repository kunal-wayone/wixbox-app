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

const VisitNearByStores = () => {
  const [stores, setStores] = useState([
    {
      id: 1,
      name: 'Tasty Bites',
      image: ImagePath.restaurant1,
      desc: '20% OFF on all items',
      location: 'Main Street',
      distance: '1.5',
    },
    {
      id: 2,
      name: 'Tasty Bites',
      image: ImagePath.restaurant2,
      desc: '20% OFF on all items',
      location: 'Main Street',
      distance: '1.5',
    },

    {
      id: 3,
      name: 'Tasty Bites',
      image: ImagePath.grandopening,
      desc: '20% OFF on all items',
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
          Visit Near By Store
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
                <View className='flex-row justify-between items-center'>
                  <View>
                    {/* Store Name */}
                    <Text
                      className="text-base font-semibold py-1 text-gray-900"
                      numberOfLines={1}>
                      {store.name}
                    </Text>
                    <Text
                      className="text-xs font-poppins mb-2  text-gray-900"
                      numberOfLines={1}>
                      {store?.desc}
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-gray-200 rounded-md p-1  space-x-1">
                    <Icon name="location" size={14} color="#000" />
                    <Text className="text-xs text-gray-900">HRS Layout</Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-px bg-gray-300 my-1" />

                <View className="flex-row items-center justify-between bg-white rounded-lg p-2">
                  {/* 1.2 km */}

                  {/* Divider */}
                  <View className="h-4 w-px bg-gray-300" />

                  {/* 10 min */}
                  <View className="flex-row items-center space-x-1">
                    <Icon name="time" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500">10 min</Text>
                  </View>

                  {/* Divider */}
                  <View className="h-4 w-px bg-gray-300" />

                  {/* 4.5 stars */}
                  <View className="flex-row items-center space-x-1">
                    <Icon name="star" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500">4.5</Text>
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

export default VisitNearByStores;
