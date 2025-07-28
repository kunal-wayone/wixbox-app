import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    FlatList,
    TouchableOpacity,
    ToastAndroid,
    ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal'; // Import Modal
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ImagePath } from '../../constants/ImagePath';
import { Delete, Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Switch from '../../components/common/Switch';

const AdsListScreen = () => {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [adsList, setAdsList] = useState<any>([]);
    const [toggleLoadingIds, setToggleLoadingIds] = useState<any>([]);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState<any>(null); // Store action details
    const [deleteLoading, setDeleteLoading] = useState(false); // Loading state for deletion

    // Fetch ads from server
    const fetchAds = useCallback(async () => {
        try {
            setIsLoading(true);
            const response: any = await Fetch(`/user/ads`, {}, 5000);
            if (!response.success) throw new Error('Failed to fetch ads');
            console.log(response.data.ads)
            setAdsList(response.data.ads || []);
        } catch (error: any) {
            console.error('fetchAds error:', error.message);
            ToastAndroid.show(error?.message || 'Failed to load ads.', ToastAndroid.SHORT);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Toggle ads status
    const toggleAdsStatus = useCallback(async (id: any, currentStatus: any) => {
        try {
            setToggleLoadingIds((prev: any) => [...prev, id]);
            const response: any = await Fetch(`/user/ads/${id}/active-inactive`, { status: currentStatus ? 0 : 1 }, 5000);
            if (!response.success) throw new Error('Failed to toggle status');
            setAdsList((prevAds: any) =>
                prevAds.map((item: any) => (item.id === id ? { ...item, status: currentStatus ? 0 : 1 } : item))
            );
            ToastAndroid.show('Status updated successfully!', ToastAndroid.SHORT);
            return response.data;
        } catch (error: any) {
            console.error('toggleAdsStatus error:', error.message);
            ToastAndroid.show(error?.message || 'Failed to toggle status.', ToastAndroid.SHORT);
            throw error;
        } finally {
            setToggleLoadingIds((prev: any) => prev.filter((itemId: any) => itemId !== id));
        }
    }, []);

    // Delete ads
    const deleteAds = async (id: any) => {
        try {
            setDeleteLoading(true);
            const response: any = await Delete(`/user/ads/${id}`, {});
            if (!response.success) throw new Error('Failed to delete ad');
            setAdsList((prevAds: any) => prevAds.filter((item: any) => item.id !== id)); // Remove deleted ad
            ToastAndroid.show('Ad deleted successfully!', ToastAndroid.SHORT);
            return response.data;
        } catch (error: any) {
            console.error('deleteAds error:', error.message);
            ToastAndroid.show(error?.message || 'Failed to delete ad.', ToastAndroid.SHORT);
            throw error;
        } finally {
            setDeleteLoading(false);
        }
    };

    // Handle ads deletion
    const handleDeleteAds = useCallback((adsId: any, adsName: any) => {
        setConfirmAction({ type: 'ads', id: adsId, name: adsName });
        setConfirmModalVisible(true);
    }, []);

    // Confirm deletion
    const confirmDelete = useCallback(async () => {
        if (confirmAction) {
            await deleteAds(confirmAction.id);
            setConfirmModalVisible(false);
            setConfirmAction(null);
        }
    }, [confirmAction]);

    useEffect(() => {
        if (isFocused) {
            fetchAds();
        }
    }, [isFocused, fetchAds]);

    // Memoized filtered ads
    const filteredAds = React.useMemo(
        () => adsList.filter((item: any) => item?.ads_type?.toLowerCase().includes(search?.toLowerCase())),
        [adsList, search]
    );


    console.log(filteredAds)
    const renderItem = useCallback(
        ({ item }: any) => (
            <View key={item?.id} className="flex-col bg-white rounded-2xl p-4 mb-4 shadow-md border border-gray-200">
                {/* Left: Image */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('AdsDetailScreen', { adsId: item?.id })}
                    className="mb-2"
                >
                    <Image
                        source={item?.images?.length > 0 ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
                        className="w-full h-40 rounded-xl"
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                {/* Right: Content */}
                <View className="flex-1 justify-between">
                    {/* Status & Switch */}
                    <View className="flex-row justify-between items-center mb-2 hidden">
                        <View className="flex-row items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
                            <View className={`w-2.5 h-2.5 rounded-full ${item?.status ? 'bg-green-500' : 'bg-red-500'}`} />
                            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-[10px] text-gray-700">
                                {item?.status ? ' Active' : ' Paused'}
                            </Text>
                        </View>
                        {toggleLoadingIds.includes(item.id) ? (
                            <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                            <Switch
                                value={!!item?.status}
                                onValueChange={() => toggleAdsStatus(item.id, item.status)}
                                disabled={toggleLoadingIds.includes(item.id)}
                                size="small"
                            />
                        )}
                    </View>

                    {/* Title */}
                    <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-sm text-gray-800 mb-1" numberOfLines={1} ellipsizeMode='tail'>{item?.ad_title || ' Product Name'}</Text>

                    {/* Price */}
                    <View className="flex-row items-baseline gap-2">
                        <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-xs text-green-600">
                            ₹{item?.discounted_price}/-
                        </Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xs line-through text-gray-400">
                            ₹{item?.original_price}/-
                        </Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-[8px] text-center bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">
                            Save ₹{(item?.original_price - item?.discounted_price).toFixed(2)}
                        </Text>
                    </View>

                    {/* Offer & Promotion Tags */}
                    <View className="flex-row mt-2 gap-2 flex-wrap">
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xs bg-primary-80 text-white px-2 py-1 rounded-full">
                            🏷 {item?.offer_tag || 'Offer'}
                        </Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            ⚡ {item?.promotion_tag || 'Promotion'}
                        </Text>
                    </View>

                    {/* Time */}
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-[9px] my-0.5 text-gray-500 mt-1">
                        📅 {new Date(item?.offer_starts_at).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}{' '}
                        ⏰ {new Date(`1970-01-01T${item?.offer_start_time}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        {'  '}→{'  '}
                        📅 {new Date(item?.offer_ends_at).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}{' '}
                        ⏰ {new Date(`1970-01-01T${item?.offer_end_time}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>


                    {/* Caption */}
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm italic text-blue-600 mt-1">
                        💬 {item?.caption}
                    </Text>

                    {/* Buttons */}
                    <View className="flex-row justify-between mt-3">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreateAdScreen', { adDetails: item })}
                            className="bg-primary-80 w-[48%] px-3 py-2 rounded-lg"
                        >
                            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-center text-sm"> Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleDeleteAds(item.id, item.product_name)}
                            className="bg-red-500 w-[48%] px-3 py-2 rounded-lg"
                        >
                            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-center text-sm"> Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ),
        [toggleLoadingIds, toggleAdsStatus, navigation, handleDeleteAds]
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View className="p-4 pb-20 h-full bg-gray-50">
                <View>
                    <TouchableOpacity onPress={() => navigation.goBack()} className='absolute z-50' >
                        <Icon name="arrow-back" className="" size={20} color="black" />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-2xl text-center">Created Ads List</Text>
                </View>

                {/* Search & Add Button */}
                <View className="flex-row items-center gap-3 mt-4 mb-4">
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

                {/* Confirmation Modal */}
                <Modal isVisible={confirmModalVisible} onBackdropPress={() => setConfirmModalVisible(false)}>
                    <View className="bg-white p-6 rounded-lg">
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg mb-4">
                            Are you sure you want to delete "{confirmAction?.name}"?
                        </Text>
                        <View className="flex-row justify-end gap-4">
                            <TouchableOpacity
                                onPress={() => {
                                    setConfirmModalVisible(false);
                                    setConfirmAction(null);
                                }}
                                className="px-4 py-2 bg-gray-200 rounded-lg"
                            >
                                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-800 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmDelete}
                                className="px-4 py-2 bg-red-500 rounded-lg"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white font-medium">Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Ads List */}
                {isLoading ? (
                    <View className="flex-1 justify-center items-center mt-10">
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : filteredAds.length === 0 ? (
                    <View className="flex-1 justify-center items-center mt-10">
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-lg">No ads found</Text>
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
        </SafeAreaView>
    );
};

export default AdsListScreen;