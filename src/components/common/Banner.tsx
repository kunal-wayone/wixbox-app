import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { ImagePath } from '../../constants/ImagePath';

const { width } = Dimensions.get('window');

const Banner = ({
  showOverlay = true,
  overlayOpacity = 0.5,
  showNavigation = false,
  navigationRoute,
  buttonText = 'Explore',
  position = "top"
}: any) => {
  const navigation = useNavigation<any>();
  const [bannerData, setBannerData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBanner = async () => {
    try {
      const response: any = await Fetch(`/user/getsbanners?position=${position}`, {}, 5000);
      if (!response.success) {
        console.log("Failed to fetch banners");
      }
      setBannerData(response?.data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const renderBannerItem = (item: any, index: number) => (
    <View key={index} className="w-full rounded-2xl overflow-hidden border border-gray-200">
      <ImageBackground
        source={item?.icon ? { uri: IMAGE_URL + item.icon } : ImagePath.banner}
        className="w-full h-56 relative"
        resizeMode="cover"
      >
        {showOverlay && <View className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />}
        <View className="flex-1 justify-center p-6">
          {item.subtitle && (
            <Text className="text-white text-sm font-semibold uppercase mb-1">{item.subtitle}</Text>
          )}
          {item.title && (
            <Text className="text-white text-2xl font-bold mb-2">{item.title}</Text>
          )}
          {item.description && (
            <Text className="text-white text-base mb-2">{item.description}</Text>
          )}
          {item.subDescription && (
            <Text className="text-gray-300 text-sm">{item.subDescription}</Text>
          )}
          {showNavigation && navigationRoute && (
            <TouchableOpacity
              className="mt-4 bg-blue-600 px-4 py-2 rounded-lg w-32"
              onPress={() => navigation.navigate(navigationRoute)}
            >
              <Text className="text-white text-center font-semibold">{buttonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </View>
  );

  if (loading) {
    return (
      <View className="w-full h-52 bg-gray-200 rounded-2xl mb-4 overflow-hidden animate-pulse">
        <View className="flex-1 justify-center p-6">
          <View className="bg-gray-300 h-4 w-24 mb-2 rounded" />
          <View className="bg-gray-300 h-6 w-40 mb-2 rounded" />
          <View className="bg-gray-300 h-4 w-64 mb-2 rounded" />
          <View className="bg-gray-300 h-3 w-48 rounded" />
        </View>
      </View>
    );
  }

  if (!bannerData || bannerData.length === 0) return null;

  return bannerData.length === 1 ? (
    renderBannerItem(bannerData[0], 0)
  ) : (
    <View className="w-full h-56 mb-2">
      <Swiper
        autoplay
        loop
        showsPagination
        dotStyle={{ backgroundColor: '#ccc' }}
        activeDotStyle={{ backgroundColor: '#B68AD4' }}
        containerStyle={{ borderRadius: 16 }}
      >
        {bannerData.map(renderBannerItem)}
      </Swiper>
    </View>
  );
};

export default Banner;
