import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  Switch,
  TouchableOpacity,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ImagePath} from '../../constants/ImagePath';

const menuItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 249,
    currency: '₹',
    quantity: '1 Plate',
    rating: 4.5,
    stock: 20,
    image: ImagePath.item1,
    offer: '10% OFF',
    status: true,
  },
  {
    id: '2',
    name: 'Veg Burger',
    category: 'Burger',
    price: 99,
    currency: '₹',
    quantity: '1 Piece',
    rating: 4.2,
    stock: 15,
    image: ImagePath.item2,
    offer: 'Buy 1 Get 1',
    status: false,
  },
];

const Menu = () => {
  const [search, setSearch] = useState('');

  const renderCard = ({item}: {item: (typeof menuItems)[0]}) => {
    return (
      <View className="flex-row bg-gray-100 rounded-xl p-4 mb-4 shadow-sm">
        {/* Left: Image + Switch */}
        <View className="w-2/5 mr-3 items-center">
          <Image
            source={item.image}
            className="w-full h-44 rounded-2xl mb-2"
            resizeMode="cover"
          />
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 mr-2">Status</Text>
            <Switch value={item.status} />
          </View>
        </View>

        {/* Right: Content */}
        <View className="flex-1">
          {/* Offer */}
          <View className="self-start bg-primary-100 px-2 py-1 rounded-md mb-1">
            <Text className="text-white text-xs font-semibold">
              {item.offer}
            </Text>
          </View>

          {/* Name */}
          <Text className="text-lg font-semibold text-gray-800">
            {item.name}
          </Text>
          <View className="flex-row items-center  justify-between">
            {/* Category & Price */}
            <Text className="text-sm text-gray-500">{item.category} •</Text>
            <Text className="text-md font-poppins font-bold">
              {item.currency}
              {item.price}
            </Text>
          </View>

          {/* Quantity */}
          <Text className="text-sm text-gray-600 mt-1">{item.quantity}</Text>

          {/* Rating */}
          <View className="flex-row items-center mt-1 bg-primary-20 rounded-md px-2 py-1 w-16">
            <AntDesign name="star" color="#FBBF24" size={16} />
            <Text className="ml-1 text-sm text-gray-700">{item.rating}</Text>
          </View>

          {/* Stock */}
          <View className='flex-row items-center justify-between'>
            <Text className="text-sm text-gray-600 mt-1">Stock Count:</Text>
            <Text className="font-semibold">{item.stock}</Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity className="mt-2 bg-primary-80 w-full px-3 py-2 rounded-lg self-start">
            <Text className="text-white  text-center text-md font-medium">
              Edit Item Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className=" min-h-screen">
      {/* Search */}
      <View className="flex-row items-center bg-white px-3 py-1 border  mt-4 rounded-xl mb-4 shadow-sm">
        <AntDesign name="search1" color="#6B7280" size={20} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search Item..."
          className="ml-2 flex-1 text-sm text-gray-700"
        />
      </View>

      {/* List of Cards */}
      <FlatList
        data={menuItems}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Menu;
