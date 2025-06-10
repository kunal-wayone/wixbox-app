import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import {ImagePath} from '../constants/ImagePath';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.5;

const PopularAreaSection = () => {
  const [areas, setAreas] = useState([
    {
      id: 1,
      name: 'Downtown Plaza',
      image: ImagePath.restaurant2,
      location: 'City Center',
      distance: '1.2',
    },
    {
      id: 2,
      name: 'Downtown Plaza',
      image: ImagePath.restaurant2,
      location: 'City Center',
      distance: '1.2',
    },
  ]);

  //   useEffect(() => {
  //     const fetchAreas = async () => {
  //       try {
  //         const res = await axios.get('https://your-api.com/popular-areas');
  //         setAreas(res.data);
  //       } catch (err) {
  //         console.error('Error fetching areas:', err);
  //       }
  //     };

  //     fetchAreas();
  //   }, []);

  return (
    <View className="pt-6">
      {/* Header */}
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Popular Area
        </Text>
        <Text className="text-sm text-gray-500">
          Explore trending locations near you
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        className="space-x-4">
        {areas.map(area => (
          <View
            key={area.id}
            style={{width: CARD_WIDTH}}
            className="mr-4 rounded-xl overflow-hidden">
            <ImageBackground
              source={area.image}
              className="h-48 w-full justify-end"
              imageStyle={{borderRadius: 16}}>
              {/* <View
                className="absolute inset-0  bg-black"
                style={{opacity: 0.3}}
              /> */}
              {/* Bottom Overlay Card */}
              <View className=" rounded-b-xl  bg-gradient-to-t from-black to-transparent ">
                {/* Area Name */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={{
                    padding: 12,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                  }}>
                  {/* Area Name */}
                  <Text
                    className="text-base font-semibold text-white"
                    numberOfLines={1}>
                    {area.name}
                  </Text>

                  {/* Location and Distance */}
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-sm text-white">{area.location}</Text>
                    <Text className="text-sm text-white">
                      {area.distance} km away
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PopularAreaSection;
