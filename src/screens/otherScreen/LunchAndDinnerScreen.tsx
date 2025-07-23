import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { ImagePath } from '../../constants/ImagePath';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const LunchAndDinnerScreen = () => {
  const navigation = useNavigation<any>();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const dummyData = [
    {
      image: ImagePath.item1,
      name: 'Salted Fries',
      category: 'Chinese Food',
      distance: '1.2 Miles Away',
      price: '400',
      resturentName: 'Coffee House Restaurant',
      rating: '4.5',
      fav: false,
    },
    {
      image: ImagePath.item2 ?? ImagePath.item1,
      name: 'Veg Noodles',
      category: 'Chinese Food',
      distance: '2.0 Miles Away',
      price: '350',
      resturentName: 'Spicy Bowl',
      rating: '4.2',
      fav: true,
    },
    {
      image: ImagePath.item2 ?? ImagePath.item1,
      name: 'Veg Noodles',
      category: 'Chinese Food',
      distance: '2.0 Miles Away',
      price: '350',
      resturentName: 'Spicy Bowl',
      rating: '4.2',
      fav: true,
    },
    {
      image: ImagePath.item2 ?? ImagePath.item1,
      name: 'Veg Noodles',
      category: 'Chinese Food',
      distance: '2.0 Miles Away',
      price: '350',
      resturentName: 'Spicy Bowl',
      rating: '4.2',
      fav: true,
    },
  ];

  const fetchData = async () => {
    try {
      // Dummy API URL - replace with your own endpoint
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts',
      );
      if (!response.ok) throw new Error('Failed to fetch data');

      // Simulating transformation of fetched data
      const json = await response.json();
      const transformed = dummyData; // Replace this with actual transformation if needed

      setData(transformed);
    } catch (err: any) {
      console.error('Error fetching data:', err.message);
      setError('Could not load high demand items. Showing local data.');
      setData(dummyData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: 40,
              left: 16,
              zIndex: 10,
            }}>
            <Ionicons name="arrow-back" color={'#fff'} size={24} />
          </TouchableOpacity>

          {/* Header */}
          <ImageBackground
            source={ImagePath.lunch}
            resizeMode="stretch"
            style={{
              height: 250,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
              overflow: 'hidden',
            }}>
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'transparent']}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                paddingHorizontal: 16,
                paddingBottom: 28,
              }}>
              <Text className="text-white mb-1 font-poppins font-bold text-2xl">
                Lunch & Dinner
              </Text>
              <Text className="text-white mb-2">Sharma Restaurant</Text>
              <View className="flex-row items-center gap-1 mb-2">
                <Image
                  source={ImagePath.location}
                  style={{ width: 16, height: 16, tintColor: '#fff' }}
                  resizeMode="contain"
                />
                <Text className="mb-1 text-white">{'12 Mins From Me'}</Text>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Content Section */}
          <Text className="text-2xl font-poppins font-bold mt-4 px-4">
            Lunch & Dinner
          </Text>
          <Text className="px-4 mb-4">
            <AntDesign name="star" size={19} color={'#FFC727'} /> 4 Star Rated &
            Above
          </Text>

          <View className="flex-row items-center justify-center px-4 mb-4">
            <TouchableOpacity className="rounded-l-full flex-row items-center justify-center gap-2 w-1/2 p-2.5 px-4 bg-primary-80 border border-primary-80">
              <MaterialIcons name={'local-offer'} size={19} color={'#fff'} />
              <Text className="text-white text-center">Popular</Text>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-r-full flex-row items-center justify-center gap-2 w-1/2 p-2.5 px-4 bg-white border border-primary-80">
              <MaterialIcons name={'location-on'} size={19} color={'#000'} />
              <Text className="text-black text-center">Near By</Text>
            </TouchableOpacity>
          </View>

          {/* Loading / Error */}
          {loading && (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{ marginTop: 16 }}
            />
          )}
          {error && (
            <Text className="text-red-600 mb-4 text-center">{error}</Text>
          )}

          {/* Items List */}
          {data.map((d, i) => (
            <View
              key={i}
              className="flex-row gap-4 bg-primary-10 rounded-xl p-6 mx-4 mb-4">
              <Text className="absolute top-2 right-12 font-poppins font-bold">
                <AntDesign name="star" size={19} color={'#FFC727'} /> {d?.rating}
              </Text>
              <TouchableOpacity className="absolute top-2 right-5">
                <MaterialIcons
                  name={d.fav ? 'favorite' : 'favorite-outline'}
                  size={19}
                  color={d.fav ? 'red' : 'black'}
                />
              </TouchableOpacity>
              <Image
                source={d?.image}
                className="w-24 h-24 rounded-xl"
                resizeMode="stretch"
              />
              <View style={{ flex: 1 }}>
                <Text className="text-xl font-poppins font-bold">{d?.name}</Text>
                <View className="flex-row items-center gap-4 mb-2">
                  <Text className="font-poppins text-gray-500">
                    {d?.category}
                  </Text>
                  <Text className="font-poppins text-gray-500">
                    {d?.distance}
                  </Text>
                </View>
                <Text className="font-bold mb-1">₹{d?.price}/-</Text>
                <Text className="font-poppins font-bold">{d?.resturentName}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity className="bg-primary-80 p-4 rounded-xl m-4">
            <Text className="text-white text-center">View More</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LunchAndDinnerScreen;
