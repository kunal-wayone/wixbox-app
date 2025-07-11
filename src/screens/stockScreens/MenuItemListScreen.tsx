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
import {
    fetchWishlist,
    addWishlistItem,
    removeWishlistItem,
} from '../../store/slices/wishlistSlice';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { RootState } from '../../store/store';
import { ImagePath } from '../../constants/ImagePath';

// Assuming ImagePath is a constant for fallback images

interface MenuItem {
    id: string;
    item_name: string;
    price: string;
    images?: string[];
    description?: string;
    average_rating?: number;
    restaurant_name?: string;
}

interface RouteParams {
    categoryId: string;
    categoryName: string;
}

const LIMIT = 5;

const MenuItemListScreen = () => {
    const dispatch = useDispatch<any>();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { categoryId, categoryName } = route.params as RouteParams;

    const cartItems = useSelector((state: RootState) => state.cart.items);
    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isEndReached, setIsEndReached] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const lastScrollY = useRef(0);

    // Fetch menu items
    const fetchData = async (pageNum = 1, isRefresh = false) => {
        if (loading || refreshing || (isEndReached && !isRefresh)) return;

        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const res: any = await Fetch(
                `/user/admin-category/${categoryId}/menu-items?per_page=${LIMIT}&page=${pageNum}`,
            );

            if (res?.success) {
                const data = res.menu_items || [];
                setItems((prev) => (isRefresh ? data : [...prev, ...data]));
                setIsEndReached(data.length < LIMIT);
            } else {
                setIsEndReached(true);
                setError('Failed to load items');
                ToastAndroid.show('Failed to load items', ToastAndroid.SHORT);
            }
        } catch (err) {
            setError('Network error occurred');
            ToastAndroid.show('Failed to fetch items', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial fetch and wishlist load
    useEffect(() => {
        fetchData(1);
        dispatch(fetchWishlist());
    }, [categoryId]);

    // Refresh handler
    const onRefresh = () => {
        setPage(1);
        setIsEndReached(false);
        fetchData(1, true);
    };

    // Load more items
    const loadMore = () => {
        if (!isEndReached && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchData(nextPage);
        }
    };

    // Scroll handler for pull-to-refresh
    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        if (scrollY <= 0 && lastScrollY.current > 0 && !refreshing && !loading) {
            onRefresh();
        }
        lastScrollY.current = scrollY;
    };

    // Wishlist check
    const isWishlisted = (id: string) =>
        wishlistItems.some((i: any) => i.menu_item_id === id);

    // Toggle wishlist
    const toggleWishlist = (id: string) => {
        if (isWishlisted(id)) {
            dispatch(removeWishlistItem({ menu_item_id: id }));
            ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
        } else {
            dispatch(addWishlistItem({ menu_item_id: id }));
            ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
        }
    };

    // Add to cart
    const handleAddToCart = (item: MenuItem) => {
        dispatch(
            addToCart({
                id: item.id,
                name: item.item_name,
                price: parseFloat(item.price),
                quantity: 1,
            }),
        );
        ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
    };

    // Place order
    const handlePlaceOrder = (item: MenuItem) => {
        navigation.navigate('AddCustomerFormScreen', {
            item: [
                {
                    id: item.id,
                    quantity: 1,
                    price: Math.floor(Number(item.price)),
                    name: item.item_name,
                    image: item?.images?.length ? item.images[0] : '',
                },
            ],
        });
    };

    // Skeleton loader component
    const SkeletonLoader = () => (
        <SkeletonPlaceholder>
            {[...Array(5)].map((_, index) => (
                <View key={index} style={{ marginVertical: 8, marginHorizontal: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16 }}>
                        <View style={{ width: 96, height: 112, borderRadius: 12 }} />
                        <View style={{ flex: 1 }}>
                            <View style={{ height: 24, width: '75%', borderRadius: 6, marginBottom: 8 }} />
                            <View style={{ height: 16, width: '50%', borderRadius: 6, marginBottom: 8 }} />
                            <View style={{ height: 16, width: '25%', borderRadius: 6, marginBottom: 4 }} />
                            <View style={{ height: 16, width: '33%', borderRadius: 6 }} />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                        <View style={{ height: 40, width: 160, borderRadius: 6 }} />
                        <View style={{ height: 40, width: 160, borderRadius: 6 }} />
                    </View>
                </View>
            ))}
        </SkeletonPlaceholder>
    );

    // Render item
    const renderItem = ({ item }: { item: MenuItem }) => {
        const isInCart = cartItems.some((cartItem: any) => cartItem.id === item.id);
        return (
            <View className="bg-gray-100 rounded-xl p-4 mx-4 my-2">
                <Text className="absolute top-2 right-12 text-yellow-500">
                    <AntDesign name="star" size={19} color="#FFC727" /> {item?.average_rating ?? 'N/A'}
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
                <View className="flex-row items-center gap-4">
                    <Image
                        source={item?.images?.length ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
                        className="w-24 h-28 rounded-xl"
                        resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                        <Text className="text-xl font-bold" numberOfLines={1} ellipsizeMode="tail">
                            {item?.item_name ?? 'Unknown Item'}
                        </Text>
                        <Text className="text-gray-500 mb-2" numberOfLines={1} ellipsizeMode="tail">
                            {item?.description || 'No description available'}
                        </Text>
                        <Text className="mb-1">₹{item?.price ?? '0.00'}/-</Text>
                        <Text>{item?.restaurant_name || 'Unknown Restaurant'}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between gap-3 mt-4">
                    <TouchableOpacity
                        className={`px-3 py-2 flex-row items-center justify-center rounded-md w-40 ${isInCart ? 'bg-green-600' : 'bg-primary-90'}`}
                        onPress={() => {
                            if (isInCart) {
                                navigation.navigate('CartScreen');
                            } else {
                                handleAddToCart(item);
                            }
                        }}
                    >
                        <Text className="text-white text-md font-medium">
                            {isInCart ? 'View Cart' : 'Add To Cart'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handlePlaceOrder(item)}
                        className="bg-blue-600 px-3 py-2 flex-row items-center justify-center gap-1 w-40 rounded-md"
                    >
                        <Ionicons name="fast-food-outline" size={18} color="white" />
                        <Text className="text-white">Order Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-100 pt-4">
            {/* Header */}
            <View className="flex-row items-center mb-4 px-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="pr-2 absolute left-4 z-10"
                >
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 text-center flex-1">
                    {categoryName}
                </Text>
            </View>

            {/* Content */}
            {error || items.length === 0 ? (
                loading || refreshing ? (
                    <SkeletonLoader />
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-gray-500 text-base">
                            {error || 'No items found'}
                        </Text>
                    </View>
                )
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListFooterComponent={loading && !refreshing ? <ActivityIndicator className="my-4" /> : null}
                    ListHeaderComponent={refreshing ? <SkeletonLoader /> : null}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />
            )}
        </View>
    );
};

export default MenuItemListScreen;