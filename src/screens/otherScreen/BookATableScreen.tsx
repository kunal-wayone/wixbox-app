import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fetch } from '../../utils/apiUtils';
import Shop from '../../components/common/Shop';

const PER_PAGE = 5;

const BookATableScreen = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async (pageNumber = 1, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res: any = await Fetch(`/user/shops-nearby?per_page=${PER_PAGE}&page=${pageNumber}`, {}, 5000);
      if (!res.success) throw new Error(res.message || 'Failed to fetch');

      const shops = res.data.nearby_shops || [];
      const current = res.data.pagination.current_page;
      const totalPages = res.data.pagination.last_page;

      setLastPage(totalPages);

      setData(prev =>
        isRefresh || pageNumber === 1
          ? shops
          : [...prev, ...shops.filter((s: any) => !prev.some(p => p.id === s.id))]
      );

      setPage(current + 1);
    } catch (e: any) {
      setError(e.message);
      ToastAndroid.show(e.message || 'Failed to fetch', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStores(1);
  }, [fetchStores]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchStores(1, true);
  };

  const renderFooter = () => {
    if (page > lastPage) return null;

    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <TouchableOpacity
            onPress={() => fetchStores(page)}
            className='bg-primary-90 rounded-xl'
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontFamily: 'Raleway-Regular', color: '#fff', fontWeight: 'bold' }}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View className="bg-primary-80 px-4 py-14 justify-end h-56 rounded-b-[40px]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-5 left-5 z-10">
          <Ionicons name="arrow-back" color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-white mb-1 text-2xl">Book a Table</Text>
        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white">Find and reserve tables at nearby restaurants</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={error ? <Text className="text-red-600 text-center mb-4">{error}</Text> : null}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <Shop
            id={item.id}
            name={item.restaurant_name}
            description={item.about_business || 'No description available'}
            images={item.restaurant_images || []}
            address={item.address || 'No address provided'}
            phone={item.phone || 'No phone provided'}
            rating={item.average_rating || 0}
            // categories={item.shop_category || []}
            isOpen={item.is_open !== false}
            featuredItems={(item.featured_items || []).map(ft => ({
              id: ft.id,
              name: ft.name,
              price: ft.price,
              image: ft.image,
            }))}
            maxImages={5}
            item={item}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default BookATableScreen;
