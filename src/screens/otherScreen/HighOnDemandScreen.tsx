import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ImagePath} from '../../constants/ImagePath';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const HighOnDemandScreen = () => {
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
    <View className="flex-1 bg-white">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-5 left-5 z-10">
        <Ionicons name="arrow-back" color={'#fff'} size={24} />
      </TouchableOpacity>

      {/* Header Background */}
      <Image
        source={ImagePath?.fire2}
        className="w-44 h-44 absolute top-[-20%] left-[-10%] z-[1] rounded-xl"
        resizeMode="contain"
        tintColor={'#FFFFFF33'}
      />

      {/* Header */}
      <View className="bg-primary-80 px-4 py-14 justify-end h-56 rounded-b-[2.5rem] ">
        <Text className="text-white mb-1 font-poppins font-bold text-2xl">
          High On Demand
        </Text>
        <Text className="text-white">
          Lorem ipsum dolor sit amet, consectetur
        </Text>
        <Image
          source={ImagePath.fire2}
          className="w-24 h-24 absolute right-5 bottom-5 rounded-xl"
          resizeMode="contain"
          tintColor={'white'}
        />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{padding: 16}}
        showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && (
          <Text className="text-red-600 mb-4 text-center">{error}</Text>
        )}

        {data.map((d, i) => (
          <View
            key={i}
            className="flex-row gap-4 bg-primary-10 rounded-xl p-6 mb-4">
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
            <View style={{flex: 1}}>
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
      </ScrollView>
    </View>
  );
};

export default HighOnDemandScreen;
