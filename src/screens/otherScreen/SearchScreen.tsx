import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ToastAndroid,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ImagePath } from '../../constants/ImagePath';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import Icon from 'react-native-vector-icons/Ionicons';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SearchScreen = () => {
  const navigation = useNavigation<any>()
  const isFocused = useIsFocused();
  const [data, setData] = useState<any>([]);
  const route = useRoute<any>()
  const query = route.params?.query || '';
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [isLoading, setIsLoading] = useState(false)
  const [active, setActive] = useState<any>("product")
  const [restaurants, setRestaurants] = useState([])
  const [dishes, setDishes] = useState([])

  const fetchSearchResults = async (query: string, type: string) => {
    setIsLoading(true)
    setActive(type)
    const response: any = await Fetch(`/user/all-filter?name=${query}&type=${type}&per_page=${1}&limit=${10}`, {}, 5000);
    // const response2: any = await Fetch(`/user/all-filter?name=${query}&type=dishes&per_page=${1}&limit=${10}`, {}, 5000);

    if (!response?.success) {
      ToastAndroid.show("Failed to fetch search results", ToastAndroid.SHORT);
      return;
    }
    console.log(response, query, type)
    type === "shop" ?
      setRestaurants(response?.data?.shops?.shop)
      : setDishes(response?.data?.products?.products)

    setIsLoading(false)
  }



  useEffect(() => {
    if (isFocused) {
      if (query.trim()) {
        fetchSearchResults(query, "product");
        navigation.setParams({ query: '' });
      }
    }
  }, [isFocused]);



  const handleSearch = async (tab: string) => {
    await fetchSearchResults(searchQuery, tab)
  };



  return (
    <View className="flex-1 bg-white">
      {/* Back Button */}
      <TouchableOpacity className="ml-4 mt-4" onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Search Input */}
      <View className="flex-row items-center mx-4 mt-4 border border-gray-300 bg-gray-100 rounded-xl px-3 py-1">
        <Ionicons name="search" size={20} color="gray" className="mr-2" />
        <TextInput
          className="flex-1 text-base font-poppins text-gray-700"
          placeholder="Search for food or restaurants"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => handleSearch("product")}
        />
      </View>

      <View className='p-4'>
        <View className='flex-row items-center gap-4 mb-4 '>
          <TouchableOpacity onPress={() => handleSearch("product")} className={`pb-1 px-1 ${active === "product" ? "border-b-2 border-primary-100" : ""}`}>
            <Text className='text-md font-semibold'>Dishes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSearch("shop")} className={`pb-1 px-1 ${active === "shop" ? "border-b-2 border-primary-100" : ""}`}>
            <Text className='text-md font-semibold'>Restaurants</Text>
          </TouchableOpacity>

        </View>



        {active === "shop" ? (isLoading ? (
          <ActivityIndicator size={'large'} />
        ) : restaurants?.length === 0 ?
          <Text className='text-center py-10'>
            No restaurants found
          </Text>
          : (<FlatList
            data={restaurants}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity className='w-full mx-auto ' onPress={() => navigation.navigate("ShopDetailsScreen")}>
                <View
                  key={item.id}
                  // style={{ width: width * 0.9 }}
                  className=" rounded-xl overflow-hidden">
                  {/* Background Image */}
                  <ImageBackground
                    source={item?.restaurant_images ? { uri: IMAGE_URL + item?.restaurant_images[0] } : ImagePath.restaurant1}
                    className="h-72 w-full justify-end"
                    imageStyle={{ borderRadius: 16 }}>
                    {/* Detail Card Overlay */}
                    <View className="bg-white p-3 w-11/12 mx-auto rounded-xl bottom-4">
                      <View className='flex-row justify-between items-center'>
                        <View>
                          {/* item Name */}
                          <Text
                            className="text-base font-semibold py-1 text-gray-900"
                            numberOfLines={1}>
                            {item?.restaurant_name?.length > 18
                              ? item.restaurant_name.slice(0, 18) + '...'
                              : item?.restaurant_name}
                          </Text>

                          <Text
                            className="text-xs font-poppins mb-2 w-40 text-gray-900"
                            numberOfLines={1}>
                            {item?.about_business?.length > 40
                              ? item.about_business.slice(0, 40) + '...'
                              : item?.about_business}                          </Text>
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
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          ))
          : (isLoading ? (
            <ActivityIndicator size={'large'} />
          ) : dishes?.length === 0 ?
            <Text className='py-10 text-center'>
              No dishes found
            </Text>
            : (<FlatList
              data={dishes}
              keyExtractor={(item: any) => item?.id}
              renderItem={({ item }: any) => (
                <TouchableOpacity onPress={() => navigation.navigate('ProductDetailsScreen', { productId: item?.id })}
                >
                  <View className="flex-row gap-4 bg-primary-10 rounded-xl p-4 mb-4">
                    {/* Image */}
                    <Image
                      source={{ uri: IMAGE_URL + item?.images[0] }}
                      className="w-28  rounded-xl"
                      resizeMode="stretch"
                    />

                    {/* Info */}
                    <View className="flex-1">
                      <Text className="text-xl font-poppins font-bold">
                        {item?.item_name}
                      </Text>
                      <Text className="font-poppins text-gray-500">
                        {item?.category?.name}
                      </Text>
                      <View className='flex-row items-center justify-between pr-10'>

                        <Text className="text-base font-poppins font-semibold text-gray-700 mt-1">
                          {item?.price}/-
                        </Text>

                        <View className="flex-row items-center">
                          <MaterialIcons
                            name="star"
                            size={16}
                            color="#FFC727"
                            className="mr-1"
                          />
                          <Text className="font-poppins text-gray-600 text-sm">
                            {item?.average_rating || 0}
                          </Text>
                        </View>
                      </View>

                      {/* <View className="flex-row items-center mt-2 bg-primary-80 rounded-md px-3 overflow-hidden py-1">
                        <MaterialIcons
                          name="location-on"
                          size={13}
                          color="white"
                          className="mr-1"
                        />
                        <Text className="font-poppins text-white text-xs">
                          {item?.address}
                        </Text>
                      </View> */}


                      <View className="flex-row items-center justify-between mt-3">
                        {/* <View className="flex-row items-center">
                          <MaterialIcons
                            name="directions-walk"
                            size={16}
                            color="gray"
                            className="mr-1"
                          />
                          <Text className="font-poppins text-gray-600 text-sm">
                            {item?.distance}
                          </Text>
                        </View> */}
                        {/* <View className="flex-row items-center">
                          <MaterialIcons
                            name="star"
                            size={16}
                            color="#FFC727"
                            className="mr-1"
                          />
                          <Text className="font-poppins text-gray-600 text-sm">
                            {item?.average_rating || 0}
                          </Text>
                        </View> */}
                        {/* <View className="flex-row items-center">
                          <MaterialIcons
                            name="access-time"
                            size={16}
                            color="gray"
                            className="mr-1"
                          />
                          <Text className="font-poppins text-gray-600 text-sm">
                            {item?.time}
                          </Text>
                        </View> */}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />))}
      </View>
    </View >
  );
};

export default SearchScreen;
