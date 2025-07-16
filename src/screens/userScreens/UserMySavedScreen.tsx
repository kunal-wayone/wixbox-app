import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';

import { ImagePath } from '../../constants/ImagePath'; // Assuming this still exists
import { fetchWishlist, clearWishlistError, removeWishlistShop, removeWishlistItem } from '../../store/slices/wishlistSlice';
import { IMAGE_URL } from '../../utils/apiUtils';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FoodItem from '../../components/common/FoodItem';
import { addToCart } from '../../store/slices/cartSlice';

// Define types for clarity (based on wishlistSlice)
interface Shop {
  id: number;
  restaurant_name: string;
  restaurant_images: string[];
  address: string;
  city: string;
  state: string;
  phone: string;
  average_rating: number;
  [key: string]: any;
}

interface MenuItem {
  id: number;
  item_name: string;
  price: string;
  description: string;
  stock_quantity: number;
  unit: string;
  subunit: string;
  status: number;
  images: string[];
  shop: Shop;
  category: {
    id: number;
    name: string;
  };
  average_rating: number;
  is_wishlisted: boolean;
}

interface WishlistState {
  shop_ids: number[];
  menu_items: MenuItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const MySavedScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'pinned' | 'saved'>('pinned');
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>()
  const dispatch = useDispatch<any>();
  const { shop_ids, menu_items, status, error } = useSelector((state: any) => state.wishlist as WishlistState);
  console.log(menu_items, shop_ids)
  // Fetch wishlist on component mount
  useEffect(() => {
    if (isFocused) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isFocused]);

  // Clear error on tab change or after a timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearWishlistError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);


