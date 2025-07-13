import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';

import { ImagePath } from '../../constants/ImagePath'; // Assuming this still exists
import { fetchWishlist, clearWishlistError, removeWishlistShop, removeWishlistItem } from '../../store/slices/wishlistSlice';
import { IMAGE_URL } from '../../utils/apiUtils';

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
  const dispatch = useDispatch<any>();
  const { shop_ids, menu_items, status, error } = useSelector((state: any) => state.wishlist as WishlistState);

  // Fetch wishlist on component mount
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Clear error on tab change or after a timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearWishlistError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Render shop card (for pinned places)
  const renderShopCard = (shop: Shop, showActions = false) => (
    <View
      key={shop.id}
      className="rounded-xl bg-primary-10 w-11/12 mx-auto p-5 mb-4 shadow"
    >
      <View className="flex-row items-center gap-4 mb-4">
        <Image
          source={shop?.restaurant_images?.length > 0 ? { uri: IMAGE_URL + shop.restaurant_images[0] } : ImagePath.restaurant1} // Fallback to ImagePath
          className="w-20 h-20"
          resizeMode="stretch"
        />
        <View className="flex-1">
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{shop.restaurant_name}</Text>
          <Text className="mb-1">{shop.address}</Text>
          <View className="flex-row items-center gap-4">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name="star" size={16} color="gold" />
              <Text style={{ marginLeft: 5 }}>{shop.average_rating || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-sharp" size={16} color="gray" />
              <Text style={{ marginLeft: 5 }}>{`${shop.city}, ${shop.state}`}</Text>
            </View>
          </View>
        </View>
      </View>

      {showActions && (
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="border border-primary-100 p-3 rounded-xl flex-1 mr-2"
            onPress={() => dispatch(removeWishlistShop({ shop_id: shop.id }))}
          >
            <Text className="text-center font-bold">Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-primary-80 p-3 rounded-xl flex-1 ml-2">
            <Text className="text-center text-white font-bold">Visit Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render menu item card (for saved products)
  const renderMenuItemCard = (item: MenuItem, showActions = false) => (
    <View
      key={item.id}
      className="rounded-xl bg-primary-10 w-11/12 mx-auto p-5 mb-4 shadow"
    >
      <View className="flex-row items-center gap-4 mb-4">
        <Image
          source={item?.images?.length > 0 ? { uri: IMAGE_URL + item.images?.[0] } : ImagePath.restaurant1} // Fallback to ImagePath
          className="w-20 h-20"
          resizeMode="stretch"
        />
        <View className="flex-1">
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.item_name}</Text>
          <Text className="mb-1">{item.description}</Text>
          <View className="flex-row items-center gap-4">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name="star" size={16} color="gold" />
              <Text style={{ marginLeft: 5 }}>{item.average_rating || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginLeft: 5 }}>${item.price}</Text>
            </View>
          </View>
        </View>
      </View>

      {showActions && (
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="border border-primary-100 p-3 rounded-xl flex-1 mr-2"
            onPress={() => dispatch(removeWishlistItem({ menu_item_id: item.id }))}
          >
            <Text className="text-center font-bold">Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-primary-80 p-3 rounded-xl flex-1 ml-2">
            <Text className="text-center text-white font-bold">View Details</Text>
          </TouchableOpacity>
        </View>
      )}
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

      {/* Loading Indicator */}
      {status === 'loading' && (
        <View className="flex-1 justify-center items-center">
          <Text>Loading...</Text>
        </View>
      )}

      {/* Tabs */}
      <View className="flex-row justify-center gap-4 mb-6 px-4">
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
      <Text className="text-lg font-bold px-6 mb-4">
        {selectedTab === 'pinned' ? 'Pinned spots to visit' : 'Saved products'}
      </Text>

      {/* Card List */}
      {selectedTab === 'pinned' ? (
        shop_ids.length > 0 ? (
          shop_ids.map((shopId) => {
            const shop = menu_items.find((item) => item.shop.id === shopId)?.shop; // Find shop data
            return shop ? renderShopCard(shop, true) : null;
          })
        ) : (
          <Text className="text-center text-gray-500">No pinned places yet.</Text>
        )
      ) : (
        menu_items.length > 0 ? (
          menu_items.map((item) => renderMenuItemCard(item, true))
        ) : (
          <Text className="text-center text-gray-500">No saved products yet.</Text>
        )
      )}

      {/* Suggested Section (only for pinned tab) */}
      {selectedTab === 'pinned' && (
        <>
          <Text className="text-lg font-bold px-6 mb-4 mt-6">Suggested for you</Text>
          {suggestedShops.map((shop) => renderShopCard(shop, false))}
        </>
      )}
    </ScrollView>
  );
};

export default MySavedScreen;