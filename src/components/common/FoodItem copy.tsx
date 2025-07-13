import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ToastAndroid } from 'react-native';
import { ImagePath } from '../../constants/ImagePath';
// import { HeartIcon, PlusIcon, MinusIcon } from 'react-native-heroicons/solid';
import Icons from "react-native-vector-icons/Ionicons"

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
    onAddToCart = () => { },
    handlePlaceOrder = () => { },
    onToggleFavorite = () => { },
    maxQuantity = 10,
    item = {}
}: any) => {
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    const handleQuantityChange = (type: any) => {
        try {
            if (type === 'increment' && quantity < maxQuantity) {
                setQuantity(quantity + 1);
            } else if (type === 'decrement' && quantity > 1) {
                setQuantity(quantity - 1);
            } else {
                ToastAndroid.show(
                    type === 'increment'
                        ? 'Maximum quantity reached!'
                        : 'Minimum quantity is 1!',
                    ToastAndroid.SHORT
                );
            }
        } catch (error) {
            ToastAndroid.show('Error updating quantity', ToastAndroid.SHORT);
            console.error('Quantity change error:', error);
        }
    };

    const handleAddToCart = () => {
        try {
            if (!isAvailable) {
                ToastAndroid.show('Item is out of stock!', ToastAndroid.SHORT);
                return;
            }
            onAddToCart({ id, name, price, quantity });
            ToastAndroid.show(`${name} added to cart!`, ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show('Error adding to cart', ToastAndroid.SHORT);
            console.error('Add to cart error:', error);
        }
    };

    const handleFavoriteToggle = () => {
        try {
            setIsFavorite(!isFavorite);
            onToggleFavorite(id, !isFavorite);
            ToastAndroid.show(
                isFavorite ? 'Removed from favorites' : 'Added to favorites',
                ToastAndroid.SHORT
            );
        } catch (error) {
            ToastAndroid.show('Error updating favorites', ToastAndroid.SHORT);
            console.error('Favorite toggle error:', error);
        }
    };

    const renderDietaryBadges = () => {
        return dietaryInfo.map((info: any, index: any) => (
            <View
                key={index}
                className="bg-blue-100 rounded-full px-2 py-1 mr-1"
            >
                <Text className="text-blue-800 text-xs font-semibold">{info}</Text>
            </View>
        ));
    };

    return (
        <View className="bg-white rounded-2xl shadow-lg m-2 p-4 flex-row">
            {/* Image Section */}
            <View className="w-1/3">
                <Image
                    source={imageUrl}
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
                    {/* <Icons name='cart' size={20} color={"white"} /> */}
                    <Text className='text-white'>Buy Now</Text>
                </TouchableOpacity>
                {isVegetarian && (
                    <View className="absolute top-2 left-2 bg-gray-100 rounded p-0.5">
                        <Image source={ImagePath.veg} className='w-5 h-5' resizeMode='contain' />
                    </View>
                )}
                {!isVegetarian && (
                    <View className="absolute top-2 left-2 bg-gray-100 rounded  p-0.5">
                        <Image source={ImagePath.nonveg} className='w-5 h-5' resizeMode='contain' />
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View className="w-2/3 pl-4 flex-1">
                <View className="flex-row justify-between items-start">
                    <Text className="text-lg font-bold text-gray-800 flex-1">{name}</Text>
                    <TouchableOpacity onPress={handleFavoriteToggle}>
                        <Icons name='heart'
                            size={24}
                            color={isFavorite ? 'red' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>

                <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                    {description}
                </Text>

                {/* Dietary Badges */}
                <View className="flex-row mt-2 flex-wrap">
                    {renderDietaryBadges()}
                </View>

                {/* Rating and Price */}
                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-sm text-yellow-500">
                        {'★'.repeat(Math.floor(rating))} ({rating.toFixed(1)})
                    </Text>
                    <Text className="text-lg font-semibold text-green-600">
                        ${price.toFixed(2)}
                    </Text>
                </View>

                {/* Quantity and Add to Cart */}
                <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center bg-gray-100 rounded-full">
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => handleQuantityChange('decrement')}
                        >
                            <Icons name='remove-outline' size={20} color="black" />
                        </TouchableOpacity>
                        <Text className="px-3 text-base font-semibold">{quantity}</Text>
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => handleQuantityChange('increment')}
                        >
                            <Icons name='add' size={20} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`rounded-full px-4 py-2 ${isAvailable ? 'bg-primary-90' : 'bg-gray-400'
                            }`}
                        onPress={handleAddToCart}
                        disabled={!isAvailable}
                    >
                        <Text className="text-white font-semibold">
                            {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default FoodItem;