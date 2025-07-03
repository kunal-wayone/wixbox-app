import React, { useState } from 'react';
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
import { Post } from '../../utils/apiUtils'; // Adjust if needed

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

    const handleBookTable = async (values: any, { setSubmitting, resetForm }: any) => {
        try {
            setIsLoading(true);
            const payload = {
                shop_id,
                name: values.name,
                phone: values.phone,
                booking_date: values.booking_date,
                time_slot: values.time_slot,
                guests: parseInt(values.guests),
                description: values.description,
                table_info,
            };

            const response: any = await Post('/user/table-booking', payload, 5000);
            console.log(response, payload)
            if (!response.success) {
                throw new Error('Failed to book table');
            }

            ToastAndroid.show('Table booked successfully!', ToastAndroid.SHORT);
            resetForm();
            setShowThankYouModal(true);

            setTimeout(() => {
                setShowThankYouModal(false);
                navigation.navigate('BookedTablesScreen');
            }, 2500);
        } catch (error: any) {
            console.error(error);
            ToastAndroid.show(
                error.message || 'Something went wrong. Please try again.',
                ToastAndroid.SHORT,
            );
        } finally {
            setIsLoading(false);
            setSubmitting(false);
        }
    };

    const seatCount = Number(table_info?.[0]?.seats) || 0;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 16,
                    backgroundColor: '#fff',
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
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
                    onSubmit={handleBookTable}
                >
                    {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        touched,
                        setFieldValue,
                        isSubmitting,
                    }) => (
                        <View>
                            {/* Full Name */}
                            <InputField
                                label="Full Name"
                                placeholder="Enter full name"
                                value={values.name}
                                onChangeText={handleChange('name')}
                                onBlur={handleBlur('name')}
                                error={touched.name && errors.name}
                            />

                            {/* Phone */}
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

                            {/* Booking Date */}
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

                            {/* Time Slot */}
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

                            {/* Guests Picker */}
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

                            {/* Description */}
                            <InputField
                                label="Description (Optional)"
                                placeholder="Enter special requests"
                                value={values.description}
                                onChangeText={handleChange('description')}
                                onBlur={handleBlur('description')}
                                multiline
                                minHeight={80}
                            />

                            {/* Table Info */}
                            <View style={{ marginBottom: 12 }}>
                                <Text style={labelStyle}>Selected Table</Text>
                                {isLoading ? (
                                    <ActivityIndicator />
                                ) : (
                                    table_info.map((table: any, index: number) => (
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

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={() => handleSubmit()}
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: isSubmitting ? '#B68AD480' : '#B68AD4',
                                    padding: 16,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    marginTop: 16,
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                    {isSubmitting ? 'Booking...' : 'Book Table'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Formik>
            </ScrollView>

            {/* Thank You Modal */}
            <Modal visible={showThankYouModal} transparent animationType="fade">
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        backgroundColor: '#fff',
                        padding: 24,
                        borderRadius: 12,
                        alignItems: 'center',
                        width: '80%',
                    }}>
                        <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 10 }}>Thank You!</Text>
                        <Text style={{ textAlign: 'center' }}>Your table has been booked successfully.</Text>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default TableBookingFormScreen;

const labelStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
};

const pickerContainer = {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
};

const ErrorText = ({ text }: { text: string }) => (
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
