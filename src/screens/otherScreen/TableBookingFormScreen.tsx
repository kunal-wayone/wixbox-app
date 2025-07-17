import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ToastAndroid,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { Post } from '../../utils/apiUtils';
import PaymentComponent from '../../components/PaymentComponent';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Full name is required'),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
    booking_date: Yup.string().required('Booking date is required'),
    time_slot: Yup.string().required('Time slot is required'),
    guests: Yup.number()
        .min(1, 'At least one guest is required')
        .required('Number of guests is required'),
    description: Yup.string(),
});

const TableBookingFormScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { shop_id, table_info }: any = route.params || {
        shop_id: 8,
        table_info: [
            {
                floor: 'First',
                table_number: '9',
                type: 'Standard',
                price: '1700',
                premium: 0,
                seats: '4',
            },
        ],
    };

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);

    const formatDate = (date: any) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTime = (date: any) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleBookTable = useCallback(
        async (values: any, resetForm: any) => {
            try {
                setIsLoading(true);
                const payload = {
                    shop_id,
                    name: values?.name?.trim() || '',
                    phone: values?.phone?.trim() || '',
                    booking_date: values?.booking_date || '',
                    time_slot: values?.time_slot || '',
                    guests: parseInt(values?.guests || '0', 10),
                    description: values?.description?.trim() || '',
                    table_info,
                    // payment_id: paymentData?.razorpay_payment_id,
                };

                const response: any = await Post('/user/table-booking', payload, 5000);
                console.log('Booking response:', response);

                if (!response?.success) {
                    ToastAndroid.show('Failed to book table. Please try again.', ToastAndroid.SHORT);
                    return { success: false };
                }
                resetForm()
                ToastAndroid.show('Table booked successfully!', ToastAndroid.SHORT);
                return { success: true, orderId: response?.data?.id };
            } catch (error: any) {
                console.error('Booking error:', error);
                ToastAndroid.show(
                    error?.message || 'Something went wrong. Please try again.',
                    ToastAndroid.SHORT
                );
                return { success: false };
            } finally {
                setIsLoading(false);
            }
        },
        [shop_id, table_info, navigation]
    );



    const orderPayment = async (orderid: any, paymentData: any, totalAmount: any) => {
        setIsLoading(true)
        try {
            const paymentPayload = {
                order_id: orderid,
                status: "completed",
                transaction_data: {
                    razorpay_order_id: paymentData?.razorpay_order_id,
                    razorpay_payment_id: paymentData?.razorpay_payment_id,
                    razorpay_signature: paymentData?.razorpay_signature,
                    amount: Number(totalAmount)?.toFixed(2),
                    currency: "INR"
                }
            }
            const response: any = await Post('/user/order-payments-table', paymentPayload, 5000);
            console.log(response, "dsflkds")
            if (!response.success) {
                console.log(response)
                throw new Error(response.message || 'Failed to payment transection save of order');
            }
            setShowThankYouModal(true)
            setTimeout(() => {
                setShowThankYouModal(false);
                navigation.replace('BookedTablesScreen');
            }, 2500);
        } catch (error: any) {
            console.log(error)
            throw new Error(error.message || 'Failed to payment transection save of table booking');

        } finally {
            setIsLoading(false)
        }
    }

    const seatCount = Number(table_info?.[0]?.seats) || 0;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        >
            {isLoading && <View className='absolute bg-black/80 top-0 z-50 h-full w-full '>
                <ActivityIndicator className='m-auto' size={"large"} color={'#B68AD4'} />
            </View>}
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 16,
                    backgroundColor: '#fff',
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={{ flex: 1, fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#374151' }}>
                        Book a Table
                    </Text>
                </View>

                <Formik
                    initialValues={{
                        name: '',
                        phone: '',
                        booking_date: '',
                        time_slot: '',
                        guests: '',
                        description: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        // Pass form values directly to PaymentComponent
                        // No need to store in state
                    }}
                >
                    {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        touched,
                        resetForm,
                        setFieldValue,
                        isSubmitting,
                    }) => (
                        <View>
                            <InputField
                                label="Full Name"
                                placeholder="Enter full name"
                                value={values.name}
                                onChangeText={handleChange('name')}
                                onBlur={handleBlur('name')}
                                error={touched.name && errors.name}
                            />

                            <InputField
                                label="Phone Number"
                                placeholder="Enter phone number"
                                value={values.phone}
                                onChangeText={handleChange('phone')}
                                onBlur={handleBlur('phone')}
                                keyboardType="phone-pad"
                                maxLength={10}
                                error={touched.phone && errors.phone}
                            />

                            <DateTimeField
                                label="Booking Date"
                                value={values.booking_date}
                                icon="calendar-today"
                                onPress={() => setShowDatePicker(true)}
                            />
                            <DateTimePickerModal
                                isVisible={showDatePicker}
                                mode="date"
                                minimumDate={new Date()}
                                onConfirm={(date) => {
                                    setFieldValue('booking_date', formatDate(date));
                                    setShowDatePicker(false);
                                }}
                                onCancel={() => setShowDatePicker(false)}
                            />
                            {touched.booking_date && errors.booking_date && (
                                <ErrorText text={errors.booking_date} />
                            )}

                            <DateTimeField
                                label="Time Slot"
                                value={values.time_slot}
                                icon="access-time"
                                onPress={() => setShowTimePicker(true)}
                            />
                            <DateTimePickerModal
                                isVisible={showTimePicker}
                                mode="time"
                                is24Hour={true}
                                onConfirm={(time) => {
                                    setFieldValue('time_slot', formatTime(time));
                                    setShowTimePicker(false);
                                }}
                                onCancel={() => setShowTimePicker(false)}
                            />
                            {touched.time_slot && errors.time_slot && (
                                <ErrorText text={errors.time_slot} />
                            )}

                            <View style={{ marginBottom: 12 }}>
                                <Text style={labelStyle}>Number of Guests</Text>
                                <View style={pickerContainer}>
                                    <Picker
                                        selectedValue={values.guests || ''}
                                        onValueChange={(val) => setFieldValue('guests', val)}
                                    >
                                        <Picker.Item label="Select number of guests" value="" />
                                        {Array.from({ length: seatCount }, (_, i) => (
                                            <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
                                        ))}
                                    </Picker>
                                </View>
                                {touched.guests && errors.guests && <ErrorText text={errors.guests} />}
                            </View>

                            <InputField
                                label="Description (Optional)"
                                placeholder="Enter special requests"
                                value={values.description}
                                onChangeText={handleChange('description')}
                                onBlur={handleBlur('description')}
                                multiline
                                minHeight={80}
                            />

                            <View style={{ marginBottom: 12 }}>
                                <Text style={labelStyle}>Selected Table</Text>
                                {isLoading ? (
                                    <ActivityIndicator />
                                ) : (
                                    table_info.map((table: any, index: any) => (
                                        <View
                                            key={index}
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                padding: 8,
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#D1D5DB',
                                            }}
                                        >
                                            <Text>
                                                {table.floor} Floor, Table {table.table_number} ({table.type})
                                            </Text>
                                            <Text>₹{table.price} ({table.seats} seats)</Text>
                                        </View>
                                    ))
                                )}
                            </View>

                            <PaymentComponent
                                amount={Number(table_info[0]?.price) || 0}
                                customer={{
                                    name: values.name || 'Guest',
                                    email: 'guest@example.com',
                                    phone: values.phone || '1234567890',
                                }}
                                config={{
                                    name: 'WishBox Store',
                                    currency: 'INR',
                                    description: `Table reservation for table ${table_info[0]?.table_number}`,
                                    theme: { color: '#B68AD4' },
                                }}
                                buttonLabel={
                                    isSubmitting
                                        ? 'Processing...'
                                        : `Pay ₹ ${table_info[0]?.price || 0}/- & Reserve Now`
                                }
                                buttonClassName={`bg-primary-80 rounded-xl p-4 w-full mt-5 ${isSubmitting ? 'opacity-50' : ''
                                    }`}
                                onPaymentSuccess={(paymentData, orderId) => {
                                    console.log(paymentData)
                                    orderPayment(orderId, paymentData, table_info[0]?.price);
                                }}
                                onPaymentFailure={(error) => {
                                    ToastAndroid.show('Payment failed. Please try again.', ToastAndroid.LONG);
                                }}
                                onPaymentCancel={() => {
                                    ToastAndroid.show('Payment cancelled.', ToastAndroid.LONG);
                                }}
                                handleSubmit={() => {
                                    const data = handleBookTable(values, resetForm)
                                    return data;
                                }}
                            />
                        </View>
                    )}
                </Formik>
            </ScrollView>

            <Modal visible={showThankYouModal} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#fff',
                            padding: 24,
                            borderRadius: 12,
                            alignItems: 'center',
                            width: '80%',
                        }}
                    >
                        <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 10 }}>
                            Thank You!
                        </Text>
                        <Text style={{ textAlign: 'center' }}>
                            Your table has been booked successfully.
                        </Text>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default TableBookingFormScreen;

