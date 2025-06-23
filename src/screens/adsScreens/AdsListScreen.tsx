import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    FlatList,
    Switch,
    TouchableOpacity,
    ToastAndroid,
    ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';

const AdsListScreen = () => {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [adsList, setAdsList] = useState<any[]>([]);
    const [toggleLoadingIds, setToggleLoadingIds] = useState<string[]>([]);

    // Fetch menu items from server
    const fetchAds = useCallback(async () => {
        try {
            setIsLoading(true);
            const response: any = await Fetch(`/user/ads`, {}, 5000);
            console.log(response)
            if (!response.success) throw new Error('Failed to fetch ads');
            setAdsList(response.data.ads || []);
        } catch (error: any) {
            console.error('fetchAds error:', error.message);
            ToastAndroid.show(
                error?.message || 'Failed to load ads.',
                ToastAndroid.SHORT
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Toggle ads status
    const toggleAdsStatus = useCallback(
        async (id: string, currentStatus: boolean) => {
            try {
                setToggleLoadingIds((prev) => [...prev, id]);
                const response: any = await Fetch(
                    `/user/ads/${id}/active-inactive`,
                    { status: currentStatus ? 0 : 1 },
                    5000
                );
                if (!response.success) throw new Error('Failed to toggle status');

                // Update ads state optimistically
                setAdsList((prevAds: any) =>
                    prevAds.map((item: any) =>
                        item.id === id ? { ...item, status: currentStatus ? 0 : 1 } : item)
                );

                ToastAndroid.show('Status updated successfully!', ToastAndroid.SHORT);
                return response.data;
            } catch (error: any) {
                console.error('toggleAdsStatus error:', error.message);
                ToastAndroid.show(
                    error?.message || 'Failed to toggle status.',
                    ToastAndroid.SHORT
                );
                throw error;
            } finally {
                setToggleLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
            }
        },
        []
    );


    useEffect(() => {
        if (isFocused) {
            fetchAds();
        }
    }, [isFocused]);

    // Memoized filtered ads
    const filteredAds = React.useMemo(() => adsList.filter((item) =>
        item?.product_name?.toLowerCase().includes(search?.toLowerCase())
    ), [adsList, search]);

    const renderItem = useCallback(
        ({ item }: { item: any }) => (
            <View key={item?.id} className="flex-row bg-gray-100 rounded-xl p-4 mb-4 shadow-sm">
                {/* Left: Image + Switch */}
                <TouchableOpacity onPress={() => navigation.navigate('AdsDetailScreen', { adsId: item?.id })} className="w-2/5 mr-3 items-center">
                    <Image
                        source={item?.images?.length > 0 ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
                        className="w-full h-40 rounded-lg mb-2"
                        resizeMode="cover"
                    />

                </TouchableOpacity>

                {/* Right: Content */}
                <View className="flex-1">
                    <View className="flex-row items-center justify-between  ">
                        {item?.status && (
                            <View className={`self-start px-2 py-1 rounded-md flex-row items-center gap-1`}>
                                <View className={`w-2.5 h-2.5 rounded-full ${item?.status === 1 ? "bg-green-500" : "bg-red-500"} `} /> <Text className="text-gray-800 text-xs font-semibold">{item?.status === 1 ? "Active" : "Paused"}</Text>
                            </View>
                        )}
                        <View className='w-1/2'>
                            {toggleLoadingIds.includes(item.id) ? (
                                <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 8 }} />
                            ) : (<Switch
                                value={item?.status === "1" ? true : false}
                                onValueChange={() => toggleAdsStatus(item.id, item.status === "1")}
                                disabled={toggleLoadingIds.includes(item.id)}
                            />)}
                        </View>
                    </View>

                    <Text className="text-lg font-semibold text-gray-800">{item?.product_name}</Text>
                    <View className="flex-row justify-start gap-2 items-baseline">
                        <Text className="text-md font-bold">
                            {item?.currency || '₹'}
                            {item?.discounted_price}/-
                        </Text>
                        <Text className="text-xs line-through text-gray-500">₹{item?.original_price + "/-" || 'N/A'} •</Text>
                    </View>
                    <Text className="text-sm  text-orange-500 mt-1">{item?.offer_tag || 'N/A'}</Text>
                    {/* 
                    <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-sm text-gray-600">Stock Count:</Text>
                        <Text className="font-semibold">{item?.stock_quantity || '0'}</Text>
                    </View> */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateAdScreen', { adDetails: item })}
                        className="mt-2 bg-primary-90 w-full px-3 py-2 rounded-lg"
                    >
                        <Text className="text-white text-center text-md font-medium">
                            Edit ads Details
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        ),
        [toggleLoadingIds, toggleAdsStatus, navigation]
    );

    return (
        <View className="p-4 pb-20 bg-gray-50">
            <View>
                <Icon name="arrow-back" className='absolute' size={20} color="black" />
                <Text className='text-2xl font-semibold text-center'>Created Ads List</Text>
            </View>
            {/* Search & Add Button */}
            <View className="flex-row items-center gap-3 mt-4  mb-4">
                <View className="flex-row items-center flex-1 bg-white px-3 py-0.5 border rounded-xl shadow-sm">
                    <AntDesign name="search1" color="#6B7280" size={20} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search ads..."
                        className="ml-2 flex-1 text-sm text-gray-700"
                        autoCapitalize="none"
                    />
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateAdScreen')}
                    className="bg-primary-90 p-3 rounded-lg"
                >
                    <Icon name="add" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Ads List */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center mt-10">
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : filteredAds.length === 0 ? (
                <View className="flex-1 justify-center items-center mt-10">
                    <Text className="text-gray-500 text-lg">No ads found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAds}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                />
            )}
        </View>
    );
};

export default AdsListScreen;