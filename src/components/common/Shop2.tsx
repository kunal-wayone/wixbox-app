import React, { useState } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    Pressable,
    ToastAndroid,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { IMAGE_URL } from '../../utils/apiUtils';
import { ImagePath } from '../../constants/ImagePath';
import { RootState } from '../../store/store';
import {
    addWishlistShop,
    removeWishlistShop,
} from '../../store/slices/wishlistSlice';

const Shop2 = ({ item }: { item: any }) => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch<any>();
    const [expanded, setExpanded] = useState(false);

    const shop = item?.data || item?.item; // fallback to handle both API and local structure
    const shopId = Number(shop?.id || shop?._id); // normalize to number

    const wishlistShopIds = useSelector((state: RootState) => state.wishlist.shop_ids);
    const isWishlisted = wishlistShopIds.includes(shopId);

    const shiftDetails = JSON.parse(shop?.shift_details || '[]');
    const openDays = shiftDetails
        .filter((shift: any) => shift?.status && shift?.state === 'active')
        .map((shift: any) => shift?.day.slice(0, 3))
        .join(', ');
    const operatingShift = shiftDetails.find((shift: any) => shift?.status && shift?.state === 'active');
    const operatingHours = operatingShift
        ? `${operatingShift.first_shift_start} - ${operatingShift.first_shift_end}`
        : 'Not Available';

    const availableTables = shop?.tables?.filter((table: any) => table?.is_booked === '0').length || 0;
    const totalTables = shop?.tables?.length || 0;
    const cuisineType = shop?.shop_category?.name || 'Sweets & Desserts';

    const handleWishlistToggle = async () => {
        try {
            if (isWishlisted) {
                await dispatch(removeWishlistShop({ shop_id: shopId })).unwrap();
                ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
            } else {
                await dispatch(addWishlistShop({ shop_id: shopId })).unwrap();
                ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
            }
        } catch (err) {
            ToastAndroid.show('Error updating wishlist', ToastAndroid.SHORT);
        }
    };

    return (
        <Animatable.View
            animation="zoomIn"
            duration={600}
            className="w-11/12 mx-auto my-3 bg-gray-100 rounded-3xl shadow-xl overflow-hidden"
        >
            <TouchableOpacity
                onPress={() => navigation.navigate('ShopDetailsScreen', { shop_info: shop })}
                activeOpacity={0.9}
            >
                <View className="relative">
                    <Animatable.Image
                        source={
                            shop?.restaurant_images?.length
                                ? { uri: IMAGE_URL + shop.restaurant_images[0] }
                                : ImagePath.restaurant1
                        }
                        className="w-full h-52 rounded-t-3xl"
                        resizeMode="cover"
                        onError={() =>
                            ToastAndroid.show('Failed to load image', ToastAndroid.SHORT)
                        }
                    />
                    <TouchableOpacity
                        className="absolute top-4 right-4 bg-white/30 p-2 rounded-full"
                        onPress={handleWishlistToggle}
                    >
                        <MaterialIcons
                            name={isWishlisted ? 'favorite' : 'favorite-outline'}
                            size={24}
                            color={isWishlisted ? '#EF4444' : '#FFFFFF'}
                        />
                    </TouchableOpacity>

                    {shop?.average_rating >= 4 && (
                        <View className="absolute top-4 left-4 bg-yellow-400 px-3 py-1 rounded-full">
                            <Text className="text-xs font-bold text-gray-900">Top Rated</Text>
                        </View>
                    )}
                </View>

                <View className="px-4 pt-4 pb-4">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
                                {shop?.restaurant_name}
                            </Text>
                            <Text className="text-sm text-gray-500">{cuisineType}</Text>
                        </View>
                        <View className="flex-row items-center bg-indigo-100 rounded-full px-3 py-1">
                            <Icon name="star" size={16} color="#F59E0B" />
                            <Text className="text-sm font-semibold text-gray-700 ml-1">
                                {shop?.average_rating || '0'}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mt-2">
                        <Icon name="location-outline" size={16} color="#6B7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                            {shop?.distance_km ? `${shop.distance_km} Km` : 'NA'} • {shop?.city}
                        </Text>
                    </View>

                    <View className="mt-3">
                        <Text className="text-sm font-semibold text-gray-700">
                            Table Availability: {availableTables}/{totalTables}
                        </Text>
                    </View>

                    <Pressable
                        className="mt-3 flex-row items-center"
                        onPress={() => setExpanded(!expanded)}
                    >
                        <Text className="text-sm font-semibold text-gray-600">
                            {expanded ? 'Hide Details' : 'More Details'}
                        </Text>
                        <Icon
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color="#4F46E5"
                            style={{ marginLeft: 4 }}
                        />
                    </Pressable>

                    {expanded && (
                        <Animatable.View animation="fadeIn" duration={300} className="mt-2">
                            <View className="flex-row items-center">
                                <Icon name="time-outline" size={16} color="#6B7280" />
                                <Text className="text-sm text-gray-600 ml-1">
                                    {operatingHours} ({openDays})
                                </Text>
                            </View>
                            <View className="flex-row mt-2 space-x-2">
                                {shop?.payment_cash && (
                                    <View className="bg-green-100 px-2 py-1 rounded-full">
                                        <Text className="text-xs text-green-700">Cash</Text>
                                    </View>
                                )}
                                {shop?.payment_card && (
                                    <View className="bg-green-100 px-2 py-1 rounded-full">
                                        <Text className="text-xs text-green-700">Card</Text>
                                    </View>
                                )}
                                {shop?.payment_upi && (
                                    <View className="bg-green-100 px-2 py-1 rounded-full">
                                        <Text className="text-xs text-green-700">UPI</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-sm text-gray-600 mt-2" numberOfLines={3}>
                                {shop?.about_business}
                            </Text>
                        </Animatable.View>
                    )}
                </View>

                <View className="px-4 pb-4">
                    <TouchableOpacity
                        className="bg-primary-90 py-3 rounded-lg flex-row justify-center items-center"
                        onPress={() =>
                            availableTables > 0
                                ? navigation.navigate('BookTableScreen', { shop_info: shop })
                                : navigation.navigate('ShopDetailsScreen', { shop_info: shop })
                        }
                    >
                        <Text className="text-white font-semibold text-base">
                            {availableTables > 0 ? 'Book a Table' : 'View Details'}
                        </Text>
                        <Icon name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );
};

export default Shop2;
