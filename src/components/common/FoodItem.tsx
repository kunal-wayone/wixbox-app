import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ToastAndroid,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { RootState } from '../../store/store';
import { ImagePath } from '../../constants/ImagePath';
import {
    addWishlistItem,
    removeWishlistItem,
} from '../../store/slices/wishlistSlice';
import { addAddUserCartItem } from '../../store/slices/userCartSlice';
import { IMAGE_URL } from '../../utils/apiUtils';

const FoodItem = ({
    id,
    name = 'Unknown Dish',
    description = 'No description available',
    price = 0,
    imageUrl = ImagePath.item1,
    dietaryInfo = [],
    rating = 0,
    isVegetarian = false,
    isAvailable = true,
    handlePlaceOrder = () => { },
    maxQuantity = 10,
    item = {},
}: any) => {
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    const dispatch = useDispatch<any>();
    const navigation = useNavigation<any>();

    const wishlistItems = useSelector((state: RootState) => state.wishlist.menu_items);
    const isFavorite = wishlistItems?.some((i) => i.id === id);

    const handleQuantityChange = (type: 'increment' | 'decrement') => {
        if (type === 'increment' && quantity < maxQuantity) {
            setQuantity((prev) => prev + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity((prev) => prev - 1);
        } else {
            ToastAndroid.show(
                type === 'increment'
                    ? 'Maximum quantity reached!'
                    : 'Minimum quantity is 1!',
                ToastAndroid.SHORT
            );
        }
    };

    const handleAddToCart = () => {
        if (!isAvailable) {
            ToastAndroid.show('Item is out of stock!', ToastAndroid.SHORT);
            return;
        }

        dispatch(
            addAddUserCartItem({
                id,
                name,
                price,
                quantity,
                image: imageUrl,
            })
        );
        ToastAndroid.show(`${name} added to cart!`, ToastAndroid.SHORT);
        setAddedToCart(true);
    };

    const handleFavoriteToggle = async () => {
        try {
            if (isFavorite) {
                await dispatch(removeWishlistItem({ menu_item_id: id })).unwrap();
                ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
            } else {
                await dispatch(addWishlistItem({ menu_item_id: id })).unwrap();
                ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Failed to update wishlist', ToastAndroid.SHORT);
        }
    };

    const renderDietaryBadges = () =>
        dietaryInfo.map((info: any, index: number) => (
            <View
                key={index}
                className="bg-blue-100 rounded-full px-2 py-1 mr-1"
            >
                <Text className="text-blue-800 text-xs font-semibold">{info}</Text>
            </View>
        ));

    return (
        <View className="bg-white rounded-2xl shadow-lg m-2 p-4 flex-row">
            {/* Image Section */}
            <View className="w-1/3">
                <Image
                    source={typeof imageUrl === 'string' ? { uri: IMAGE_URL + imageUrl } : imageUrl}
                    className="w-full h-32 rounded-xl"
                    resizeMode="cover"
                    onError={() =>
                        ToastAndroid.show('Failed to load image', ToastAndroid.SHORT)
                    }
                />
                <TouchableOpacity
                    className="bg-green-500 px-2 py-1 absolute bottom-0 left-1/2 -translate-x-1/2 rounded-xl"
                    onPress={() => handlePlaceOrder(item)}
                >
                    <Text className="text-white">Buy Now</Text>
                </TouchableOpacity>
                <View className="absolute top-2 left-2 bg-gray-100 rounded p-0.5">
                    <Image
                        source={isVegetarian ? ImagePath.veg : ImagePath.nonveg}
                        className="w-5 h-5"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Content Section */}
            <View className="w-2/3 pl-4 flex-1">
                <View className="flex-row justify-between items-start">
                    <Text className="text-lg font-bold text-gray-800 flex-1">{name}</Text>
                    <TouchableOpacity onPress={handleFavoriteToggle}>
                        <Icons
                            name="heart"
                            size={24}
                            color={isFavorite ? 'red' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>

                <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                    {description}
                </Text>

                <View className="flex-row mt-2 flex-wrap">{renderDietaryBadges()}</View>

                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-sm text-yellow-500">
                        {'★'.repeat(Math.floor(rating))} ({rating.toFixed(1)})
                    </Text>
                    <Text className="text-lg font-semibold text-green-600">
                        ₹{price.toFixed(2)}
                    </Text>
                </View>

                {/* Quantity and Cart Controls */}
                <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center bg-gray-100 rounded-full">
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => handleQuantityChange('decrement')}
                        >
                            <Icons name="remove-outline" size={20} color="black" />
                        </TouchableOpacity>
                        <Text className="px-3 text-base font-semibold">{quantity}</Text>
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => handleQuantityChange('increment')}
                        >
                            <Icons name="add" size={20} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`rounded-full px-4 py-2 ${isAvailable
                                ? addedToCart
                                    ? 'bg-green-600'
                                    : 'bg-primary-90'
                                : 'bg-gray-400'
                            }`}
                        onPress={handleAddToCart}
                        disabled={!isAvailable}
                    >
                        <Text className="text-white font-semibold">
                            {isAvailable ? (addedToCart ? 'View Cart' : 'Add to Cart') : 'Out of Stock'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default FoodItem;
