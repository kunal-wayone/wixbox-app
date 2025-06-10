import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ImagePath} from '../../constants/ImagePath';
import { useNavigation } from '@react-navigation/native';

// Dummy data
const initialData = [
  {
    id: '1',
    name: 'Cheese Sandwich',
    category: 'Cafe',
    title: 'The Coffee House',
    address: '123 MG Road, Bangalore',
    distance: '2.5 km',
    rating: '4.5',
    time: '15 mins',
    image: ImagePath.item1,
    closed: false,
  },
  {
    id: '2',
    name: 'Veggie Burger',
    category: 'Restaurant',
    title: 'Burger Bonanza',
    address: '456 Koramangala, Bangalore',
    distance: '3.8 km',
    rating: '4.2',
    time: '20 mins',
    image: ImagePath.item2,
    closed: false,
  },
];

const SearchScreen = () => {
    const navigation = useNavigation<any>()
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleClose = (id: any) => {
    setData(prevData =>
      prevData.map(item =>
        item.id === id ? {...item, closed: !item.closed} : item,
      ),
    );
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === '') {
      setData(initialData); // Reset when input is cleared
      return;
    }

    const filteredData = initialData.filter(
      item =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.category.toLowerCase().includes(text.toLowerCase()) ||
        item.title.toLowerCase().includes(text.toLowerCase()),
    );

    setData(filteredData);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Back Button */}
      <TouchableOpacity className="ml-4 mt-4" onPress={() => {}}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Search Input */}
      <View className="flex-row items-center mx-4 mt-4 bg-gray-100 rounded-xl mb-4 px-3 py-2">
        <Ionicons name="search" size={20} color="gray" className="mr-2" />
        <TextInput
          className="flex-1 text-base font-poppins text-gray-700"
          placeholder="Search for food or restaurants"
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Items List */}
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity onPress={()=>navigation.navigate("ShopDetailsScreen")}>
            <View className="flex-row gap-4 bg-primary-10 rounded-xl p-6 mx-4 mb-4">
              {/* Close Button */}
              <TouchableOpacity
                className="absolute top-2 right-5"
                onPress={() => toggleClose(item.id)}>
                <MaterialIcons
                  name="close"
                  size={19}
                  color={item.closed ? 'red' : 'black'}
                />
              </TouchableOpacity>

              {/* Image */}
              <Image
                source={item.image}
                className="w-28 h-36 rounded-xl"
                resizeMode="stretch"
              />

              {/* Info */}
              <View className="flex-1">
                <Text className="text-xl font-poppins font-bold">
                  {item.name}
                </Text>
                <Text className="font-poppins text-gray-500">
                  {item.category}
                </Text>
                <Text className="text-base font-poppins font-semibold text-gray-700 mt-1">
                  {item.title}
                </Text>

                {/* Address */}
                <View className="flex-row items-center mt-2 bg-primary-80 rounded-md px-3 overflow-hidden py-1">
                  <MaterialIcons
                    name="location-on"
                    size={13}
                    color="white"
                    className="mr-1"
                  />
                  <Text className="font-poppins text-white text-xs">
                    {item.address}
                  </Text>
                </View>

                {/* Distance, Rating, Time */}
                <View className="flex-row items-center justify-between mt-3">
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="directions-walk"
                      size={16}
                      color="gray"
                      className="mr-1"
                    />
                    <Text className="font-poppins text-gray-600 text-sm">
                      {item.distance}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="star"
                      size={16}
                      color="#FFC727"
                      className="mr-1"
                    />
                    <Text className="font-poppins text-gray-600 text-sm">
                      {item.rating}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="access-time"
                      size={16}
                      color="gray"
                      className="mr-1"
                    />
                    <Text className="font-poppins text-gray-600 text-sm">
                      {item.time}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{paddingBottom: 20}}
      />
    </View>
  );
};

export default SearchScreen;
