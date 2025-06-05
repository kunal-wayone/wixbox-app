import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {ImagePath} from '../../constants/ImagePath'; // Adjust path as needed
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  productName: Yup.string().required('Product name is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  unit: Yup.string().required('Unit is required'),
  subunit: Yup.string().required('Subunit is required'),
  stock: Yup.number()
    .required('Stock is required')
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
});

const AddProductScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const itemDetails = route.params?.itemDetails || null;

  // Mock API call for saving product
  const handleSaveProduct = async (
    values: any,
    {setSubmitting, resetForm}: any,
  ) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://api.example.com/add-product', {
        method: itemDetails ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      ToastAndroid.show(
        itemDetails
          ? 'Product updated successfully!'
          : 'Product added successfully!',
        ToastAndroid.SHORT,
      );
      resetForm();
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
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header with Back Button and Custom Title */}
        <View className="flex-row items-center  border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={{marginTop: 10}}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 30,
              fontWeight: 'bold',
              fontFamily: 'Poppins',
              color: '#374151',
            }}>
            {itemDetails ? 'Edit Product' : 'Add Product'}
          </Text>
          <Text
            style={{textAlign: 'center', marginVertical: 8, color: '#4B5563'}}>
            {itemDetails
              ? 'Update the product details below.'
              : 'Enter the product details to add a new product.'}
          </Text>

          <Formik
            initialValues={{
              productName: itemDetails?.productName || '',
              price: itemDetails?.price ? String(itemDetails.price) : '',
              description: itemDetails?.description || '',
              category: itemDetails?.category || '',
              unit: itemDetails?.unit || '',
              subunit: itemDetails?.subunit || '',
              stock: itemDetails?.stock ? String(itemDetails.stock) : '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSaveProduct}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              setFieldValue,
            }: any) => (
              <View style={{marginTop: 16}}>
                {/* Image Upload Container */}
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 150,
                    marginBottom: 12,
                  }}
                  onPress={() => {
                    // Implement image picker logic here
                    ToastAndroid.show(
                      'Image picker not implemented',
                      ToastAndroid.SHORT,
                    );
                  }}>
                  <Image
                    source={ImagePath.uploadIcon} // Replace with your upload icon
                    style={{width: 40, height: 40}}
                    resizeMode="contain"
                  />
                  <Text style={{color: '#4B5563', marginTop: 8}}>
                    Upload Product Image
                  </Text>
                </TouchableOpacity>

                {/* Product Name */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Product Name
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
                    placeholder="Enter product name"
                    onChangeText={handleChange('productName')}
                    onBlur={handleBlur('productName')}
                    value={values.productName}
                  />
                  {touched.productName && errors.productName && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.productName}
                    </Text>
                  )}
                </View>

                {/* Price */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Price
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
                    placeholder="Enter price"
                    onChangeText={handleChange('price')}
                    onBlur={handleBlur('price')}
                    value={values.price}
                    keyboardType="numeric"
                  />
                  {touched.price && errors.price && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.price}
                    </Text>
                  )}
                </View>

                {/* Description */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Description
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      minHeight: 100,
                    }}
                    placeholder="Enter product description"
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    value={values.description}
                    multiline
                  />
                  {touched.description && errors.description && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.description}
                    </Text>
                  )}
                </View>

                {/* Category Picker */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Category
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                    }}>
                    <Picker
                      selectedValue={values.category}
                      onValueChange={value => setFieldValue('category', value)}
                      style={{fontSize: 16}}>
                      <Picker.Item label="Select a category" value="" />
                      <Picker.Item label="Electronics" value="electronics" />
                      <Picker.Item label="Clothing" value="clothing" />
                      <Picker.Item label="Books" value="books" />
                      <Picker.Item
                        label="Home & Kitchen"
                        value="home_kitchen"
                      />
                    </Picker>
                  </View>
                  {touched.category && errors.category && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.category}
                    </Text>
                  )}
                </View>

                {/* Unit and Subunit */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}>
                  <View style={{flex: 1, marginRight: 8}}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 4,
                      }}>
                      Unit
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
                      placeholder="e.g., kg"
                      onChangeText={handleChange('unit')}
                      onBlur={handleBlur('unit')}
                      value={values.unit}
                    />
                    {touched.unit && errors.unit && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.unit}
                      </Text>
                    )}
                  </View>
                  <View style={{flex: 1, marginLeft: 8}}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 4,
                      }}>
                      Subunit
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
                      placeholder="e.g., g"
                      onChangeText={handleChange('subunit')}
                      onBlur={handleBlur('subunit')}
                      value={values.subunit}
                    />
                    {touched.subunit && errors.subunit && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.subunit}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Stock */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Stock
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
                    placeholder="Enter stock quantity"
                    onChangeText={handleChange('stock')}
                    onBlur={handleBlur('stock')}
                    value={values.stock}
                    keyboardType="numeric"
                  />
                  {touched.stock && errors.stock && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.stock}
                    </Text>
                  )}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#B68AD480' : '#B68AD4',
                    padding: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 16,
                  }}>
                  <Text
                    style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
                    {isSubmitting ? 'Saving...' : 'Save Product'}
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

export default AddProductScreen;
