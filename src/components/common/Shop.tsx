import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icons from 'react-native-vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { RootState } from '../../store/store';
import { addWishlistShop, removeWishlistShop } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { IMAGE_URL } from '../../utils/apiUtils';
import { ImagePath } from '../../constants/ImagePath';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CallButton from './CallButton';
import DirectionButton from './DirectionButton';

interface FeaturedItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface ShopProps {
  id: number;
  name?: string;
  description?: string;
  images?: string[];
  address?: string;
  phone?: string;
  rating?: number;
  categories?: string[];
  isOpen?: boolean;
  featuredItems?: FeaturedItem[];
  maxImages?: number;
  item: any;
}



const availableTags = [
  { id: 'spicy', label: 'Spicy 🌶️' },
  { id: 'bestseller', label: 'Bestseller ⭐' },
  { id: 'hot', label: 'Hot 🔥' },
  { id: 'fresh', label: 'Fresh 🥗' },
  { id: 'gluten_free', label: 'Gluten-Free 🌾' },
  { id: 'vegan', label: 'Vegan 🌱' },
];



const Shop = ({
  id,
  name = 'Unknown Shop',
  description = 'No description available',
  images = [],
  address = 'No address provided',
  phone = 'No phone provided',
  rating = 0,
  categories = [],
  isOpen = true,
  featuredItems = [],
  maxImages = 5,
  item,
}: ShopProps) => {
  const isFocused = useIsFocused()
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const [shopStatus, setShopStatus] = useState({
    isOpen: false,
    openingTime: null,
    closingTime: null,
  });
  const wishlistShopIds = useSelector((state: RootState) => state.wishlist.shop_ids);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const shiftDetails = item?.shift_details
    ? JSON.parse(item.shift_details)
    : [];
  const isWishlisted = wishlistShopIds.includes(id);

  const formatToAMPM = (time24: string) => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const isShopOpen: any = () => {
    const currentDay = new Date()
      .toLocaleString('en-US', { weekday: 'short' })
      .toLowerCase();
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const shiftData = item?.shift_details ? JSON.parse(item.shift_details) : null;
    const todayShift = shiftData?.find(
      (shift: any) => shift.day.toLowerCase() === currentDay && shift.status
    );
    // console.log(shiftData, item)

    if (!todayShift || !todayShift.first_shift_start) return false;

    return (
      currentTime >= todayShift.first_shift_start &&
      currentTime <= todayShift.first_shift_end
    );
  };



  const getShopStatus = () => {
    const currentDay = new Date()
      .toLocaleString('en-US', { weekday: 'short' })
      .toLowerCase();

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    const todayShift = shiftDetails.find(
      (shift: any) => shift.day.toLowerCase() === currentDay && shift.status
    );

    if (!todayShift || !todayShift.first_shift_start) {
      return {
        isOpen: false,
        openingTime: null,
        closingTime: null,
      };
    }

    const isOpen =
      currentTime >= todayShift.first_shift_start &&
      currentTime <= todayShift.first_shift_end;

    return {
      isOpen,
      openingTime: formatToAMPM(todayShift.first_shift_start),
      closingTime: formatToAMPM(todayShift.first_shift_end),
    };
  };



  useEffect(() => {
    if (isFocused) {
      const status: any = getShopStatus();
      setShopStatus(status);
    }
  }, [isFocused]);


  // console.log(isShopOpen)
  const handleToggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await dispatch(removeWishlistShop({ shop_id: id })).unwrap();
        ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
      } else {
        await dispatch(addWishlistShop({ shop_id: id })).unwrap();
        ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Error updating wishlist', ToastAndroid.SHORT);
    }
  };

  const handleAddFeaturedItemToCart = (itemData: FeaturedItem) => {
    try {
      dispatch(
        addToCart({
          id: itemData.id,
          name: itemData.name,
          price: itemData.price,
          quantity: 1,
          image: itemData.image ? IMAGE_URL + itemData.image : ImagePath.item1,
          shop_id: item?.id || id,
        })
      );
      ToastAndroid.show(`${itemData.name} added to cart`, ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show('Error adding to cart', ToastAndroid.SHORT);
    }
  };

  const handleViewShopDetails = () => {
    try {
      if (item && typeof item === 'object') {
        navigation.navigate('ShopDetailsScreen', { shop_info: item });
      } else {
        ToastAndroid.show('Shop data unavailable', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Navigation failed', ToastAndroid.SHORT);
    }
  };

  const renderImageCarousel = () => {
    if (!images.length) {
      return (
        <View className="w-full h-48 bg-gray-200 rounded-xl justify-center items-center">
          <Text className="text-gray-500">No images available</Text>
          <View className="absolute bottom-2 flex-row justify-center space-x-2 w-full">
            {images.slice(0, maxImages).map((_, index) => (
              <TouchableOpacity
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${index === selectedImageIndex ? 'bg-green-500' : 'bg-gray-300'}`}
                onPress={() => setSelectedImageIndex(index)}
              />
            ))}
          </View>
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '85%', // bottom half gradient
            }}
          />

          <TouchableOpacity className='absolute top-2 right-2' onPress={handleToggleWishlist}>
            <Icons name={isWishlisted ? 'heart' : 'heart-outline'} size={24} color={isWishlisted ? 'red' : 'white'} />
          </TouchableOpacity>
          <View className="absolute bottom-0 left-4 right-4 mb-4">
            <Text className="text-white text-lg font-bold" numberOfLines={1}>
              {name || 'Unknown Restaurant'}
            </Text>
            <View className="flex-row items-center mb-1 ">
              <MaterialIcons name="location-on" size={16} color="white" />
              <Text className="text-white text-xs ml-1">
                {`${address}, ${address}`}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-1">
              {availableTags?.slice(0, 3).map(tag => (
                <View
                  key={tag.id}
                  className={`rounded-full px-3 py-1 bg-primary-80 `}
                >
                  <Text className={`text-xs font-medium text-white`}>{tag.label}</Text>
                </View>
              ))}

            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="relative">
        <Image
          source={{ uri: IMAGE_URL + images[selectedImageIndex] }}
          className="w-full h-48 rounded-xl"
          resizeMode="cover"
          onError={() => ToastAndroid.show('Image failed to load', ToastAndroid.SHORT)}
        />
        <View className="absolute bottom-2 flex-row justify-center space-x-2 w-full">
          {images.slice(0, maxImages).map((_, index) => (
            <TouchableOpacity
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${index === selectedImageIndex ? 'bg-green-500' : 'bg-gray-300'}`}
              onPress={() => setSelectedImageIndex(index)}
            />
          ))}
        </View>
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '85%', // bottom half gradient
          }}
        />

        <TouchableOpacity className='absolute top-2 right-2' onPress={handleToggleWishlist}>
          <Icons name={isWishlisted ? 'heart' : 'heart-outline'} size={24} color={isWishlisted ? 'red' : 'white'} />
        </TouchableOpacity>
        <View className="absolute bottom-0 left-4 right-4 mb-4">
          <Text className="text-white text-lg font-bold" numberOfLines={1}>
            {name || 'Unknown Restaurant'}
          </Text>
          <View className="flex-row items-center mb-1 ">
            <MaterialIcons name="location-on" size={16} color="white" />
            <Text className="text-white text-xs ml-1">
              {`${address}, ${address}`}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-1">
            {availableTags?.slice(0, 3).map(tag => (
              <View
                key={tag.id}
                className={`rounded-full px-3 py-1 bg-primary-80 `}
              >
                <Text className={`text-xs font-medium text-white`}>{tag.label}</Text>
              </View>
            ))}

          </View>
        </View>

      </View>
    );
  };

  const renderCategories = () => (
    categories.map((category, index) => (
      <View key={index} className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-1">
        <Text className="text-blue-800 text-sm font-semibold">{category}</Text>
      </View>
    ))
  );


  return (
    <Pressable onPress={handleViewShopDetails} className={`bg-white rounded-2xl shadow-lg m-2 overflow-hidden border border-gray-300`}>
      {!shopStatus.isOpen && (
        <TouchableOpacity
          onPress={() => {
            ToastAndroid.show("Shop temporarily closed now", ToastAndroid.SHORT);
            handleViewShopDetails();
          }}
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 z-50"
          activeOpacity={1}
        />
      )}
      {renderImageCarousel()}

      <View className="flex-1 flex-row items-center absolute top-2 left-2 mr-2 bg-white rounded-full px-2">
        <View
          className={`w-4 h-4 rounded-full ${shopStatus.isOpen ? "bg-green-500" : "bg-red-400"
            }`}
        />
        <Text className="text-base text-gray-900 ml-2">
          {shopStatus.openingTime && shopStatus.closingTime ? (
            shopStatus.isOpen ? (
              `Open till ${shopStatus.closingTime}`
            ) : (
              `Closed now • Opens at ${shopStatus.openingTime}`
            )
          ) : (
            "Closed today"
          )}
        </Text>
      </View>


      <View className="bg-white dark:bg-gray-100 flex-row items-center gap-4 justify-between border border-gray-100 rounded-xl p-2" >
        <View className='flex-row items-center gap-1  '>
          <Ionicons name='location-outline' size={22} color={"#ac94f4"} />
          <View className='' >
            <Text className='text-xs' numberOfLines={1} ellipsizeMode='tail' >{item?.distance_km} Km away   {`${Math.floor((item?.travel_time_mins || 0) / 60)}h ${(item?.travel_time_mins || 0) % 60}m`}</Text>
            <Text className='text-xs w-32' numberOfLines={1} ellipsizeMode='tail' >{item?.address + ", " + item?.city}</Text>
          </View>
        </View>
        <View className='flex-row items-center justify-between gap-2 '>
          <DirectionButton latitude={item?.latitude} longitude={item?.longitude} />
          <CallButton phone={item?.phone} />
        </View>
      </View>


      <View className="mt-3 pb-2 hidden">

        <View className="flex-row justify-between items-center mt-2 hidden ">
          <Text className="text-sm text-yellow-500">
            {'★'.repeat(Math.floor(rating))} ({rating.toFixed(1)})
          </Text>
          <Text className={`text-sm font-semibold p-1 rounded-lg px-2 ${isShopOpen() && item?.status !== 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isShopOpen() && item?.status !== 0 ? 'Open' : 'Closed'}
          </Text>
        </View>


        {!!categories.length && (
          <View className="flex-row mt-3 flex-wrap">{renderCategories()}</View>
        )}


        <TouchableOpacity
          className="bg-primary-90 rounded-full px-4 py-3 mt-4"
          onPress={handleViewShopDetails}
        >
          <Text className="text-white text-center font-semibold">View Shop Details</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

export default Shop;
