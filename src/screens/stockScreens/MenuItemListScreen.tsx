import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ToastAndroid,
    RefreshControl,
    TextInput,
    ScrollView,
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
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItem {
    id: string;
    item_name: string;
    price: string;
    images?: string[];
    description?: string;
    average_rating?: number;
    is_vegetarian?: boolean;
    is_available?: boolean;
    dietary_info?: string[];
    shop?: { id: string };
    store_id?: string;
}

interface RouteParams {
    categoryId: string;
    categoryName: string;
}

const LIMIT = 5;

const availableTags = [
    { id: 'spicy', label: 'Spicy 🌶️' },
    { id: 'bestseller', label: 'Bestseller ⭐' },
    { id: 'hot', label: 'Hot 🔥' },
    { id: 'fresh', label: 'Fresh 🥗' },
    { id: 'gluten_free', label: 'Gluten-Free 🌾' },
    { id: 'vegan', label: 'Vegan 🌱' },
];

const MenuItemListScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { categoryId, categoryName } = route.params as RouteParams;
    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isEndReached, setIsEndReached] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const [tags, setTags] = useState(null)

    const fetchData = async (pageNum = 1, isRefresh = false) => {
        if (loading || refreshing || (isEndReached && !isRefresh)) return;

        try {
            setLoading(!isRefresh);
            setRefreshing(isRefresh);
            setError(null);

            const res: any = await Fetch(
                `/user/admin-category/${categoryId}/menu-items?per_page=${LIMIT}&page=${pageNum}`,
            );

            if (res?.success) {
                const data = res.menu_items || [];
                setItems(isRefresh ? data : [...items, ...data]);
                setIsEndReached(data.length < LIMIT);
            } else {
                setIsEndReached(true);
                setError('Failed to load items');
                ToastAndroid.show('Failed to load items', ToastAndroid.SHORT);
            }
        } catch {
            setError('Network error occurred');
            ToastAndroid.show('Failed to fetch items', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchTagsData = async () => {
        try {

            const response: any = await Fetch("/user/tag", {}, 5000);
            if (!response?.success) {
                throw new Error("Faield to fetch tags")
            }
            setTags(response?.data);
        } catch (error) {
            console.log(error || "error in fetch tags")
        }
    }

    useEffect(() => {
        fetchData(1);
        fetchTagsData()
    }, [categoryId]);

    const onRefresh = () => {
        setPage(1);
        setIsEndReached(false);
        fetchData(1, true);
    };

    const loadMore = () => {
        if (!isEndReached && !loading) {
            setPage(page + 1);
            fetchData(page + 1);
        }
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        );
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase());
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => item?.dietary_info?.includes(tag));
        return matchesSearch && matchesTags;
    });

    const handleAddToCart = (item: MenuItem) => {
        try {
            dispatch(
                addToCart({
                    id: item.id,
                    name: item.item_name,
                    price: parseFloat(item.price),
                    quantity: 1,
                    image: item.images?.length ? item.images[0] : ImagePath.item1,
                    shop_id: item.shop?.id ?? item.store_id,
                }),
            );
            ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
        } catch {
            ToastAndroid.show('Error adding to cart', ToastAndroid.SHORT);
        }
    };

    const handlePlaceOrder = (item: MenuItem) => {
        navigation.navigate('AddCustomerFormScreen', {
            item: [{
                id: item.id,
                quantity: 1,
                price: Math.floor(Number(item.price)),
                name: item.item_name,
                image: item.images?.length ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1,
                shop_id: item.shop?.id ?? item.store_id,
            }],
        });
    };

    const SkeletonLoader = () => (
        <SkeletonPlaceholder>
            {[...Array(3)].map((_, index) => (
                <View key={index} className="my-2 mx-4">
                    <View className="flex-row items-center gap-4 bg-gray-100 rounded-xl p-4">
                        <View className="w-24 h-28 rounded-xl" />
                        <View className="flex-1">
                            <View className="h-6 w-3/4 rounded-md mb-2" />
                            <View className="h-4 w-1/2 rounded-md mb-2" />
                            <View className="h-4 w-1/4 rounded-md" />
                        </View>
                    </View>
                </View>
            ))}
        </SkeletonPlaceholder>
    );

    const renderItem = ({ item }: { item: any }) => (
        <FoodItem
            id={item.id}
            name={item.item_name}
            description={item.description || 'No description available'}
            restaurent={item?.shop?.restaurant_name}
            price={parseFloat(item.price) || 0}
            imageUrl={item.images?.length ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
            dietaryInfo={item.dietary_info || []}
            rating={item.average_rating || 0}
            isVegetarian={item.is_vegetarian || false}
            isAvailable={item.is_available !== false}
            onAddToCart={() => handleAddToCart(item)}
            handlePlaceOrder={() => handlePlaceOrder(item)}
            maxQuantity={10}
            item={item}
        />
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View className="flex-1 bg-gray-100">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="absolute left-4 top-2 z-10"
                >
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity>
                <LinearGradient
                    colors={['#fff5fb', '#ffeef2', '#f6efff', '#e7f5ff', '#e6fff5', '#fff7e6']}
                    start={{ x: 1, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    className="h-40 justify-center"
                >
                    <View className="px-6">
                        <Text className="text-2xl font-bold text-gray-800">{categoryName || 'Uncategorized'}</Text>
                        <Text>Crunchy, tangy & fresh from the street! 🌶️✨</Text>
                    </View>
                </LinearGradient>

                <View className="flex-row items-center gap-2 mb-2 px-4">
                    <View className="flex-row items-center flex-1 bg-white px-3 border border-gray-300 rounded-xl shadow-sm">
                        <Text>🍝</Text>
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search Item..."
                            className="ml-2 flex-1 text-sm text-gray-700"
                        />
                    </View>
                </View>

                <ScrollView
                    horizontal
                    className="px-4  "
                    style={{ maxHeight: "6%", minHeight: "6%", }}
                    contentContainerStyle={{ maxHeight: "100%", minHeight: "100%", }}

                    showsHorizontalScrollIndicator={false}
                >
                    {availableTags.map(tag => (
                        <TouchableOpacity
                            key={tag.id}
                            onPress={() => toggleTag(tag.id)}
                            className={`rounded-full px-3 py-1 h-8 mr-2 border border-gray-300 ${selectedTags.includes(tag.id) ? 'bg-green-600' : 'bg-white'
                                }`}
                        >
                            <Text className={`text-sm ${selectedTags.includes(tag.id) ? 'text-white' : 'text-gray-900'}`}>
                                {tag.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>


                {error || items.length === 0 ? (
                    loading || refreshing ? (
                        <SkeletonLoader />
                    ) : (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-gray-500 text-base">{error || 'No items found'}</Text>
                        </View>
                    )
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={filteredItems}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.3}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListFooterComponent={loading && !refreshing ? <ActivityIndicator className="my-4" /> : null}
                        ListHeaderComponent={refreshing ? <SkeletonLoader /> : null}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default MenuItemListScreen;