  const handleViewShopDetails = (item: any) => {
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


  const handleAddToCart = (item: any) => {
    const cartItem = {
      id: item?.id?.toString(),
      name: item?.item_name,
      price: item?.price,
      quantity: 1,
      image: item?.images[0] ? IMAGE_URL + item.images[0] : undefined,
      shop_id: item?.shop?.id ?? item?.store_id
    };
    dispatch(addToCart(cartItem));
    ToastAndroid.show(`${item.item_name} added to cart`, ToastAndroid.SHORT);
  };


  // Place order
  const handlePlaceOrder = (item: any) => {
    navigation.navigate('AddCustomerFormScreen', {
      item: [
        {
          id: item.id,
          quantity: 1,
          price: Math.floor(Number(item.price)),
          name: item.item_name,
          image: item?.images?.length ? { uri: IMAGE_URL + item.images[0] } : '',
          shop_id: item?.shop?.id ?? item?.store_id
        },
      ],
    });
  };



  // Render shop card (for pinned places)
  const renderShopCard = (shop: any, showActions = false) => (
    <TouchableOpacity
      key={shop.id}
      onPress={() => handleViewShopDetails(shop)}
      className="rounded-xl bg-primary-10 w-11/12 mx-auto p-2 mb-4 shadow"
    >
      <View className="flex-row items-center gap-2">
        <Image
          source={shop?.restaurant_images?.length > 0 ? { uri: IMAGE_URL + shop.restaurant_images[0] } : ImagePath.restaurant1} // Fallback to ImagePath
          className="w-20 h-20 rounded-xl"
          resizeMode="stretch"
        />
        <View className="h-full flex-col items-start justify-start overflow-hidden">
          <Text numberOfLines={1} className='mb-1' style={{ fontSize: 16, fontWeight: 'bold' }}>{shop.restaurant_name}</Text>
          <Text numberOfLines={1} className="mb-1">{shop.address}</Text>
          <View className="flex-row items-center gap-4 ">
            <View style={{ flexDirection: 'row', alignItems: 'center' }} className='overflow-hidden'>
              <Ionicons name="fast-food-outline" size={16} color="gray" />
              <Text numberOfLines={1} style={{ marginLeft: 5 }} className='overflow-hidden'>{`Dine Service: ${shop.dine_in_service ? "Available" : "Not Avalable"}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }} className='hidden'>
              <FontAwesome name="star" size={16} color="gold" />
              <Text numberOfLines={1} style={{ marginLeft: 5 }}>{shop.average_rating || '0'}</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        className="p-0.5 absolute top-1 right-2 rounded-full flex-1 mr-2"
        onPress={() => dispatch(removeWishlistShop({ shop_id: shop.id }))}
      >
        <Icon name="heart" size={25} color={"red"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render menu item card (for saved products)
  const renderMenuItemCard = (item: MenuItem, showActions = false) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleViewShopDetails(item)}
      className="rounded-xl bg-primary-10 w-11/12 mx-auto p-2 mb-4 shadow"
    >
      <View className="flex-row items-center gap-2">
        <Image
          source={item?.images?.length > 0 ? { uri: IMAGE_URL + item?.images[0] } : ImagePath.restaurant1} // Fallback to ImagePath
          className="w-20 h-20 rounded-xl"
          resizeMode="stretch"
        />
        <View className="h-full flex-col items-start justify-start overflow-hidden">
          <Text numberOfLines={1} className='mb-1' style={{ fontSize: 16, fontWeight: 'bold' }}>{item?.item_name}</Text>
          {/* <Text numberOfLines={1} className="mb-1">{item}</Text> */}
          <View className="flex-row items-center gap-4 ">
            <View style={{ flexDirection: 'row', alignItems: 'center' }} className='overflow-hidden'>
              <Ionicons name="fast-food-outline" size={16} color="gray" />
              {/* <Text numberOfLines={1} style={{ marginLeft: 5 }} className='overflow-hidden'>{`Dine Service: ${item?.dine_in_service ? "Available" : "Not Avalable"}`}</Text> */}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }} className='hidden'>
              <FontAwesome name="star" size={16} color="gold" />
              <Text numberOfLines={1} style={{ marginLeft: 5 }}>{item?.average_rating || '0'}</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        className="p-0.5 absolute top-1 right-2 rounded-full flex-1 mr-2"
        onPress={() => dispatch(removeWishlistItem({ menu_item_id: item.id }))}
      >
        <Icon name="heart" size={25} color={"red"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );


  const renderItem = ({ item }: { item: any, }) =>
  (
    <View>
      <FoodItem
        id={item?.id}
        name={item?.item_name}
        description={item?.description || 'No description available'}
        restaurent={item?.shop?.restaurant_name || ""}
        price={parseFloat(item?.price) || 0}
        imageUrl={
          (item?.images?.length ?? 0) > 0
            ? { uri: IMAGE_URL + item.images![0] }
            : ImagePath.item1
        }
        dietaryInfo={item?.dietary_info || []}
        rating={item?.average_rating || 0}
        isVegetarian={item?.is_vegetarian === 0 ? true : false || false}
        isAvailable={item?.is_available !== false}
        onAddToCart={() => handleAddToCart}
        handlePlaceOrder={handlePlaceOrder}
        maxQuantity={10}
        item={item}
      />
    </View>
  );


  // Mock suggested shops (replace with API call if available)
  const suggestedShops: Shop[] = [
    {
      id: 3,
      restaurant_name: 'Sushi House',
      restaurant_images: [ImagePath.restaurant1],
      address: 'Market Lane',
      city: 'Downtown',
      state: 'CA',
      phone: '123-456-7890',
      average_rating: 4.6,
    },
    // Add more suggested shops as needed
  ];

  return (
    <ScrollView className="flex-1 bg-white pt-6">
      {/* Error Message */}
      {error && (
        <View className="bg-red-100 p-4 mx-4 mb-4 rounded-xl">
          <Text className="text-red-600">{error}</Text>
        </View>
      )}



      {/* Tabs */}
      <View className="flex-row justify-center gap-4 mb-2 px-4">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl ${selectedTab === 'pinned' ? 'bg-primary-80' : 'bg-gray-200'
            }`}
          onPress={() => setSelectedTab('pinned')}
        >
          <Text
            className={`text-center font-bold ${selectedTab === 'pinned' ? 'text-white' : 'text-gray-800'
              }`}
          >
            Pinned Places
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl ${selectedTab === 'saved' ? 'bg-primary-80' : 'bg-gray-200'
            }`}
          onPress={() => setSelectedTab('saved')}
        >
          <Text
            className={`text-center font-bold ${selectedTab === 'saved' ? 'text-white' : 'text-gray-800'
              }`}
          >
            Saved Products
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <Text className="text-lg font-bold px-6">
        {selectedTab === 'pinned' ? 'Pinned spots to visit' : 'Saved products'}
      </Text>
      {/* Loading Indicator */}
      {status === 'loading' && (
        <View className="flex-1 justify-center items-center">
          <Text>Loading...</Text>
        </View>
      )}
      {/* Card List */}
      {selectedTab === 'pinned' ? (
        shop_ids.length > 0 ? (
          shop_ids?.map((shopId) => {
            // const shop = menu_items.find((item) => item?.store_id === shopId)?.shop; // Find shop data
            return shopId ? renderShopCard(shopId, true) : null;
          })
        ) : (
          <Text className="text-center text-gray-500">No pinned places yet.</Text>
        )
      ) : (
        menu_items.length > 0 ? (
          menu_items.map((item: any) => renderItem({ item }))
        ) : (
          <Text className="text-center text-gray-500">No saved products yet.</Text>
        )
      )}

      {/* Suggested Section (only for pinned tab) */}
      {/* {selectedTab === 'pinned' && (
        <>
          <Text className="text-lg font-bold px-6 mb-4 mt-6">Suggested for you</Text>
          {suggestedShops.map((shop) => renderShopCard(shop, false))}
        </>
      )} */}
    </ScrollView>
  );
};

export default MySavedScreen;