// InputField, DateTimeField, ErrorText, labelStyle, pickerContainer remain unchanged
const labelStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
};

const pickerContainer = {
    borderWidth: 1,
    borderColor: '#D1D5D',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
};

const ErrorText = ({ text }: any) => (
    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{text}</Text>
);

const InputField = ({
    label,
    value,
    placeholder,
    onChangeText,
    onBlur,
    error,
    multiline = false,
    keyboardType,
    maxLength,
    minHeight = 50,
}: any) => (
    <View style={{ marginBottom: 12 }}>
        <Text style={labelStyle}>{label}</Text>
        <TextInput
            style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                minHeight,
                verticalAlign: 'top',
            }}
            placeholder={placeholder}
            onChangeText={onChangeText}
            onBlur={onBlur}
            value={value}
            multiline={multiline}
            keyboardType={keyboardType}
            maxLength={maxLength}
        />
        {error && <ErrorText text={error} />}
    </View>
);

const DateTimeField = ({ label, value, onPress, icon }: any) => (
    <View style={{ marginBottom: 12 }}>
        <Text style={labelStyle}>{label}</Text>
        <TouchableOpacity
            style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
            }}
            onPress={onPress}
        >
            <Text style={{ fontSize: 16, color: '#374151', flex: 1 }}>
                {value || `Select ${label}`}
            </Text>
            <MaterialIcon name={icon} size={20} color="#374151" />
        </TouchableOpacity>
    </View>
);