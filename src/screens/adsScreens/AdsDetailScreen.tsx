import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Ads {
  id: number;
  product_name: string;
  offer_tag: string;
  promotion_tag: string;
  offer_starts_at: string;
  offer_ends_at: string;
  original_price: string;
  discounted_price: string;
  caption: string;
  status: string;
  images: string[];
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    shopcreated: boolean;
  };
}

const AdsDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { adsId } = route.params;

  const [ads, setAds] = useState<Ads | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response: any = await Fetch(`/user/ads/${adsId}`, undefined, 5000);
      if (!response.success) throw new Error(response.message);
      setAds(response.data);
    } catch (error: any) {
      ToastAndroid.show(error?.message || 'Failed to load ads', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adsId) fetchAds();
  }, [adsId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(slide);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!ads) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{
          color: '#888', fontFamily: 'Raleway-Regular',
        }}>Ads not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
          <TouchableOpacity style={{ position: 'absolute', left: 10 }} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{
            fontFamily: 'Raleway-Regular',
            fontSize: 18, fontWeight: '600', textAlign: 'center', width: '100%'
          }}>Ads Details</Text>
        </View>

        {/* Image Slider */}
        <View style={{ width, height: 250 }}>
          <FlatList
            data={ads.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            ref={flatListRef}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: IMAGE_URL + item }}
                style={{ width, height: 250, resizeMode: 'cover' }}
              />
            )}
          />
          {/* Pagination Dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 10, width: '100%' }}>
            {ads.images.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: activeIndex === index ? '#007AFF' : '#ccc',
                }}
              />
            ))}
          </View>
          {ads.promotion_tag && (
            <Text className='absolute bottom-4 left-2 bg-primary-90 py-2.5 px-4 flex items-center' style={{ fontFamily: 'Raleway-Regular', marginTop: 8, color: '#fff', borderRadius: 8, alignSelf: 'flex-start' }}>
              {ads.promotion_tag}
            </Text>
          )}

        </View>

        {/* Ad Content */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 20, fontWeight: '700', color: '#333' }}>{ads.product_name}</Text>
          </View>


          <View className={`flex-row items-center justify-between`} style={{ flexDirection: 'row', marginTop: 12, gap: 20 }}>
            <Text style={{ fontFamily: 'Raleway-Regular', color: '#666', fontSize: 13 }}>{formatDate(ads.created_at)}</Text>
            <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 14 }} className={`${ads.status === '1' ? 'text-green-600' : 'text-red-500'}`}>•{ads.status === '1' ? 'Active' : 'Inactive'}</Text>
          </View>

          <View className='flex-row items-center gap-1 mt-2 border-b border-gray-300 pb-2'>
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className=' text-lg'>₹{ads.discounted_price}/-</Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className='text-xs line-through '> ₹{ads.original_price}/-</Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} style={{ fontSize: 14, }} className='text-orange-500 ml-2'> • {ads.offer_tag}</Text>
          </View>

          <Text style={{ marginTop: 6, fontFamily: 'Raleway-SemiBold', }}>
            Offer Duration:
          </Text>
          <Text style={{ fontFamily: 'Raleway-Regular' }} className='text-grey-600 mt-1'>
            {formatDate(ads.offer_starts_at)} - {formatDate(ads.offer_ends_at)}
          </Text>
          <Text style={{ fontFamily: 'Raleway-Regular', marginTop: 12, color: '#333', fontSize: 15 }}>{ads.caption || 'No description provided.'}</Text>
        </View>
      </ScrollView >
    </SafeAreaView>
  );
};

export default AdsDetailScreen;
