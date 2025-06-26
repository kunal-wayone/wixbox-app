import React, { useState } from 'react';
import { View, Text, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';
import Icon from 'react-native-vector-icons/Ionicons';

const UserMomentsScreen = () => {
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const dummyStores = [
    {
      id: 5,
      name: 'North Point',
      description: 'North of Moti Nagar',
      latitude: 28.7418,
      longitude: 77.1296,
      rating: 4.3,
      location: 'North Delhi',
      image: ImagePath.restaurant1,
    },
    {
      id: 6,
      name: 'East Market',
      description: 'East side location',
      latitude: 28.6517,
      longitude: 77.2318,
      rating: 4.4,
      location: 'East Delhi',
      image: ImagePath.restaurant2,
    },
    {
      id: 4,
      name: 'Delhi Store',
      description: 'Located in Moti Nagar.',
      latitude: 28.651717,
      longitude: 77.129586,
      rating: 4.6,
      location: 'Moti Nagar, New Delhi',
      image: ImagePath.restaurant2,
    },
  ];


  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
        style={styles.map}
        region={{
          latitude: 28.651717,
          longitude: 77.129586,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        {dummyStores.map(store => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.latitude, longitude: store.longitude }}
            title={store.name}
            description={store.description}
            onPress={() => setSelectedStore(store)}
          />
        ))}
      </MapView>

      {selectedStore && (
        <View className="rounded-xl absolute bottom-5 left-5 bg-white  w-11/12 mx-auto p-5">
          <TouchableOpacity onPress={() => setSelectedStore(null)}  className='absolute h-7 w-7 right-1 top-1' >
            <Icon name='close' size={20}/>
          </TouchableOpacity>
          <View className="flex-row items-center gap-4 mb-4">
            <Image
              source={selectedStore.image}
              className="w-20 h-20"
              resizeMode="cover"
            />
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                {selectedStore.name}
              </Text>
              <Text className="mb-1">{selectedStore.description}</Text>
              <View className="flex-row items-center gap-4 ">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome name="star" size={16} color="gold" />
                  <Text style={{ marginLeft: 5 }}>{selectedStore.rating}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-sharp" size={16} color="gray" />
                  <Text style={{ marginLeft: 5 }}>{selectedStore.location}</Text>
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


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});