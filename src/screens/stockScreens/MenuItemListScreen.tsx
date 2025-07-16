import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ToastAndroid,
    RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addToCart } from '../../store/slices/cartSlice';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { RootState } from '../../store/store';
import { ImagePath } from '../../constants/ImagePath';
import FoodItem from '../../components/common/FoodItem';

interface MenuItem {
    id: string;
    item_name: string;
    price: string;
    images?: string[];
    description?: string;
    average_rating?: number;
    restaurant_name?: string;
    is_vegetarian?: boolean;
    is_available?: boolean;
    dietary_info?: string[];
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
            console.log(res, "dkfkdsj")
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
            console.log(err)
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


    // Add to cart
    const handleAddToCart = (item: any) => {
        console.log(item)
        try {
            dispatch(
                addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item?.images?.length > 0 ? item?.images[0] : ImagePath.item1,
                    shop_id: item?.shop?.id
                }),
            );
        } catch (error) {
            ToastAndroid.show('Error adding to cart', ToastAndroid.SHORT);
            console.error('Add to cart error:', error);
        }
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

    // Skeleton loader component
    const SkeletonLoader = () => (
        <SkeletonPlaceholder>
            {[...Array(5)].map((_, index) => (
                <View key={index} className="my-2 mx-4">
                    <View className="flex-row items-center gap-4 bg-gray-100 rounded-xl p-4">
                        <View className="w-24 h-28 rounded-xl" />
                        <View className="flex-1">
                            <View className="h-6 w-3/4 rounded-md mb-2" />
                            <View className="h-4 w-1/2 rounded-md mb-2" />
                            <View className="h-4 w-1/4 rounded-md mb-1" />
                            <View className="h-4 w-1/3 rounded-md" />
                        </View>
                    </View>
                    <View className="flex-row justify-center gap-3 mt-3">
                        <View className="h-10 w-40 rounded-md" />
                        <View className="h-10 w-40 rounded-md" />
                    </View>
                </View>
            ))}
        </SkeletonPlaceholder>
    );

    // Render item
    const renderItem = ({ item, index }: { item: MenuItem, index: any }) => (
        <View>
            <FoodItem
                id={item?.id}
                name={item.item_name}
                description={item.description || 'No description available'}
                price={parseFloat(item.price) || 0}
                imageUrl={
                    (item.images?.length ?? 0) > 0
                        ? { uri: IMAGE_URL + item.images![0] }
                        : ImagePath.item1
                }
                dietaryInfo={item?.dietary_info || []}
                rating={item.average_rating || 0}
                isVegetarian={item.is_vegetarian || false}
                isAvailable={item.is_available !== false}
                onAddToCart={() => handleAddToCart}
                handlePlaceOrder={handlePlaceOrder}
                maxQuantity={10}
                item={item}
            />
        </View>
    );

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
                    keyExtractor={(_, index) => index.toString()}
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