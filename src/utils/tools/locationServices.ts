import Geolocation from '@react-native-community/geolocation';
import {
    PermissionsAndroid,
    Platform,
    Alert,
    Linking,
} from 'react-native';
import {
    request,
    PERMISSIONS,
    RESULTS,
} from 'react-native-permissions';
import Geocoder from 'react-native-geocoding';
import { MAPS_API_KEY } from "@env";
import { updateUserLocation } from '../../store/slices/userSlice';


// Initialize Geocoder
Geocoder.init(MAPS_API_KEY);

async function requestLocationPermission() {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Precious Permission Required',
                message: 'We need your precise location to continue.',
                buttonPositive: 'OK',
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
    }
}

function checkIfLocationEnabled() {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            () => resolve(true),
            (error) => {
                if (error.code === 2) resolve(false);
                else reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 10000,
            }
        );
    });
}

function promptEnableLocationServices() {
    Alert.alert(
        'Location Services Disabled',
        'Please enable GPS/location from settings to continue.',
        [
            {
                text: 'Go to Settings',
                onPress: () => {
                    Platform.OS === 'ios'
                        ? Linking.openURL('App-Prefs:Privacy&path=LOCATION')
                        : Linking.openSettings();
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]
    );
}

function extractLocationDetails(components: any) {
    const getComponent = (types: any) =>
        components.find((c: any) => types.every((t: any) => c.types.includes(t)))?.long_name || '';

    return {
        city: getComponent(['locality']) || getComponent(['administrative_area_level_2']),
        state: getComponent(['administrative_area_level_1']),
        country: getComponent(['country']),
        pincode: getComponent(['postal_code']),
        landmark: getComponent(['point_of_interest']) || getComponent(['premise']),
        locality:
            getComponent(['sublocality']) ||
            getComponent(['sublocality_level_1']) ||
            getComponent(['neighborhood']),
    };
}

// ✅ MAIN FUNCTION
export async function getCurrentLocationWithAddress(setLocation: any, dispatch: any) {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
    }

    const isLocationEnabled = await checkIfLocationEnabled();
    if (!isLocationEnabled) {
        promptEnableLocationServices();
        return;
    }

    Geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 Coordinates:', latitude, longitude);

            try {
                const geoResponse = await Geocoder.from(latitude, longitude);
                const addressComponents = geoResponse.results[0].address_components;

                const locationDetails = extractLocationDetails(addressComponents);
                console.log('✅ Location Details:', locationDetails);

                const fullLocation = {
                    latitude,
                    longitude,
                    ...locationDetails
                };

                // ✅ Set in UI or local state
                setLocation({
                    longitude,
                    latitude,
                    address: locationDetails
                });

                // ✅ Dispatch update to backend
                dispatch(updateUserLocation(fullLocation));

            } catch (error) {
                console.error('❌ Geocoding Error:', error);
                Alert.alert('Error', 'Unable to retrieve address from location.');
            }
        },
        (error) => {
            console.error('❌ Location Error:', error);
            Alert.alert('Error', 'Could not fetch your location. Please try again.');
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
        }
    );
}
