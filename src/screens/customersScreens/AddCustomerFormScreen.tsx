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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  customerName: Yup.string().required('Customer name is required'),
  orderItems: Yup.array()
    .of(Yup.string().required('Item cannot be empty'))
    .min(1, 'At least one order item is required'),
  arrivedAt: Yup.string()
    .required('Arrival time is required')
    // .matches(
    //   /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    //   'Arrival time must be in HH:MM format (24-hour)',
    // ),
});

const AddCustomerFormScreen = () => {
  const navigation = useNavigation<any>();
  const [orderItems, setOrderItems] = useState<string[]>(['']);

  // Mock API call for adding customer
  const handleAddCustomer = async (
    values: any,
    { setSubmitting, resetForm }: any,
  ) => {
    navigation.navigate("OrderSummaryScreen")
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://api.example.com/add-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to add customer');
      }

      ToastAndroid.show('Customer added successfully!', ToastAndroid.SHORT);
      resetForm();
      setOrderItems(['']);
      navigation.goBack();
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
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
        {/* Header with Back Button and Title */}
        <View className="flex-row items-center border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Poppins',
              color: '#374151',
            }}
          >
            Add Customer
          </Text>

          <Formik
            initialValues={{
              customerName: '',
              orderItems: [''],
              arrivedAt: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleAddCustomer}
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
            }: any) => (
              <View style={{ marginTop: 16 }}>
                {/* Customer Name */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Customer Name
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                    }}
                    placeholder="Enter customer name"
                    onChangeText={handleChange('customerName')}
                    onBlur={handleBlur('customerName')}
                    value={values.customerName}
                  />
                  {touched.customerName && errors.customerName && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.customerName}
                    </Text>
                  )}
                </View>

                {/* Order Items */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Order Items
                  </Text>
                  {orderItems.map((item, index) => (
                    <View key={index} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 16,
                        }}
                        placeholder={`Item ${index + 1}`}
                        onChangeText={(text) => {
                          const updatedItems = [...orderItems];
                          updatedItems[index] = text;
                          setOrderItems(updatedItems);
                          setFieldValue('orderItems', updatedItems);
                        }}
                        onBlur={handleBlur(`orderItems[${index}]`)}
                        value={orderItems[index]}
                      />
                      {index > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            const updatedItems = orderItems.filter((_, i) => i !== index);
                            setOrderItems(updatedItems);
                            setFieldValue('orderItems', updatedItems);
                          }}
                          style={{ marginLeft: 8, padding: 8 }}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {touched.orderItems && errors.orderItems && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.orderItems}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                    //   const updatedItems = [...orderItems, ''];
                    //   setOrderItems(updatedItems);
                    //   setFieldValue('orderItems', updatedItems);
                    navigation.navigate("AddOrderScreen")
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 8,
                      marginTop: 8,
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#B68AD4" />
                    <Text style={{ marginLeft: 8, color: '#B68AD4', fontSize: 14 }}>
                      Add Item
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Arrived At */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Arrived At
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                    }}
                    placeholder=""
                    onChangeText={handleChange('arrivedAt')}
                    onBlur={handleBlur('arrivedAt')}
                    value={values.arrivedAt}
                    keyboardType="numeric"
                  />
                  {touched.arrivedAt && errors.arrivedAt && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.arrivedAt}
                    </Text>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
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
                    {isSubmitting ? 'Submitting...' : 'Add Customer'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddCustomerFormScreen;