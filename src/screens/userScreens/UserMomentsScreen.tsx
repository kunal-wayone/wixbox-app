import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Linking,
  Dimensions,
  Animated,
  ToastAndroid,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { getCurrentLocationWithAddress } from '../../utils/tools/locationServices';
import { RootState } from '../../store/store';
import { ImagePath } from '../../constants/ImagePath';

// Type Definitions
interface Location {
  latitude: number;
  longitude: number;
  heading?: number;
  address?: string;
  country?: string;
}

interface Store {
  restaurant_name: string;
  about_business: string;
  latitude: number;
  longitude: number;
  restaurant_images: string;
  average_rating?: number;
  distance_km?: number;
  travel_time_mins?: number;
}

interface NavigationProp {
  navigate: (screen: string, params?: any) => void;
}

const { width, height } = Dimensions.get('screen');

const NEW_DELHI_REGION: Region = {
  latitude: 28.6139,
  longitude: 77.2090,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const UserMomentsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const mapRef = useRef<MapView>(null);
  const [liveLocation, setLiveLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [restaurantData, setRestaurantData] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [minRating, setMinRating] = useState<number>(3.0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [favoriteLocation, setFavoriteLocation] = useState<Location | null>(null);
  const markerScale = useRef(new Animated.Value(1)).current;

  const { status: userStatus, data: user } = useSelector((state: RootState) => state.user);

  const getDefaultRegion = (): Region => {
    if (liveLocation && liveLocation.latitude && liveLocation.longitude) {
      return {
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return NEW_DELHI_REGION;
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        ToastAndroid.show('Failed to request location permission', ToastAndroid.SHORT);
        return false;
      }
    }
    return true;
  };

  const getLiveLocation = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const granted = await requestLocationPermission();
      if (granted) {
        await getCurrentLocationWithAddress((location: Location) => {
          setLiveLocation({
            ...location,
            country: location.country || 'unknown',
          });
          if (location.country?.toLowerCase().includes('india') && mapRef.current) {
            mapRef.current.animateToRegion(NEW_DELHI_REGION, 1000);
          }
        }, dispatch, user);
      } else {
        ToastAndroid.show('Location permission denied', ToastAndroid.SHORT);
        setLiveLocation(null);
      }
    } catch (error) {
      ToastAndroid.show('Error getting location', ToastAndroid.SHORT);
      console.error('Error getting location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStores = async (pageNumber: number) => {
    try {
      const res: any = await Fetch(`/user/shops-nearby?per_page=5&page=${pageNumber}&radius=${searchRadius}`);
      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch shops');
      }
      setRestaurantData(res?.data?.nearby_shops || []);
    } catch (error) {
      ToastAndroid.show('Failed to fetch nearby stores', ToastAndroid.SHORT);
      console.error('Error fetching stores:', error);
    }
  };

  const openGoogleMapsDirections = (store: Store) => {
    if (!liveLocation || !store?.latitude || !store?.longitude) return;

    const origin = `${liveLocation.latitude},${liveLocation.longitude}`;
    const destination = `${store.latitude},${store.longitude}`;
    const url: any = Platform.select({
      ios: `https://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`,
      android: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
    });

    Linking.openURL(url).catch((err) => {
      ToastAndroid.show('Error opening Google Maps', ToastAndroid.SHORT);
      console.error('Error opening Google Maps:', err);
    });
  };

  const centerToUserLocation = () => {
    if (liveLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const saveFavoriteLocation = () => {
    if (liveLocation) {
      setFavoriteLocation(liveLocation);
      ToastAndroid.show('Location saved as favorite!', ToastAndroid.SHORT);
    }
  };

  const toggleMapType = () => {
    setMapType((prev) => {
      if (prev === 'standard') return 'satellite';
      if (prev === 'satellite') return 'hybrid';
      return 'standard';
    });
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera: any) => {
        mapRef.current?.animateCamera({ zoom: camera.zoom + 1 }, { duration: 300 });
      });
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera: any) => {
        mapRef.current?.animateCamera({ zoom: camera.zoom - 1 }, { duration: 300 });
      });
    }
  };

  const animateMarker = useCallback(() => {
    Animated.sequence([
      Animated.timing(markerScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(markerScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [markerScale]);

  useEffect(() => {
    if (isFocused) {
      getLiveLocation();
      fetchStores(1);
    }
  }, [isFocused, searchRadius, minRating]);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        if (position?.coords?.latitude && position?.coords?.longitude) {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading || 0,
            address: liveLocation?.address || 'Unknown',
            country: liveLocation?.country || 'unknown',
          };
          setLiveLocation(newLocation);
          animateMarker();
          if (!liveLocation && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: newLocation.latitude,
              longitude: newLocation.longitude,
              latitudeDelta: 0.0001,
              longitudeDelta: 0.0001,
            }, 1000);
          }
        }
      },
      (error) => {
        ToastAndroid.show('Error watching location', ToastAndroid.SHORT);
        console.log('Watch error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 2000,
        fastestInterval: 1000,
      }
    );

    return () => Geolocation.clearWatch(watchId);
  }, [animateMarker, liveLocation?.address, liveLocation?.country]);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#B68AD4" size="large" />
        </View>
      )}
      {/* {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )} */}
      {liveLocation?.address && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>{liveLocation.address.city + ", " + liveLocation.address.state + " (" + liveLocation.address?.pincode + ")"}</Text>
        </View>
      )}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getDefaultRegion()}
        mapType={mapType}
        showsUserLocation={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {liveLocation && (
          <Marker
            coordinate={{
              latitude: liveLocation.latitude,
              longitude: liveLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={liveLocation.heading || 0}
            flat
            tracksViewChanges={false}
          >
            <Animated.View style={[styles.userMarker, { transform: [{ scale: markerScale }] }]}>
              <Ionicons name="navigate" size={30} color="#B68AD4" />
            </Animated.View>
          </Marker>
        )}

        {restaurantData?.length > 0 &&
          restaurantData.map((store, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: Number(store?.latitude) || 0,
                longitude: Number(store?.longitude) || 0,
              }}
              title={store?.restaurant_name}
              description={store?.about_business}
              onPress={() => setSelectedStore(store)}
              image={ImagePath.home3}
            />
          ))}
      </MapView>

      {/* Floating Buttons */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={centerToUserLocation}>
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={getLiveLocation}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity className='hidden' style={styles.floatingButton} onPress={saveFavoriteLocation}>
          <Ionicons name="heart" size={24} color={favoriteLocation ? '#FF4D4F' : '#fff'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={toggleMapType}>
          <Ionicons
            name={mapType === 'standard' ? 'map' : mapType === 'satellite' ? 'globe' : 'layers'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={zoomIn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={zoomOut}>
          <Ionicons name="remove" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Controls */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Radius (km):</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setSearchRadius((prev) => Math.min(prev + 1, 20))}
          >
            <Text style={styles.filterButtonText}>+1</Text>
          </TouchableOpacity>
          <Text style={styles.filterValue}>{searchRadius}</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setSearchRadius((prev) => Math.max(prev - 1, 1))}
          >
            <Text style={styles.filterButtonText}>-1</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Min Rating:</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setMinRating((prev) => Math.min(prev + 0.5, 5))}
          >
            <Text style={styles.filterButtonText}>+0.5</Text>
          </TouchableOpacity>
          <Text style={styles.filterValue}>{minRating.toFixed(1)}</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setMinRating((prev) => Math.max(prev - 0.5, 0))}
          >
            <Text style={styles.filterButtonText}>-0.5</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedStore && (
        <View style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => setSelectedStore(null)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} />
          </TouchableOpacity>

          <View style={styles.cardContent}>
            <Image
              source={selectedStore?.restaurant_images.length > 0 ? { uri: IMAGE_URL + selectedStore?.restaurant_images[0] } : ImagePath.restaurant1}
              style={styles.storeImage}
              resizeMode="cover"
            // defaultSource={ImagePath.restaurant1}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{selectedStore?.restaurant_name}</Text>
              <Text style={{ marginBottom: 4 }}>{selectedStore?.about_business}</Text>
              <View style={styles.ratingLocationRow}>
                <View style={styles.inlineRow}>
                  <FontAwesome name="star" size={16} color="gold" />
                  <Text style={{ marginLeft: 5 }}>{selectedStore?.average_rating || 'N/A'}</Text>
                </View>
                <View style={styles.inlineRow}>
                  <Ionicons name="location-sharp" size={16} color="gray" />
                  <Text style={{ marginLeft: 5 }}>{selectedStore.distance_km || '0'} Km</Text>
                </View>
                <View style={styles.inlineRow}>
                  <Ionicons name="timer-outline" size={16} color="gray" />
                  <Text style={{ marginLeft: 5 }}>{selectedStore.travel_time_mins || '0'} min</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.visitButton, { backgroundColor: '#B68AD4' }]}
              onPress={() => navigation.navigate('ShopDetailsScreen', { shop_info: selectedStore })}
            >
              <Ionicons name="storefront" color="#fff" size={15} />
              <Text style={styles.visitText}>Tap to view</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visitButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => openGoogleMapsDirections(selectedStore)}
            >
              <Entypo name="direction" size={18} color="#fff" />
              <Text style={styles.visitText}>Get Direction</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default UserMomentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  errorContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: '#FF4D4F',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addressContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  addressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  userMarker: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 30,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 6,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  visitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  visitText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  floatingButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'flex-end',
    gap: 10,
  },
  floatingButton: {
    backgroundColor: '#B68AD4',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  filterContainer: {
    display: "none",
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    elevation: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterButton: {
    backgroundColor: '#B68AD4',
    borderRadius: 6,
    padding: 6,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterValue: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
});