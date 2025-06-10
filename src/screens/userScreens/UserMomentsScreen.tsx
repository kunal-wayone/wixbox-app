import React, {useState} from 'react';
import {View, Text, Image, Button, TouchableOpacity} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../../constants/ImagePath';

const UserMomentsScreen = () => {
  const [selectedStore, setSelectedStore] = useState<any>({
    id: 1,
    name: 'Store A',
    description: 'A great place to shop.',
    latitude: 37.78825,
    longitude: -122.4324,
    rating: 4.5,
    location: 'San Francisco, CA',
    image: ImagePath.restaurant1,
  });

  const dummyStores = [
    {
      id: 1,
      name: 'Store A',
      description: 'A great place to shop.',
      latitude: 37.78825,
      longitude: -122.4324,
      rating: 4.5,
      location: 'San Francisco, CA',
      image: ImagePath.restaurant1,
    },
    {
      id: 2,
      name: 'Store B',
      description: 'Best deals in town.',
      latitude: 37.78925,
      longitude: -122.4314,
      rating: 4.0,
      location: 'Market Street, SF',
      image: ImagePath.restaurant2,
    },
    {
      id: 3,
      name: 'Store C',
      description: 'Quality goods guaranteed.',
      latitude: 37.79025,
      longitude: -122.4304,
      rating: 4.8,
      location: 'Downtown SF',
      image: ImagePath.restaurant1,
    },
  ];

  return (
    <View style={{flex: 1}}>
      <MapView
        style={{flex: 1}}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        {dummyStores.map(store => (
          <Marker
            key={store.id}
            coordinate={{latitude: store.latitude, longitude: store.longitude}}
            title={store.name}
            onPress={() => setSelectedStore(store)}
          />
        ))}
      </MapView>

      {selectedStore && (
        <View className="rounded-xl absolute bottom-5 left-5 bg-white  w-11/12 mx-auto p-5">
          <View className="flex-row items-center gap-4 mb-4">
            <Image
              source={selectedStore.image}
              className="w-20 h-20"
              resizeMode="contain"
            />
            <View>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                {selectedStore.name}
              </Text>
              <Text className="mb-1">{selectedStore.description}</Text>
              <View className="flex-row items-center gap-4 ">
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <FontAwesome name="star" size={16} color="gold" />
                  <Text style={{marginLeft: 5}}>{selectedStore.rating}</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name="location-sharp" size={16} color="gray" />
                  <Text style={{marginLeft: 5}}>{selectedStore.location}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity className="bg-primary-80 p-3 rounded-xl">
            <Text className="text-center text-white font-poppins font-bold">
              Tap to visit
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default UserMomentsScreen;
