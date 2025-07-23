import { View, Text, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ImagePath } from '../../constants/ImagePath';
import { addToCart, removeFromCart } from '../../store/slices/cartSlice';
import { IMAGE_URL } from '../../utils/apiUtils';
import { RootState } from '../../store/store';
import { SafeAreaView } from 'react-native-safe-area-context';

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const route = useRoute<any>();
    const shopId = route.params?.shopId || null;
    const cartItems = useSelector((state: RootState) => state.cart.items);
    console.log(cartItems)
    const handleAddToCart = (product: any) => {
        console.log(product)
        dispatch(
            addToCart({
                id: product?.id,
                name: product?.item_name,
                price: product?.price,
                quantity: 1,
                image: product?.images[0],
                shop_id: product?.images[0],
            })
        );
    };

    const updateQuantity = (id: string, change: number) => {
        const item = cartItems.find((i: any) => i.id === id);
        if (!item) return;

        const newQty = item.quantity + change;
        if (newQty <= 0) {
            dispatch(removeFromCart(id));
        } else {
            dispatch(
                addToCart({
                    ...item,
                    quantity: change,
                })
            );
        }
    };
    const renderCartItem = ({ item }: { item: any }) => {
        console.log(item)
        return (
            <View
                style={{
                    flexDirection: 'row',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    marginVertical: 8,
                    padding: 12,
                }}>
                <Image
                    source={item?.image}
                    style={{ width: 80, height: 80, borderRadius: 10, marginRight: 12 }}
                    resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                        {item?.name}
                    </Text>
                    <Text style={{ color: '#6B7280', marginBottom: 4 }}>
                        ₹{item?.price}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }} className='gap-2'>
                        <TouchableOpacity
                            className='bg-primary-30'
                            style={{
                                borderRadius: 6,
                                paddingHorizontal: 10,
                            }}
                            onPress={() => updateQuantity(item.id, -1)}>
                            <Text style={{ fontSize: 18 }}>-</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#6B7280', marginBottom: 4 }}>
                            {item?.quantity}
                        </Text>
                        <TouchableOpacity
                            className='bg-primary-30'
                            style={{
                                borderRadius: 6,
                                paddingHorizontal: 10,
                            }}
                            onPress={() => updateQuantity(item?.id, 1)}>
                            <Text style={{ fontSize: 18 }}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View
                style={{
                    height: Dimensions.get('window').height,
                    backgroundColor: '#fff',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 16,
                }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Your Cart</Text>
                <FlatList
                    data={cartItems}
                    renderItem={renderCartItem}
                    keyExtractor={item => item?.id?.toString()}
                    showsVerticalScrollIndicator={false}
                />
                <TouchableOpacity className='bg-primary-90 p-4 rounded-xl' onPress={() => navigation.navigate("AddCustomerFormScreen")}>
                    <Text className='text-center text-white'>Place Order</Text>
                </TouchableOpacity>
            </View>
            </SafeAreaView>
    )
}

export default CartScreen