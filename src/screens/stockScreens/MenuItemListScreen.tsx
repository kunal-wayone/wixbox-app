import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ToastAndroid,
    RefreshControl,
    Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addToCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import {
    fetchWishlist,
    addWishlistItem,
    removeWishlistItem,
} from '../../store/slices/wishlistSlice';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const LIMIT = 5;

const MenuItemListScreen = () => {
    const dispatch = useDispatch<any>();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { categoryId, categoryName } = route.params;

    const wishlistItems = useSelector((state: any) => state.wishlist.items);
    const [items, setItems] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isEndReached, setIsEndReached] = useState(false);
    const [error, setError] = useState(false);
    const flatListRef = useRef<FlatList>(null); // Ref for FlatList
    const lastScrollY = useRef(0); // Track last scroll position

    const fetchData = async (pageNum = 1, isRefresh = false) => {
        if (loading || refreshing) return;

        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(false);

            const res: any = await Fetch(`/user/category/${categoryId}/filter?per_page=${LIMIT}&page=${pageNum}`);

            if (res?.success) {
                const data = res.menu_items || [];
                setItems(prev => (isRefresh ? data : [...prev, ...data]));
                setIsEndReached(data.length < LIMIT);
            } else {
                setIsEndReached(true);
                setError(true);
            }
        } catch (err) {
            setError(true);
            ToastAndroid.show('Failed to fetch items', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData(1);
        dispatch(fetchWishlist());
    }, []);

    const onRefresh = () => {
        setPage(1);
        setIsEndReached(false);
        fetchData(1, true);
    };

    const loadMore = () => {
        if (!isEndReached && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchData(nextPage);
        }
    };

    // Handle scroll to top refresh
    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        // Check if scrolled to top (scrollY <= 0) and scrolling upwards
        if (scrollY <= 0 && lastScrollY.current > 0 && !refreshing && !loading) {
            onRefresh();
        }
        lastScrollY.current = scrollY;
    };

    const isWishlisted = (id: string) => wishlistItems.some((i: any) => i.menu_item_id === id);

    const toggleWishlist = (id: string) => {
        if (isWishlisted(id)) {
            dispatch(removeWishlistItem({ menu_item_id: id }));
        } else {
            dispatch(addWishlistItem({ menu_item_id: id }));
        }
    };

    const handleAddToCart = (item: any) => {
        console.log(item,"hdsjfjdj")
        dispatch(addToCart({
            id: item.id,
            name: item.item_name,
            price: parseFloat(item.price),
            quantity: 1,
        }));
        ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
    };

    const handlePlaceOrder = (item: any) => {
        dispatch(createOrder({
            items: [item],
            totalAmount: parseFloat(item.price),
        }));
        ToastAndroid.show('Order placed successfully', ToastAndroid.SHORT);
    };

    const SkeletonLoader = () => (
        <SkeletonPlaceholder>
            {[...Array(5)].map((_, index) => (
                <View key={index} className="flex-col gap-4 bg-primary-10 rounded-xl p-4 mx-4 my-2">
                    <View className="flex-row items-center justify-center gap-4">
                        <View className="w-24 h-28 rounded-xl" />
                        <View style={{ flex: 1 }}>
                            <View className="h-6 w-3/4 rounded-md mb-2" />
                            <View className="h-4 w-1/2 rounded-md mb-2" />
                            <View className="h-4 w-1/4 rounded-md mb-1" />
                            <View className="h-4 w-1/3 rounded-md" />
                        </View>
                    </View>
                    <View className="flex-row items-center justify-center gap-3">
                        <View className="h-10 w-40 rounded-md" />
                        <View className="h-10 w-40 rounded-md" />
                    </View>
                </View>
            ))}
        </SkeletonPlaceholder>
    );

    const renderItem = ({ item }: { item: any }) => (
        <View className="flex-col gap-4 bg-primary-10 rounded-xl p-4 mx-4 my-2">
            <Text className="absolute top-2 right-12">
                <AntDesign name="star" size={19} color={'#FFC727'} /> {item?.average_rating}
            </Text>
            <TouchableOpacity
                className="absolute top-2 right-5"
                onPress={() => toggleWishlist(item.id)}
            >
                <MaterialIcons
                    name={isWishlisted(item.id) ? 'favorite' : 'favorite-outline'}
                    size={19}
                    color={isWishlisted(item.id) ? 'red' : 'black'}
                />
            </TouchableOpacity>
            <View className="flex-row items-center justify-center gap-4">
                <Image
                    source={item?.images?.length ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
                    className="w-24 h-28 rounded-xl"
                    resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                    <Text className="text-xl font-bold" numberOfLines={1} ellipsizeMode="tail">
                        {item?.item_name}
                    </Text>
                    <View className="flex-row items-center gap-4 mb-2">
                        <Text className="text-gray-500" numberOfLines={1} ellipsizeMode="tail">
                            {item?.description || 'NA'}
                        </Text>
                    </View>
                    <Text className="mb-1">₹{item?.price}/-</Text>
                    <Text>{item?.restaurant_name || 'NA'}</Text>
                </View>
            </View>
            <View className="flex-row items-center justify-center gap-3">
                <TouchableOpacity
                    onPress={() => handleAddToCart(item)}
                    className="bg-primary-80 px-3 py-2 flex-row items-center gap-1 w-40 justify-center rounded-md"
                >
                    <Ionicons name="cart-outline" size={18} color="white" />
                    <Text className="text-white">Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handlePlaceOrder(item)}
                    className="bg-green-600 px-3 py-2 flex-row items-center justify-center gap-1 w-40 rounded-md"
                >
                    <Ionicons name="fast-food-outline" size={18} color="white" />
                    <Text className="text-white">Order Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 pt-4">
            {/* Header */}
            <View className="flex-row items-center mb-4 px-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="pr-2 absolute left-4 z-10">
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 text-center flex-1"> {categoryName}</Text>
            </View>

            {error || items.length === 0 ? (
                loading || refreshing ? (
                    <SkeletonLoader />
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-gray-500 text-base">No items found</Text>
                    </View>
                )
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={items}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListFooterComponent={loading ? <ActivityIndicator className="my-4" /> : null}
                    ListHeaderComponent={refreshing ? <SkeletonLoader /> : null}
                    onScroll={handleScroll}
                    scrollEventThrottle={16} // Optimize scroll event frequency
                />
            )}
        </View>
    );
};

export default MenuItemListScreen;