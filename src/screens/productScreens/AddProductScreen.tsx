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
import {launchImageLibrary} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {BASE_URL, Fetch, IMAGE_URL, Post, Put} from '../../utils/apiUtils';

const {width} = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  item_name: Yup.string().required('Product name is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive'),
  description: Yup.string().required('Description is required'),
  stock_quantity: Yup.number()
    .required('Stock is required')
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  unit: Yup.string().required('Unit is required'),
  category_id: Yup.string().required('Category is required'),
  status: Yup.string().required('Status is required'),
});

const AddProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const productId = route.params?.productId || null;
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [images, setImages] = useState<any>([]); // Store selected images
  const [categories, setCategories] = useState([]); // Store categories from API
  const [units, setUnits] = useState([]); // Store units from API

  // Fetch product details if editing
  const getProductData = async (id: any) => {
    if (id) {
      try {
        const response: any = await Fetch(
          `/user/menu-items/${id}`,
          undefined,
          5000,
        );
        if (!response.success) {
          throw new Error('Failed to fetch product');
        }
        const data = response?.data?.menu_item; // Fixed typo here
        const images = response?.data?.menu_item?.images || [];
        setItemDetails(data);
        console.log(itemDetails?.status);
        // Convert API images to match the format expected by the UI
        setImages(
          images.map((img: any) => ({
            uri: IMAGE_URL + img.url, // Use the URL from the API
            id: img.id,
          })),
        );
      } catch (error) {
        ToastAndroid.show(
          'Failed to fetch product details',
          ToastAndroid.SHORT,
        );
      }
    }
  };

  // Fetch categories for picker
  const fetchCategories = async () => {
    try {
      const response: any = await Fetch('/user/categories', undefined, 5000);
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      ToastAndroid.show('Failed to fetch categories', ToastAndroid.SHORT);
    }
  };

  // Fetch units for picker
  const fetchUnit = async () => {
    try {
      const response: any = await Fetch('/user/menu-units', undefined, 5000);
      if (response.success) {
        setUnits(response?.data?.units);
      }
    } catch (error) {
      ToastAndroid.show('Failed to fetch units', ToastAndroid.SHORT);
    }
  };

  useEffect(() => {
    getProductData(productId);
    fetchCategories();
    fetchUnit();
  }, [productId]);

  // Handle image selection
  const pickImages = async (setFieldValue: any) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5,
      });
      if (!result.didCancel && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        setImages((prev: any) => [...prev, ...newImages]);
        setFieldValue('images', [...images, ...newImages]);
      }
    } catch (error) {
      ToastAndroid.show('Error selecting images', ToastAndroid.SHORT);
    }
  };

  // Remove selected image
  const removeImage = (index: any, setFieldValue: any) => {
    const updatedImages = images.filter((_: any, i: any) => i !== index);
    setImages(updatedImages);
    setFieldValue('images', updatedImages);
  };

  // Handle form submission
  const handleSaveProduct = async (
    values: any,
    {setSubmitting, resetForm}: any,
  ) => {
    try {
      const formData = new FormData();
      formData.append('item_name', values.item_name);
      formData.append('price', values.price);
      formData.append('description', values.description);
      formData.append('stock_quantity', values.stock_quantity);
      formData.append('unit', values.unit);
      formData.append('category_id', values.category_id);
      formData.append('status', values.status);

      // Append images
      values.images?.forEach((image: any, index: any) => {
        if (image.uri && image.type && image.name) {
          // Only append locally selected images (not API images)
          formData.append(`images[${index}]`, {
            uri: image.uri,
            type: image.type,
            name: image.name,
          });
        }
      });

      const endpoint = productId
        ? `/user/menu-items/${productId}`
        : '/user/menu-items';
      const Method = productId ? Put : Post;
      const response: any = await Method(endpoint, formData, 5000);
      if (!response.success) {
        throw new Error('Failed to save product');
      }

      console.log(response, endpoint, values, Method);
      ToastAndroid.show(
        productId
          ? 'Product updated successfully!'
          : 'Product added successfully!',
        ToastAndroid.SHORT,
      );
      resetForm();
      setImages([]);
      navigation.goBack();
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong',
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
        <View className="flex-row items-center border-gray-200">
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
              item_name: itemDetails?.item_name || '',
              price: itemDetails?.price ? String(itemDetails.price) : '',
              description: itemDetails?.description || '',
              stock_quantity: itemDetails?.stock_quantity
                ? String(itemDetails.stock_quantity)
                : '',
              unit: itemDetails?.unit || '',
              category_id: itemDetails?.category?.id
                ? itemDetails.category.id
                : '', // Fixed category_id
              status: itemDetails?.status === 0 ? '0' : '1',
              images: images || [],
            }}
            validationSchema={validationSchema}
            onSubmit={handleSaveProduct}
            enableReinitialize>
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
                {/* Image Upload and Preview */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Product Images
                  </Text>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 100,
                      marginBottom: 12,
                    }}
                    onPress={() => pickImages(setFieldValue)}>
                    <Ionicons name="image-outline" size={40} color="#4B5563" />
                    <Text style={{color: '#4B5563', marginTop: 8}}>
                      Upload Images
                    </Text>
                  </TouchableOpacity>

                  {/* Image Preview */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {images.map((image: any, index: any) => {
                      console.log(image);
                      return (
                        <View
                          key={index}
                          style={{marginRight: 10, position: 'relative'}}>
                          <Image
                            source={{
                              uri: `${image.uri}`,
                            }}
                            style={{width: 100, height: 100, borderRadius: 8}}
                          />
                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              backgroundColor: '#EF4444',
                              borderRadius: 12,
                              padding: 2,
                            }}
                            onPress={() => removeImage(index, setFieldValue)}>
                            <Ionicons name="close" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                  {touched.images && errors.images && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.images}
                    </Text>
                  )}
                </View>

                {/* Item Name */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Item Name
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
                    placeholder="Enter item name"
                    onChangeText={handleChange('item_name')}
                    onBlur={handleBlur('item_name')}
                    value={values.item_name}
                  />
                  {touched.item_name && errors.item_name && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.item_name}
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
                      selectedValue={values.category_id}
                      onValueChange={value =>
                        setFieldValue('category_id', value)
                      }
                      style={{fontSize: 16}}>
                      <Picker.Item label="Select a category" value="" />
                      {categories.map((category: any) => (
                        <Picker.Item
                          key={category.id}
                          label={category.name}
                          value={category.id}
                        />
                      ))}
                    </Picker>
                  </View>
                  {touched.category_id && errors.category_id && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.category_id}
                    </Text>
                  )}
                </View>

                {/* Unit Picker */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Unit
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                    }}>
                    <Picker
                      selectedValue={values.unit}
                      onValueChange={value => setFieldValue('unit', value)}
                      style={{fontSize: 16}}>
                      <Picker.Item label="Select a unit" value="" />
                      {units.map((unit: any) => (
                        <Picker.Item
                          key={unit.id}
                          label={unit.name}
                          value={unit.short_name}
                        />
                      ))}
                    </Picker>
                  </View>
                  {touched.unit && errors.unit && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.unit}
                    </Text>
                  )}
                </View>

                {/* Stock Quantity */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Stock Quantity
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
                    onChangeText={handleChange('stock_quantity')}
                    onBlur={handleBlur('stock_quantity')}
                    value={values.stock_quantity}
                    keyboardType="numeric"
                  />
                  {touched.stock_quantity && errors.stock_quantity && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.stock_quantity}
                    </Text>
                  )}
                </View>

                {/* Status Picker */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Status
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                    }}>
                    <Picker
                      selectedValue={values.status}
                      onValueChange={value => setFieldValue('status', value)}
                      style={{fontSize: 16}}>
                      <Picker.Item label="Select status" value="" />
                      <Picker.Item label="Active" value="1" />
                      <Picker.Item label="Inactive" value="0" />
                    </Picker>
                  </View>
                  {touched.status && errors.status && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.status}
                    </Text>
                  )}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={() => handleSubmit()}
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
                    {isSubmitting
                      ? productId
                        ? 'Saving...'
                        : 'Saving...'
                      : productId
                      ? 'Update Product'
                      : 'Save Product'}
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
