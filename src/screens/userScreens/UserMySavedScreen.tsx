import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {ImagePath} from '../../constants/ImagePath';

const pinnedStores = [
  {
    id: '1',
    name: 'Cafe Aroma',
    description: 'Cozy cafe with great coffee',
    rating: 4.5,
    location: 'Main Street',
    image: ImagePath.restaurant1,
  },
  {
    id: '2',
    name: 'Pizza Palace',
    description: 'Delicious Italian pizzas',
    rating: 4.7,
    location: 'Downtown',
    image: ImagePath.restaurant2,
  },
];

const suggestedStores = [
  {
    id: '3',
    name: 'Sushi House',
    description: 'Fresh and tasty sushi',
    rating: 4.6,
    location: 'Market Lane',
    image: ImagePath.restaurant1,
  },
  {
    id: '4',
    name: 'Sushi House',
    description: 'Fresh and tasty sushi',
    rating: 4.6,
    location: 'Market Lane',
    image: ImagePath.restaurant1,
  },
  {
    id: '5',
    name: 'Sushi House',
    description: 'Fresh and tasty sushi',
    rating: 4.6,
    location: 'Market Lane',
    image: ImagePath.restaurant1,
  },
];

const MySavedScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'pinned' | 'saved'>('pinned');

  const renderStoreCard = (store: any, showActions = false) => (
    <View
      key={store.id}
      className="rounded-xl bg-primary-10 w-11/12 mx-auto p-5 mb-4 shadow">
      <View className="flex-row items-center gap-4 mb-4">
        <Image
          source={store.image}
          className="w-20 h-20"
          resizeMode="stretch"
        />
        <View className="flex-1">
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>{store.name}</Text>
          <Text className="mb-1">{store.description}</Text>
          <View className="flex-row items-center gap-4">
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <FontAwesome name="star" size={16} color="gold" />
              <Text style={{marginLeft: 5}}>{store.rating}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="location-sharp" size={16} color="gray" />
              <Text style={{marginLeft: 5}}>{store.location}</Text>
            </View>
          </View>
        </View>
      </View>

      {showActions && (
        <View className="flex-row justify-between">
          <TouchableOpacity className="border border-primary-100 p-3 rounded-xl flex-1 mr-2">
            <Text className="text-center font-bold">Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-primary-80 p-3 rounded-xl flex-1 ml-2">
            <Text className="text-center text-white font-bold">Visit Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white pt-6">
      {/* Tabs */}
      <View className="flex-row justify-center gap-4 mb-6 px-4">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl ${
            selectedTab === 'pinned' ? 'bg-primary-80' : 'bg-gray-200'
          }`}
          onPress={() => setSelectedTab('pinned')}>
          <Text
            className={`text-center font-bold ${
              selectedTab === 'pinned' ? 'text-white' : 'text-gray-800'
            }`}>
            Pinned Places
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl ${
            selectedTab === 'saved' ? 'bg-primary-80' : 'bg-gray-200'
          }`}
          onPress={() => setSelectedTab('saved')}>
          <Text
            className={`text-center font-bold ${
              selectedTab === 'saved' ? 'text-white' : 'text-gray-800'
            }`}>
            Saved Products
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <Text className="text-lg font-bold px-6 mb-4">
        {selectedTab === 'pinned' ? 'Pinned spots to visit' : 'Saved places'}
      </Text>

      {/* Card List */}
      {(selectedTab === 'pinned' ? pinnedStores : []).map(store =>
        renderStoreCard(store, true),
      )}

      {/* Suggested Section */}
      {selectedTab === 'pinned' && (
        <>
          <Text className="text-lg font-bold px-6 mb-4 mt-6">
            Suggested for you
          </Text>
          {suggestedStores.map(store => renderStoreCard(store, false))}
        </>
      )}
    </ScrollView>
  );
};

export default MySavedScreen;
