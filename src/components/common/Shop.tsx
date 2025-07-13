import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ToastAndroid,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    addWishlistShop,
    removeWishlistShop,
} from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import Icons from 'react-native-vector-icons/Ionicons';
import { RootState } from '../../store/store';
import { useNavigation } from '@react-navigation/native';
import { ImagePath } from '../../constants/ImagePath';
import { IMAGE_URL } from '../../utils/apiUtils';

interface ShopProps {
    id: number;
    name: string;
    description?: string;
    images?: string[];
    address?: string;
    phone?: string;
    rating?: number;
    categories?: string[];
    isOpen?: boolean;
    featuredItems?: Array<{
        id: string;
        name: string;
        price: number;
        image?: string;
    }>;
    maxImages?: number;
    item: any;
}

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
    const dispatch = useDispatch<any>();
    const navigation = useNavigation<any>();
    const wishlistShopIds = useSelector((state: RootState) => state.wishlist.shop_ids);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const isWishlisted = wishlistShopIds.includes(id);

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

    const handleAddFeaturedItemToCart = (item: { id: string; name: string; price: number }) => {
        try {
            dispatch(
                addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                })
            );
            ToastAndroid.show(`${item.name} added to cart`, ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show('Error adding to cart', ToastAndroid.SHORT);
        }
    };

    const handleViewShopDetails = () => {
        navigation.navigate('ShopDetailsScreen', { shop_info: item });
    };

    const renderImageCarousel = () => {
        if (!images.length) {
            return (
                <View className="w-full h-48 bg-gray-200 rounded-xl justify-center items-center">
                    <Text className="text-gray-500">No images available</Text>
                </View>
            );
        }

        return (
            <View className="relative">
                <Image
                    source={{ uri: IMAGE_URL + images[selectedImageIndex] }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                    onError={() =>
                        ToastAndroid.show('Failed to load image', ToastAndroid.SHORT)
                    }
                />
                <View className="absolute bottom-2 flex-row justify-center space-x-2 w-full">
                    {images.slice(0, maxImages).map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            className={`w-2 h-2 rounded-full mx-1 ${index === selectedImageIndex ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                            onPress={() => setSelectedImageIndex(index)}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderCategories = () => {
        return categories.map((category, index) => (
            <View
                key={index}
                className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-1"
            >
                <Text className="text-blue-800 text-sm font-semibold">{category}</Text>
            </View>
        ));
    };

    const renderFeaturedItems = () => {
        return featuredItems.map((item) => (
            <View
                key={item.id}
                className="flex-row items-center bg-white rounded-xl p-3 mb-2 shadow-sm"
            >
                <Image
                    source={item.image ? { uri: IMAGE_URL + item.image } : ImagePath.restaurant1}
                    className="w-20 h-20 rounded-lg mr-3"
                    resizeMode="cover"
                    onError={() =>
                        ToastAndroid.show('Failed to load item image', ToastAndroid.SHORT)
                    }
                />
                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-800">
                        {item.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                        ₹{item.price.toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity
                    className="bg-green-500 rounded-full px-3 py-2"
                    onPress={() => handleAddFeaturedItemToCart(item)}
                >
                    <Text className="text-white font-semibold">Add</Text>
                </TouchableOpacity>
            </View>
        ));
    };

    return (
        <View className="bg-white rounded-2xl shadow-lg m-2">
            {renderImageCarousel()}

            <View className="mt-3">
                <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-bold text-gray-800 flex-1">{name}</Text>
                    <TouchableOpacity onPress={handleToggleWishlist}>
                        <Icons
                            name="heart"
                            size={24}
                            color={isWishlisted ? 'red' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>

                <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                    {description}
                </Text>

                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-sm text-yellow-500">
                        {'★'.repeat(Math.floor(rating))} ({rating.toFixed(1)})
                    </Text>
                    <Text
                        className={`text-sm font-semibold ${isOpen ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {isOpen ? 'Open' : 'Closed'}
                    </Text>
                </View>

                <View className="mt-3">
                    <View className="flex-row items-center">
                        <Icons name="location" size={20} color="black" />
                        <Text numberOfLines={1} className="text-sm text-gray-600 ml-2 flex-1">
                            {address}
                        </Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                        <Icons name="call" size={20} color="black" />
                        <Text className="text-sm text-gray-600 ml-2">{phone}</Text>
                    </View>
                </View>

                {categories.length > 0 && (
                    <View className="flex-row mt-3 flex-wrap">{renderCategories()}</View>
                )}

                {featuredItems.length > 0 && (
                    <View className="mt-4">
                        <Text className="text-lg font-semibold text-gray-800 mb-2">
                            Featured Items
                        </Text>
                        <ScrollView className="max-h-64">{renderFeaturedItems()}</ScrollView>
                    </View>
                )}

                <TouchableOpacity
                    className="bg-primary-90 rounded-full px-4 py-3 mt-4"
                    onPress={handleViewShopDetails}
                >
                    <Text className="text-white text-center font-semibold">
                        View Shop Details
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Shop;
