import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    ToastAndroid,
    Dimensions,
    StyleSheet,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_IMAGE = ImagePath.item1;
const ITEM_WIDTH = (Dimensions.get('window').width - 38) / 2;

const AllCategoriesScreen = () => {
    const navigation = useNavigation<any>();
    const PER_PAGE = 20;

    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollY = new Animated.Value(0);

    const fetchCategories = useCallback(
        async (pageNumber: number, isInitial = false) => {
            if ((loadingMore && !isInitial) || (!hasMore && !isInitial)) return;

            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            try {
                setError(null);
                const response: any = await Fetch(
                    `/user/admin-category?per_page=${PER_PAGE}&page=${pageNumber}`,
                    {},
                    5000
                );

                if (!response.success) throw new Error(response.message);

                const newCategories = response.data.map((item: any) => ({
                    ...item,
                    image: item.image && item.image.trim() !== '' ? IMAGE_URL + item.image : DEFAULT_IMAGE,
                }));

                setData((prev) => (isInitial ? newCategories : [...prev, ...newCategories]));
                setHasMore(response.pagination.current_page < Math.ceil(response.pagination.total / response.pagination.per_page));
                setPage(response.pagination.current_page + 1);
            } catch (error: any) {
                setError(error.message || 'Failed to fetch categories');
                ToastAndroid.show(error.message || 'Fetch failed', ToastAndroid.SHORT);
            } finally {
                if (isInitial) setLoading(false);
                else setLoadingMore(false);
            }
        },
        [hasMore, loadingMore]
    );

    useEffect(() => {
        fetchCategories(1, true);
    }, [fetchCategories]);

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        await fetchCategories(1, true);
        setRefreshing(false);
    };

    const handleCategoryPress = (category: any) => {
        navigation.navigate('MenuItemListScreen', {
            categoryId: category.id,
            categoryName: category.name,
        });
    };

    const handleImageError = (categoryId: number) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === categoryId ? { ...item, image: DEFAULT_IMAGE } : item
            )
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { width: ITEM_WIDTH }]}
            activeOpacity={0.85}
            onPress={() => handleCategoryPress(item)}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
                onError={() => handleImageError(item.id)}
            />
            <Text style={styles.title} numberOfLines={2}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator size="large" style={{ marginVertical: 20 }} color="#5A67D8" />;
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#5A67D8" />
                <Text style={{ marginTop: 10, color: '#555' }}>Loading categories...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <LinearGradient colors={['#fdfbfb', '#ebedee']} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Explore Categories</Text>
                </View>

                {/* Error */}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Grid */}
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    onEndReached={() => {
                        if (hasMore && !loadingMore) fetchCategories(page);
                    }}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={{ paddingBottom: 12, paddingTop: 12 }}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 5,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#ffffffcc',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        // backdropFilter: 'blur(10px)',
    },
    backButton: {
        paddingRight: 12,
        position: "absolute",
        left: 5,
    },
    headerText: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        width: "100%",
        fontFamily: 'Raleway-Regular',
    },
    card: {
        backgroundColor: '#0f0f0f',
        borderRadius: 14,
        marginBottom: 16,
        shadowColor: '#000',
        elevation: 4,
        overflow: 'hidden',
    },
    image: {
        height: 100,
        width: '100%',
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    title: {
        padding: 5,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        color: '#fff',
        fontFamily: 'Raleway-Regular',
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
        marginVertical: 10,
        fontFamily: 'Raleway-Regular',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AllCategoriesScreen;
