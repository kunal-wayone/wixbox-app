import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ToastAndroid,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { RootState } from '../../store/store';
import { ImagePath } from '../../constants/ImagePath';
import {
    addWishlistItem,
    removeWishlistItem,
} from '../../store/slices/wishlistSlice';
import { IMAGE_URL } from '../../utils/apiUtils';
import { addToCart } from '../../store/slices/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


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
    const isFav = wishlistItems?.some((i) => i.id === id);
    const [isAdded, setIsAdded] = useState(isFav)
    const [isFavorite, setIsFavorite] = useState(isFav)
    const inCart = cartItems?.some((i) => i.id === id);
    const [addedToCart, setAddedToCart] = useState(inCart);
    const isFocused = useIsFocused()
    const [shopStatus, setShopStatus] = useState({
        isOpen: false,
        openingTime: null,
        closingTime: null,
    });
    let shiftDetails: any[] = [];
    try {
        if (item?.shop?.shift_details) {
            shiftDetails =
                typeof item.shop.shift_details === 'string'
                    ? JSON.parse(item.shop.shift_details)
                    : item.shop.shift_details;
        }
    } catch {
        shiftDetails = [];
    }

    const formatToAMPM = (time24: string) => {
        const [hourStr, minute] = time24.split(':');
        let hour = parseInt(hourStr);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute} ${ampm}`;
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
            return { isOpen: false, openingTime: null, closingTime: null };
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
            setShopStatus(getShopStatus());
            console.log(getShopStatus())
        }
    }, [isFocused]);


    const handleQuantityChange = (type: 'increment' | 'decrement') => {
        if (type === 'increment') {
            if (quantity < maxQuantity) setQuantity(quantity + 1);
            else ToastAndroid.show('Maximum quantity reached!', ToastAndroid.SHORT);
        } else {
            if (quantity > 1) setQuantity(quantity - 1);
            else ToastAndroid.show('Minimum quantity is 1!', ToastAndroid.SHORT);
        }
    };

    const handleAddToCart = () => {
        if (!isAvailable) {
            ToastAndroid.show('Item is out of stock!', ToastAndroid.SHORT);
            return;
        }
        if (cartItems.length > 0) {
            const currentShopId = item?.shop?.id ?? item?.store_id;
            const cartShopId = cartItems[0]?.shop_id;

            if (cartShopId !== currentShopId) {
                ToastAndroid.show(
                    'You can only add items from one shop at a time.',
                    ToastAndroid.SHORT
                );
                return;
            }
        }
        dispatch(
            addToCart({
                id,
                name,
                price,
                quantity,
                image: item?.images?.[0],
                shop_id: item?.shop?.id ?? item?.store_id,
                tax: item?.tax || 0,
            })
        );
        setAddedToCart(true);
    };


    const handleToggleWishlist = async () => {
        try {
            const action = isAdded ? removeWishlistItem : addWishlistItem;
            const result = await dispatch(action({ menu_item_id: id })).unwrap();

            // Show toast on success only
            if (result) {
                setIsAdded(!isAdded);
                ToastAndroid.show(
                    !isAdded ? 'Added to wishlist' : 'Removed from wishlist',
                    ToastAndroid.SHORT
                );
            } else {
                ToastAndroid.show(
                    'Something went wrong updating wishlist',
                    ToastAndroid.SHORT
                );
            }
        } catch (error) {
            ToastAndroid.show('Error updating wishlist', ToastAndroid.SHORT);
        }
    };

    useEffect(() => {
        setIsAdded(isFav);
    }, [isFav]);

    // useEffect(() => {
    //     setIsFavorite(wishlistItems.some((i: any) => i.id === id));
    // }, [wishlistItems, handleToggleWishlist, id]);

    useEffect(() => {
        setAddedToCart(cartItems.some((i: any) => i.id === id));
    }, [cartItems, id]);
    return (
        <TouchableOpacity onPress={() => {
            navigation.navigate("ProductDetailsScreen", { productId: item?.id })
        }} className="relative bg-white border border-gray-300 rounded-2xl shadow-lg m-2 p-3 flex-row">
            {!shopStatus?.isOpen && (
                <TouchableOpacity
                    onPress={() => {
                        ToastAndroid.show("Shop temporarily closed now", ToastAndroid.SHORT)
                        navigation.navigate("ProductDetailsScreen", { productId: item?.id })
                    }
                    }
                    className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 z-50 rounded-2xl"
                // activeOpacity={1}
                />
            )}

            {/* Image Section */}
            <View className="w-1/3 ">
                <Image
                    source={typeof imageUrl === 'string' ? { uri: IMAGE_URL + imageUrl } : imageUrl}
                    className="w-full flex-1 h-full rounded-xl"
                    resizeMode="cover"
                    onError={() =>
                        ToastAndroid.show('Failed to load image', ToastAndroid.SHORT)
                    }
                />
                <TouchableOpacity
                    className="w-4/5 mx-auto mt-[-9%] bg-green-500 px-2 py-1.5 rounded-full"
                    onPress={() => handlePlaceOrder(item)}
                >
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-sm text-center">Buy Now</Text>
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
                    <Text style={{ fontFamily: 'Raleway-Bold' }} className="  text-gray-800 flex-1 " numberOfLines={1} ellipsizeMode='tail'>{name}</Text>
                    <TouchableOpacity onPress={handleToggleWishlist}>
                        <Icons name={isAdded ? 'heart' : 'heart-outline'} size={24} color={isAdded ? 'red' : 'gray'} />
                    </TouchableOpacity>
                </View>
                <View className='flex-row items-center justify-between '>
                    <View className='flex-row items-center gap-1'>
                        <Icons
                            name="storefront-outline"
                            size={12}
                            color={'gray'}
                        />
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xs text-gray-600 w-3/5 " numberOfLines={1} ellipsizeMode='tail'>
                            {restaurent}
                        </Text>
                    </View>
                    <View className='flex-row items-center mt-1 '>
                        <MaterialIcons name='directions-run' className='mr-0.5' />
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className='text-sm'>{item?.shop?.distance_km || "NA"}</Text>
                    </View>
                </View>
                {/* <View className="flex-row mt-2 flex-wrap">{renderDietaryBadges()}</View> */}

                <View className="flex-row justify-between items-center mt-1">
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-yellow-600">
                        {/* {'★'.repeat(Math.floor(rating))} */}
                        ★ {rating.toFixed(1)}
                    </Text>
                    <View className='flex-row items-center'>
                        <Icon name='timer-outline' className='mr-0.5' />
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">
                            {item?.prepration_time || "10-12"} mins
                        </Text>
                    </View>
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className=" text-green-600">
                        ₹{price.toFixed(2)}
                    </Text>
                </View>

                {/* Quantity and Cart Controls */}
                <View className="flex-row justify-between items-center mt-3 ">
                    <View className="flex-row items-center bg-gray-100 rounded-full">
                        <TouchableOpacity
                            className="p-1"
                            onPress={() => handleQuantityChange('decrement')}
                        >
                            <Icons name="remove-outline" size={20} color="black" />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="px-3 text-base">{quantity}</Text>
                        <TouchableOpacity
                            className="p-1"
                            onPress={() => handleQuantityChange('increment')}
                        >
                            <Icons name="add" size={20} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`rounded-full px-4 py-1.5 ${isAvailable
                            ? addedToCart
                                ? 'bg-green-600'
                                : 'bg-primary-90'
                            : 'bg-gray-400'
                            }`}
                        onPress={() => addedToCart ? navigation.navigate("CartScreen") : handleAddToCart()}
                        disabled={!isAvailable}
                    >
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-sm">
                            {isAvailable ? (addedToCart ? 'View Cart' : 'Add to Cart') : 'Out of Stock'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default FoodItem;
