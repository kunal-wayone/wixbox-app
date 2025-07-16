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
import { IMAGE_URL } from '../../utils/apiUtils';
import { addToCart } from '../../store/slices/cartSlice';


const FoodItem = ({
    id,
    name = 'Unknown Dish',
    description = 'No description available',
    restaurent,
    price = 0,
    imageUrl,
    dietaryInfo = [],
    rating = 0,
    isVegetarian = false,
    isAvailable = true,
    handlePlaceOrder = () => { },
    maxQuantity = 10,
    item = {},
}: any) => {
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch<any>();
    const navigation = useNavigation<any>();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const wishlistItems = useSelector((state: RootState) => state.wishlist.menu_items);
    const isFavorite = wishlistItems?.some((i) => i.id === id);
    const inCart = cartItems?.some((i) => i.id === id);
    const [addedToCart, setAddedToCart] = useState(inCart);
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
        const cartHasItems = cartItems.length > 0;
        const isDifferentShop = cartHasItems && cartItems[0].shop_id !== (item?.shop?.id ?? item?.store_id);

        // Prevent adding items from different shops
        if (isDifferentShop) {
            ToastAndroid.show(
                'You can only add items from one shop at a time.',
                ToastAndroid.SHORT
            );
            return; // Don't update the state
        }
        console.log({
            id,
            name,
            price,
            quantity,
            image: imageUrl,
            shop_id: item?.shop?.id
        }, item, imageUrl)
        dispatch(
            addToCart({
                id,
                name,
                price,
                quantity,
                image: imageUrl,
                shop_id: item?.shop?.id ?? item?.store_id
            })
        );
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
        <View className="relative bg-white border border-gray-300 rounded-2xl shadow-lg m-2 p-4 flex-row">
            {item?.shop?.status === 0 && (
                <TouchableOpacity
                    onPress={() =>
                        ToastAndroid.show("Shop temporarily closed now", ToastAndroid.SHORT)
                    }
                    className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 z-50 rounded-2xl"
                // activeOpacity={1}
                />
            )}

            {/* Image Section */}
            <View className="w-1/3">
                <Image
                    source={typeof imageUrl === 'string' ? { uri: IMAGE_URL + imageUrl } : imageUrl}
                    className="w-full flex-1 h-full rounded-xl"
                    resizeMode="cover"
                    onError={() =>
                        ToastAndroid.show('Failed to load image', ToastAndroid.SHORT)
                    }
                />
                <TouchableOpacity
                    className="w-4/5 mx-auto mt-[-5%] bg-green-500 px-4 py-2 rounded-xl"
                    onPress={() => handlePlaceOrder(item)}
                >
                    <Text className="text-white text-center">Buy Now</Text>
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

                <Text className="text-sm text-gray-600 mb-1" numberOfLines={2} ellipsizeMode='tail'>
                    {description}
                </Text>
                <View className='flex-row items-center gap-1 my-1'>
                    <Icons
                        name="storefront-outline"
                        size={16}
                        color={'gray'}
                    />
                    <Text className="text-sm text-gray-600 " numberOfLines={2}>
                        {restaurent}
                    </Text>
                </View>
                {/* <View className="flex-row mt-2 flex-wrap">{renderDietaryBadges()}</View> */}

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
                        onPress={() => addedToCart ? navigation.navigate("CartScreen") : handleAddToCart()}
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
