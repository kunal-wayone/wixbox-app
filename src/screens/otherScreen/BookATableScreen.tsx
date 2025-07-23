import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { ImagePath } from '../../constants/ImagePath';
import Shop2 from '../../components/common/Shop2';
import { SafeAreaView } from 'react-native-safe-area-context';


// Default image for restaurants
const DEFAULT_IMAGE = ImagePath.restaurant1;

const { width } = Dimensions.get('window');

// Skeleton Card Component
const SkeletonCard = () => (
  <View className="flex-row gap-4 bg-gray-100 rounded-xl p-6 mb-4 animate-pulse">
    <View className="w-24 h-32 bg-gray-200 rounded-xl" />
    <View className="flex-1">
      <View className="w-3/4 h-6 bg-gray-200 rounded mb-2" />
      <View className="w-1/2 h-4 bg-gray-200 rounded mb-2" />
      <View className="w-1/3 h-4 bg-gray-200 rounded mb-2" />
      <View className="w-1/2 h-8 bg-gray-200 rounded" />
    </View>
  </View>
);

const BookATableScreen = () => {
  const navigation = useNavigation<any>();
  const PER_PAGE = 5;
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalTableReserveVisible, setIsModalTableReserveVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectTable, setSelectedTable] = useState<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground');



  // Fetch nearby shops
  const fetchStores = useCallback(
    async (pageNumber: number, isInitial = false, isRefresh = false) => {
      if ((loadMoreLoading && !isInitial && !isRefresh) || (!hasMore && !isInitial && !isRefresh)) {
        return;
      }

      try {
        if (isInitial || isRefresh) setInitialLoading(true);
        else setLoadMoreLoading(true);

        setError(null);
        const queryParams = `/user/shops-nearby?per_page=${PER_PAGE}&page=${pageNumber}`;
        const response: any = await Fetch(queryParams, {}, 5000);

        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch shops');
        }

        const newShops = response.data?.nearby_shops?.map((item: any) => ({
          ...item,
          restaurant_images:
            item.restaurant_images?.length > 0 && item.restaurant_images[0]?.trim() !== ''
              ? `${IMAGE_URL}${item.restaurant_images[0]}`
              : DEFAULT_IMAGE,
        })) || [];

        setData((prev) => {
          if (isInitial || isRefresh) return newShops;
          const existingIds = new Set(prev.map((shop) => shop.id));
          const uniqueNewShops = newShops.filter((shop: any) => !existingIds.has(shop.id));
          return [...prev, ...uniqueNewShops];
        });

        setHasMore(response.data.pagination?.last_page > pageNumber);
        setPage(pageNumber);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch shops');
        ToastAndroid.show(error.message || 'Failed to fetch shops', ToastAndroid.SHORT);
      } finally {
        if (isInitial || isRefresh) setInitialLoading(false);
        else setLoadMoreLoading(false);
      }
    },
    [loadMoreLoading, hasMore]
  );

  // Initial fetch
  useEffect(() => {
    fetchStores(1, true);
  }, [fetchStores]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchStores(1, true, true);
    setRefreshing(false);
  }, [fetchStores]);

  // Get unique floors
  const getUniqueFloors = (tables: any[] = []) => {
    const seen = new Set();
    return tables.filter((item) => {
      if (seen.has(item.floor)) return false;
      seen.add(item.floor);
      return true;
    }).map((item) => ({ floor: item.floor }));
  };

  // Handle image load error
  const handleImageError = (shopId: number) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === shopId ? { ...item, restaurant_images: DEFAULT_IMAGE } : item
      )
    );
  };

  // Render table item
  const renderTableItem = ({ item }: { item: any }) => {
    const seats = parseInt(item.seats) || 2;
    let tableWidth = seats <= 8 ? 75 : 155;
    let tableHeight = 80;
    let borderRadius = seats <= 8 ? 12 : 16;

    const getSeatDistribution = (count: number) => {
      return count <= 8
        ? [
          { side: 'top', count: 1 },
          { side: 'right', count: 1 },
          { side: 'bottom', count: 1 },
          { side: 'left', count: 1 },
        ]
        : [
          { side: 'top', count: 3 },
          { side: 'right', count: 1 },
          { side: 'bottom', count: 3 },
          { side: 'left', count: 1 },
        ];
    };

    const seatDistribution = getSeatDistribution(seats);
    const seatSize = 28;
    const seatThickness = 6;

    const getLineColor = () => {
      if (item.is_booked === '1') return 'lightgray';
      return selectTable?.table_number === item?.table_number && selectTable?.floor === item?.floor
        ? '#00C01A80'
        : item.premium === 1
          ? '#B68AD480'
          : '#00C01A80';
    };

    const renderChairLines = (side: string, count: number) => {
      if (count === 0) return null;

      const lines = [];
      const color = getLineColor();
      const isHorizontal = side === 'top' || side === 'bottom';
      const spacing = isHorizontal ? tableWidth : tableHeight;

      for (let i = 0; i < count; i++) {
        const gap = spacing / (count + 1);
        const center = gap * (i + 1);

        let style: any = {
          position: 'absolute',
          backgroundColor: color,
          borderRadius: 6,
        };

        if (isHorizontal) {
          style.width = seatSize;
          style.height = seatThickness;
          style.left = center - seatSize / 2;
          style[side] = 1;
        } else {
          style.width = seatThickness;
          style.height = seatSize;
          style.top = center - seatSize / 2;
          style[side] = -1;
        }

        lines.push(<View key={`${side}-seat-${i}`} style={style} />);
      }

      return lines;
    };

    return (
      <TouchableOpacity
        className={`flex-1 m-2 items-center justify-center ${seats > 8 ? 'col-span-2' : ''}`}
        disabled={item.is_booked === '1'}
        onPress={() => {
          if (item.is_booked !== '1') {
            setSelectedTable(item);
          } else {
            ToastAndroid.show('This table is already booked.', ToastAndroid.SHORT);
          }
        }}
      >
        <View
          style={{
            width: tableWidth,
            height: tableHeight,
            borderRadius,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            className={`w-10/12 h-16 rounded-xl flex-col justify-center items-center ${selectTable?.table_number === item?.table_number && selectTable?.floor === item?.floor
              ? 'bg-green-500'
              : item.premium === 1
                ? 'border rounded-xl border-primary-40'
                : item.is_booked === '1'
                  ? 'bg-gray-100'
                  : 'border rounded-xl border-green-300'
              }`}
          >
            <Text
              className={`text-black text-xs font-semibold ${item.is_booked === '1'
                ? 'text-gray-400'
                : selectTable?.table_number === item?.table_number && selectTable?.floor === item?.floor
                  ? 'text-white'
                  : ''
                }`}
            >
              {item.table_number} ({item.seats})
            </Text>
            <Text
              className={`text-black text-xs font-semibold ${item.is_booked === '1'
                ? 'text-gray-400'
                : selectTable?.table_number === item?.table_number && selectTable?.floor === item?.floor
                  ? 'text-white'
                  : ''
                }`}
            >
              ₹ {item.price}/-
            </Text>
          </View>
          {seatDistribution.map(({ side, count }) => renderChairLines(side, count))}
        </View>
      </TouchableOpacity>
    );
  };

  // Render floor tab
  const renderFloorTab = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.floor}
      className={`py-2 px-4 mr-2 mb-8 h-10 rounded-lg ${selectedFloor === item.floor ? 'bg-primary-80' : 'bg-gray-200'
        }`}
      onPress={() => setSelectedFloor(item.floor)}
    >
      <Text
        className={`font-poppins-regular ${selectedFloor === item.floor ? 'text-white' : 'text-black'}`}
      >
        {item.floor}
      </Text>
    </TouchableOpacity>
  );

  // Render footer with Load More button
  const renderFooter = useCallback(() => {
    if (loadMoreLoading) {
      return (
        <View className="py-4">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    if (hasMore) {
      return (
        <View className="pb-20">
          <TouchableOpacity
            className="bg-primary-80 rounded-xl p-4 w-11/12 mx-auto my-4"
            onPress={() => fetchStores(page, true)}
          >
            <Text className="text-center text-white font-poppins font-semibold">Load More</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [loadMoreLoading, hasMore, page, fetchStores]);

  // Main render
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View className="flex-1 bg-white">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-5 left-5 z-10"
        >
          <Ionicons name="arrow-back" color="#fff" size={24} />
        </TouchableOpacity>

        <Image
          source={ImagePath?.bell}
          className="w-44 h-44 absolute top-[-10%] left-[-10%] z-[1] rounded-xl"
          resizeMode="contain"
          tintColor={'#FFFFFF33'}
        />

        {/* Header Background */}
        <View className="bg-primary-80 px-4 py-14 justify-end h-56 rounded-b-[40px]">
          <Text className="text-white mb-1 font-poppins-bold text-2xl">Book a Table</Text>
          <Text className="text-white font-poppins-regular">
            Find and reserve tables at nearby restaurants
          </Text>
          <Image
            source={ImagePath.bell}
            className="w-24 h-24 absolute right-5 bottom-5"
            resizeMode="contain"
            tintColor={'white'}
          />
        </View>



        {/* Content */}
        {initialLoading ? (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <SkeletonCard key={index} />
              ))}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {error && <Text className="text-red-600 mb-4 text-center">{error}</Text>}
            {data.map((shop) => (
              <Shop2 item={shop} />
            ))}
            {renderFooter()}
          </ScrollView>
        )}

        {/* Modal for Table Layout */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setIsModalVisible(false)}
          style={{ justifyContent: 'flex-end', margin: 0 }}
        >
          <View
            className="bg-white rounded-t-3xl pt-6 pb-4"
            style={{ width, height: '75%', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          >
            <View className="absolute top-2 self-center w-12 h-1 bg-gray-400 rounded-full" />
            <Text className="text-lg font-bold mb-3 px-4">Select a Table</Text>
            <FlatList
              data={getUniqueFloors(selectedRestaurant?.tables)}
              horizontal
              keyExtractor={(item) => item.floor}
              renderItem={renderFloorTab}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              style={{ marginBottom: 16 }}
            />
            <FlatList
              data={selectedRestaurant?.tables?.filter((t: any) => t.floor === selectedFloor)}
              renderItem={renderTableItem}
              keyExtractor={(item) => `${item.floor}-${item.table_number}`}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            />
            <TouchableOpacity
              className="bg-primary-80 rounded-xl p-4 w-11/12 mx-auto"
              onPress={() => {
                if (!selectTable) {
                  ToastAndroid.show('Please select a table.', ToastAndroid.SHORT);
                  return;
                }
                setIsModalVisible(false);
                setIsModalTableReserveVisible(true);
              }}
            >
              <Text className="text-center text-white font-poppins font-semibold">
                Reserve a Table
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal for Reservation Info */}
        <Modal
          isVisible={isModalTableReserveVisible}
          onBackdropPress={() => setIsModalTableReserveVisible(false)}
          style={{ justifyContent: 'center' }}
        >
          <View
            className="bg-white rounded-t-3xl pt-6 pb-4"
            style={{ height: '80%', borderRadius: 20 }}
          >
            <TouchableOpacity
              onPress={() => setIsModalTableReserveVisible(false)}
              className="absolute top-1 right-2 z-50"
            >
              <Ionicons name="close" size={30} />
            </TouchableOpacity>
            <Image
              source={{ uri: selectedRestaurant?.restaurant_images || DEFAULT_IMAGE }}
              className="w-11/12 h-56 rounded-xl mb-2 mx-auto"
              resizeMode="cover"
              onError={() => handleImageError(selectedRestaurant?.id)}
            />
            <Text className="text-lg text-center font-bold mb-1 px-4">
              {selectedRestaurant?.restaurant_name || 'Restaurant'}
            </Text>
            <Text className="text-center mb-4">Restaurant & Café</Text>
            <Text className="py-2 mx-4 border-b border-gray-400 border-dashed">
              Price Breakdown
            </Text>
            <View className="flex-row justify-between mx-4 my-2">
              <View className="flex-1 mr-2">
                <Text className="text-base mb-1">Floor:</Text>
                <Text className="text-base mb-1">Table Number:</Text>
                <Text className="text-base mb-1">Table Type:</Text>
                <Text className="text-base mb-1">Seats:</Text>
                <Text className="text-base mb-1">Price:</Text>
              </View>
              <View className="flex-1 ml-2 items-end">
                <Text className="text-base mb-1">{selectTable?.floor || 'N/A'}</Text>
                <Text className="text-base mb-1">{selectTable?.table_number || 'N/A'}</Text>
                <Text className="text-base mb-1">
                  {selectTable?.premium === '0' ? 'Not Premium' : 'Premium'}
                </Text>
                <Text className="text-base mb-1">{selectTable?.seats || 'N/A'}</Text>
                <Text className="text-base mb-1">₹ {selectTable?.price || 0}/-</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('TableBookingFormScreen', {
                  shop_id: selectedRestaurant?.id,
                  table_info: [selectTable],
                })
              }
              className="bg-primary-80 rounded-xl p-4 w-11/12 mx-auto mt-5"
            >
              <Text className="text-center text-white font-poppins font-semibold">
                Pay ₹ {selectTable?.price || 0}/- & Reserve Now
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default BookATableScreen;