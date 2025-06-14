import React from 'react';
import {
  View,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {IMAGE_URL} from '../../utils/apiUtils';

const {width} = Dimensions.get('window');

interface ImageSliderProps {
  images: ImageSourcePropType[];
  onBookmarkPress: () => void;
}

const ImageSliderWithBookmark: React.FC<ImageSliderProps> = ({
  images,
  onBookmarkPress,
}) => {
  return (
    <View className="items-center mt-4">
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}: any) => (
          <View className="relative">
            <Image
              source={{uri: `${IMAGE_URL}${item?.url}`}}
              className="w-[96vw] h-64 rounded-xl mx-2"
              resizeMode="cover"
            />

            {/* Bookmark Button */}
            <TouchableOpacity
              onPress={onBookmarkPress}
              className="absolute top-3 right-5 bg-primary-90 p-2 rounded-full">
              <Ionicons name="bookmark" color="white" size={20} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default ImageSliderWithBookmark;
