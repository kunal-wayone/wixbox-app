import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
// import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../constants/ImagePath';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.7; // 1 full + 1/2 card peek

const ProductSlider = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Pizza Margherita',
      image: ImagePath.item1,
      price: 400,
      description: 'Classic pizza with tomatoes, mozzarella, and basil.',
    },
    {
      id: 2,
      name: 'Pizza Margherita',
      image: ImagePath.item2,
      price: 593,
      description: 'Classic pizza with tomatoes, mozzarella, and basil.',
    },
  ]);

  //   useEffect(() => {
  //     const fetchProducts = async () => {
  //       try {
  //         const res = await axios.get('https://your-api.com/products');
  //         setProducts(res.data);
  //       } catch (err) {
  //         console.error('Error loading products', err);
  //       }
  //     };

  //     fetchProducts();
  //   }, []);

  return (
    <View>
      {/* Section Header */}
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Few Steps Away
        </Text>
        <Text className="text-sm text-gray-500">
          Discover nearby picks tailored for you
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast">
        {products.map(item => (
          <View
            key={item.id}
            className="bg-gray-100 rounded-xl shadow-md p-3"
            style={{width: CARD_WIDTH, marginRight: 16}}>
            {/* Image */}
            <Image
              source={item.image}
              className="w-full h-48 rounded-xl mb-4"
              resizeMode="cover"
            />

            {/* Name + Price */}
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-base font-medium text-gray-800"
                numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-base font-semibold text-green-600">
                ₹{item.price}/-
              </Text>
            </View>

            {/* Short Description */}
            <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
              {item.description}
            </Text>

            {/* Info Tabs */}
            <View className="flex-row items-center justify-between bg-white p-3 rounded-lg my-4">
              {/* 1.2 km */}
              <View className="flex-row items-center space-x-1">
                <Icon name="location" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500">1.2 km</Text>
              </View>

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
        ))}
      </ScrollView>
    </View>
  );
};

export default ProductSlider;
