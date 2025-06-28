import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
// import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons'; // Using Ionicons
import {ImagePath} from '../constants/ImagePath';

const CategorySection = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Pizza',
      image: ImagePath.item1,
    },
    {
      id: 2,
      name: 'Burger',
      image: ImagePath.item2,
    },
    {
      id: 3,
      name: 'Patties',
      image: ImagePath.item3,
    },
      {
      id: 4,
      name: 'Pizza',
      image: ImagePath.item1,
    },
    {
      id: 5,
      name: 'Burger',
      image: ImagePath.item2,
    },
    {
      id: 6,
      name: 'Patties',
      image: ImagePath.item3,
    },
  ]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response: any = await fetch('https://your-api.com/categories');
//         setCategories(response.data);
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       }
//     };

//     fetchCategories();
//   }, []);

  return (
    <View className="pt-6 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-lg font-semibold text-gray-900">
            Categories
          </Text>
          <Text className="text-sm text-gray-500">
            Browse our product categories
          </Text>
        </View>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-sm  font-medium">See More</Text>
          <Icon name="chevron-forward-outline" size={16} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scrollable Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-1">
        {categories.map((cat: any) => (
          <View key={cat.id} className="items-center mx-2">
            <Image
              source={cat.image}
              className="w-28 h-24 rounded-xl mb-2"
              resizeMode="cover"
            />
            <Text className="text-xs text-center text-gray-700">
              {cat.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategorySection;
