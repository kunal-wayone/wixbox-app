import React, { useState, useEffect } from 'react';
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
  StyleSheet,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { BASE_URL, Fetch, IMAGE_URL, Post, Put } from '../../utils/apiUtils';
import LoadingComponent from '../otherScreen/LoadingComponent';
import Switch from '../../components/common/Switch';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePath } from '../../constants/ImagePath';

const { width } = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  item_name: Yup.string().required('Please enter a product name 😊'),
  description: Yup.string().required('Please add a description 📝'),
  stock_quantity: Yup.number()
    .required('Please specify stock quantity 📦')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  unit: Yup.string().required('Please select a unit ⚖️'),
  category_id: Yup.string().required('Please choose a category 🏷️'),
  tags: Yup.array()
    .min(1, 'Please select at least one tag 🌟')
    .required('Please select at least one tag 🌟'),
  status: Yup.boolean().required('Please set the product status 🔄'),
  variants: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Variant name is required 🌈'),
      price: Yup.number()
        .required('Additional price is required 💸')
        .min(0, 'Price cannot be negative'),
    })
  ),
});

// Available tags
const availableTags = [
  { id: 'spicy', label: 'Spicy 🌶️' },
  { id: 'bestseller', label: 'Bestseller ⭐' },
  { id: 'hot', label: 'Hot 🔥' },
  { id: 'fresh', label: 'Fresh 🥗' },
  { id: 'gluten_free', label: 'Gluten-Free 🌾' },
  { id: 'vegan', label: 'Vegan 🌱' },
];

const AddProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const productId = route.params?.productId || null;
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newVariant, setNewVariant] = useState({ name: '', price: '' });
  const [dynamicTaxes, setDynamicTaxes] = useState<any[]>([]);

  // Fetch product details if editing
  const getProductData = async (id: any) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response: any = await Fetch(`/user/menu-items/${id}`, undefined, 5000);
      if (!response.success) throw new Error('Failed to fetch product');

      const data = response?.data?.menu_item;
      setItemDetails({
        ...data,
        variants: data.variants || [],
        tags: data.tags || [],
      });
      setImages(
        (data.images || []).map((img: any, index: any) => ({
          uri: IMAGE_URL + img,
          id: index,
        }))
      );
    } catch (error) {
      ToastAndroid.show('Couldn’t load product details 😔', ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and units
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, unitsRes, tagsRes, taxsRes]: any = await Promise.all([
          Fetch('/user/food/category', undefined, 5000),
          Fetch('/user/menu-units', undefined, 5000),
          Fetch('/user/vendor/tag', undefined, 5000),
          Fetch('/user/vendor/taxes', undefined, 5000),
        ]);
        if (categoriesRes.success) setCategories(categoriesRes.data);
        if (unitsRes.success) setUnits(unitsRes.data.units);
        if (tagsRes.success) setTags(tagsRes.data);
        if (taxsRes.success) setDynamicTaxes(taxsRes.data);

        console.log(categoriesRes, unitsRes.data.units, tagsRes)
      } catch (error) {
        ToastAndroid.show('Failed to load categories or units 😢', ToastAndroid.SHORT);
      }
    };
    fetchData();
    getProductData(productId);
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
        setImages(prev => [...prev, ...newImages]);
        setFieldValue('images', [...images, ...newImages]);
      }
    } catch (error) {
      ToastAndroid.show('Error picking images 📸', ToastAndroid.SHORT);
    }
  };

  // Remove selected image
  const removeImage = (index: any, setFieldValue: any) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    setFieldValue('images', updatedImages);
  };

  // Handle form submission
  const handleSaveProduct = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      const formData = new FormData();
      formData.append('item_name', values.item_name);
      formData.append('description', values.description);
      formData.append('stock_quantity', values.stock_quantity);
      formData.append('price', values.price);
      formData.append('unit', units.find(u => u.id === values.unit)?.short_name || '');
      formData.append('category_id', values.category_id);
      formData.append('isVegetarian', values.isVegetarian);
      formData.append('preparation_time', values.preparation_time);
      formData.append('status', values.status ? '1' : '0');
      values.tags.forEach((tag: string, index: number) => {
        formData.append(`tags[${index}]`, tag);
      });
      formData.append('tax_id', values.tax)
      // Append variants
      values.variants.forEach((variant: any, index: number) => {
        formData.append(`variants[${index}][name]`, variant.name);
        formData.append(`variants[${index}][price]`, variant.price);
      });

      // Append images
      values.images?.forEach((image: any, index: any) => {
        if (image.uri && image.type && image.name) {
          formData.append(`images[${index}]`, {
            uri: image.uri,
            type: image.type,
            name: image.name,
          });
        }
      });

      const endpoint = productId ? `/user/menu-items/${productId}` : '/user/menu-items';
      const response: any = await (productId ? Put : Post)(endpoint, formData, 5000);
      console.log(response)
      if (!response.success) throw new Error('Failed to save product');

      ToastAndroid.show(
        productId ? 'Product updated successfully! 🎉' : 'Product added successfully! 🎉',
        ToastAndroid.SHORT
      );
      resetForm();
      setImages([]);
      navigation.goBack();
    } catch (error: any) {
      ToastAndroid.show(error?.message || 'Something went wrong 😔', ToastAndroid.SHORT);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle adding a new variant
  const handleAddVariant = (setFieldValue: any, values: any) => {
    if (!newVariant.name || !newVariant.price) {
      ToastAndroid.show('Please fill in variant name and price 😊', ToastAndroid.SHORT);
      return;
    }
    setFieldValue('variants', [...values.variants, newVariant]);
    setNewVariant({ name: '', price: '' });
    setModalVisible(false);
  };

  if (isLoading) return <LoadingComponent />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            className="absolute top-4 left-4 p-2"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View>
            <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-center text-2xl text-gray-900 mt-12 mb-2">
              {itemDetails ? 'Edit Product 🍽️' : 'Add New Product 🍽️'}
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-center text-sm text-gray-600 mb-4">
              {itemDetails ? 'Update your menu item' : 'Add a new item to your menu'}
            </Text>

            <Formik
              initialValues={{
                item_name: itemDetails?.item_name || '',
                description: itemDetails?.description || '',
                stock_quantity: itemDetails?.stock_quantity ? String(itemDetails.stock_quantity) : '',
                price: itemDetails?.price ? String(itemDetails.price) : '',
                unit: units.find(u => u.short_name === itemDetails?.unit)?.id || '',
                category_id: itemDetails?.category?.id || '',
                status: itemDetails?.status === 1 || itemDetails?.status === undefined ? true : false,
                images: images || [],
                isVegetarian: `${itemDetails?.isVegetarian}` || '',
                variants: itemDetails?.variants || [],
                tags: itemDetails?.tags?.map(tag => tag.id) || [],
                tax: itemDetails?.tax_id || '',
                preparation_time: itemDetails?.preparation_time || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSaveProduct}
              enableReinitialize
            >
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
                <View>
                  {/* Image Upload and Preview */}
                  <View className="bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                      Product Photos
                    </Text>
                    <TouchableOpacity
                      className="border border-dashed border-gray-300 rounded-lg p-4 items-center justify-center h-36 mb-3"
                      onPress={() => pickImages(setFieldValue)}
                      accessibilityLabel="Add product photos"
                    >
                      <View className="bg-primary-80 rounded-full p-3">
                        <Ionicons name="camera-outline" size={40} color="#fff" />
                      </View>
                      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-600 mt-2">Tap to add photos </Text>
                      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xs text-gray-500">Up to 5 images from camera or gallery</Text>
                    </TouchableOpacity>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {images.map((image: any, index: any) => (
                        <View key={index} className="mr-3 relative">
                          <Image
                            source={{ uri: image.uri }}
                            className="w-24 h-24 rounded-lg"
                            accessibilityLabel={`Product image ${index + 1}`}
                          />
                          <TouchableOpacity
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                            onPress={() => removeImage(index, setFieldValue)}
                            accessibilityLabel={`Remove image ${index + 1}`}
                          >
                            <Ionicons name="close-circle" size={24} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                    {touched.images && errors.images && (
                      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.images}</Text>
                    )}
                  </View>

                  <View className="bg-white rounded-lg p-4 mb-4 shadow-md" style={styles.shadow}>
                    {/* Product Name */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Product Name
                      </Text>
                      <TextInput
                        className="border border-gray-300 bg-gray-100 rounded-lg p-3 text-base text-gray-900"
                        placeholder="e.g., Butter Chicken"
                        placeholderTextColor="#6B7280"
                        onChangeText={handleChange('item_name')}
                        onBlur={handleBlur('item_name')}
                        value={values.item_name}
                        accessibilityLabel="Product name"
                      />
                      {touched.item_name && errors.item_name && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.item_name}</Text>
                      )}
                    </View>

                    {/* Description */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Description
                      </Text>
                      <TextInput
                        className="border border-gray-300 bg-gray-100 rounded-lg p-3 text-base text-gray-900 min-h-[100px]"
                        placeholder="Describe your product"
                        placeholderTextColor="#6B7280"
                        onChangeText={handleChange('description')}
                        onBlur={handleBlur('description')}
                        value={values.description}
                        multiline
                        textAlignVertical="top"
                        accessibilityLabel="Product description"
                      />
                      {touched.description && errors.description && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.description}</Text>
                      )}
                    </View>



                    {/* Stock Quantity */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Price
                      </Text>
                      <TextInput
                        className="border border-gray-300 bg-gray-100 rounded-lg p-3 text-base text-gray-900"
                        placeholder="Enter price"
                        placeholderTextColor="#6B7280"
                        onChangeText={handleChange('price')}
                        onBlur={handleBlur('price')}
                        value={values.price}
                        keyboardType="numeric"
                        accessibilityLabel="price"
                      />
                      {touched.price && errors.price && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.price}</Text>
                      )}
                    </View>

                    {/* Unit Picker */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Unit
                      </Text>
                      <View className="border border-gray-300 bg-gray-100 rounded-lg">
                        <Picker
                          selectedValue={values.unit}
                          onValueChange={value => setFieldValue('unit', value)}
                          style={{ color: '#374151' }}
                          accessibilityLabel="Select unit"
                        >
                          <Picker.Item label="Choose a unit" value="" />
                          {units.map((unit: any) => (
                            <Picker.Item
                              key={unit.id}
                              label={unit.name}
                              value={unit.id}
                            />
                          ))}
                        </Picker>
                      </View>
                      {touched.unit && errors.unit && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.unit}</Text>
                      )}
                    </View>

                    {/* Variants Section */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Product Variants
                      </Text>

                      {/* Button to open modal */}
                      <TouchableOpacity
                        className="bg-primary-100 rounded-lg p-3 items-center mb-3"
                        onPress={() => setModalVisible(true)}
                        accessibilityLabel="Add new variant"
                      >
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-sm ">Add Variant ➕</Text>
                      </TouchableOpacity>

                      {/* Modal for adding variants */}
                      <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                      >
                        <View className="flex-1 justify-center items-center bg-black/50">
                          <View className="bg-white rounded-lg p-6 w-11/12" style={styles.shadow}>
                            <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-lg text-gray-900 mb-4">
                              Add New Variant
                            </Text>
                            <View className='flex-row items-center gap-2'>

                              <TextInput
                                className="border border-gray-300 w-[48%] bg-gray-100 rounded-lg p-3 mb-3 text-base text-gray-900"
                                placeholder="Variant (e.g., Small)"
                                placeholderTextColor="#6B7280"
                                value={newVariant.name}
                                onChangeText={text => setNewVariant({ ...newVariant, name: text })}
                                accessibilityLabel="Variant name"
                              />

                              <TextInput
                                className="border border-gray-300 w-[48%] bg-gray-100 rounded-lg p-3 mb-3 text-base text-gray-900"
                                placeholder="Enter price"
                                placeholderTextColor="#6B7280"
                                value={newVariant.price}
                                onChangeText={text => setNewVariant({ ...newVariant, price: text })}
                                keyboardType="numeric"
                                accessibilityLabel="Variant additional price"
                              />
                            </View>

                            <View className="flex-row justify-end gap-3">
                              <TouchableOpacity
                                className="bg-gray-300 rounded-lg p-3"
                                onPress={() => {
                                  setNewVariant({ name: '', price: '' });
                                  setModalVisible(false);
                                }}
                                accessibilityLabel="Cancel adding variant"
                              >
                                <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-gray-900">Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                className="bg-primary-100 rounded-lg p-3 px-4"
                                onPress={() => handleAddVariant(setFieldValue, values)}
                                accessibilityLabel="Save variant"
                              >
                                <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white">Save</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Modal>

                      {/* Display added variants */}
                      {values.variants.length > 0 ? (
                        <View className="mt-3">
                          <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-sm text-gray-700 mb-2">
                            Added Variants:
                          </Text>
                          {values.variants.map((variant: any, index: number) => (
                            <View
                              key={index}
                              className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3 mb-2"
                            >
                              <View className='flex-row  gap-2 items-center justify-between w-3/4'>
                                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-900">{variant.name}</Text>
                                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">
                                  ₹{variant.price}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => {
                                  const newVariants = values.variants.filter((_: any, i: number) => i !== index);
                                  setFieldValue('variants', newVariants);
                                }}
                                accessibilityLabel={`Remove variant ${variant.name}`}
                              >
                                <MaterialIcons name="delete" size={24} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-500">No variants added yet.</Text>
                      )}

                      {touched.variants && errors.variants && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.variants}</Text>
                      )}
                    </View>


                    {/* Stock Quantity */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Stock Quantity
                      </Text>
                      <TextInput
                        className="border border-gray-300 bg-gray-100 rounded-lg p-3 text-base text-gray-900"
                        placeholder="Enter stock quantity"
                        placeholderTextColor="#6B7280"
                        onChangeText={handleChange('stock_quantity')}
                        onBlur={handleBlur('stock_quantity')}
                        value={values.stock_quantity}
                        keyboardType="numeric"
                        accessibilityLabel="Stock quantity"
                      />
                      {touched.stock_quantity && errors.stock_quantity && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.stock_quantity}</Text>
                      )}
                    </View>

                    {/* Category Picker */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Category
                      </Text>
                      <View className="border border-gray-300 bg-gray-100 rounded-lg">
                        <Picker
                          selectedValue={values.category_id}
                          onValueChange={value => setFieldValue('category_id', value)}
                          style={{ color: '#374151' }}
                          accessibilityLabel="Select category"
                        >
                          <Picker.Item label="Choose a category" value="" />
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
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.category_id}</Text>
                      )}
                    </View>

                    {/* Food Type */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Food Type
                      </Text>
                      <View className="border border-gray-300 bg-gray-100 rounded-lg">
                        <Picker
                          selectedValue={values.isVegetarian}
                          onValueChange={value => setFieldValue('isVegetarian', value)}
                          style={{ color: '#374151' }}
                          accessibilityLabel="Select food type"
                        >
                          <Picker.Item label="Choose food type" value="" />
                          <Picker.Item label="Non-Veg 🍖" value="1" />
                          <Picker.Item label="Veg 🥕" value="0" />
                        </Picker>
                      </View>
                      {touched.isVegetarian && errors.isVegetarian && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.isVegetarian}</Text>
                      )}
                    </View>

                    {/* Food Type */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Preparation Time
                      </Text>
                      <View className="border border-gray-300 bg-gray-100 rounded-lg">
                        <Picker
                          selectedValue={values.preparation_time}
                          onValueChange={value => setFieldValue('preparation_time', value)}
                          style={{ color: '#374151' }}
                          accessibilityLabel="Select preparation time"
                        >
                          <Picker.Item label="Choose preparation time" value="" />
                          <Picker.Item label="15 minutes" value="15" />
                          <Picker.Item label="30 minutes" value="30" />
                          <Picker.Item label="1 hour" value="60" />
                          <Picker.Item label="2 hours" value="120" />
                        </Picker>
                      </View>
                      {touched.preparation_time && errors.preparation_time && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.preparation_time}</Text>
                      )}
                    </View>


                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base  text-gray-900 mb-2">
                        Tax (if applicable)
                      </Text>
                      <View className="border border-gray-300 bg-gray-100 rounded-lg">
                        <Picker
                          selectedValue={values.tax}
                          onValueChange={value => setFieldValue('tax', value)}
                          style={{ color: '#374151' }}
                          accessibilityLabel="Select tax"
                        >
                          <Picker.Item label="Choose tax" value="" />
                          {dynamicTaxes?.map((tax: any) => (
                            <Picker.Item label={tax?.name + " (" + tax?.rate + `${tax?.type === 'percentage' && "%"}` + ")"} value={tax?.id} />
                          ))}
                        </Picker>
                      </View>
                      {touched.tax && errors.tax && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.tax}</Text>
                      )}
                    </View>

                    {/* Tags */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Tags
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {tags?.length > 0 && tags.map(tag => (
                          <TouchableOpacity
                            key={tag.id}
                            className={`rounded-full px-3 py-2 flex-row items-center justify-center gap-1 ${values.tags.includes(tag.id) ? 'bg-primary-100' : 'bg-gray-100'}`}
                            onPress={() => {
                              const newTags = values.tags.includes(tag.id)
                                ? values.tags.filter((t: string) => t !== tag.id)
                                : [...values.tags, tag.id];
                              console.log(newTags, tag.id, tag)
                              setFieldValue('tags', newTags);
                            }}
                            accessibilityLabel={`Toggle ${tag.name} tag`}
                          >
                            <Image source={tag?.image ? { uri: IMAGE_URL + tag?.image } : ImagePath.banner} className='w-4 h-4' resizeMode='contain' />

                            <Text style={{ fontFamily: 'Raleway-Regular' }} className={`text-sm font-medium ${values.tags.includes(tag.id) ? 'text-white' : 'text-gray-800'}`}>{tag.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {touched.tags && errors.tags && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.tags}</Text>
                      )}
                    </View>

                    {/* Status Switch */}
                    <View className="mb-4">
                      <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-900 mb-2">
                        Status
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className='flex-row items-center gap-3'>
                          <View className={`${values?.status ? "bg-green-500" : "bg-red-400"} w-4 h-4 rounded-full `} />
                          <Text style={{ fontFamily: 'Raleway-SemiBold' }} className='text-lg'>{values?.status ? "Live" : "Offline"}</Text>
                        </View>
                        <Switch
                          value={values.status}
                          onValueChange={(value: any) => setFieldValue('status', value)}
                          trackColor={{ false: '#EF4444', true: '#10B981' }}
                          thumbColor="#f4f3f4"
                          accessibilityLabel="Toggle product status"
                          size="small"
                        />
                      </View>
                      {touched.status && errors.status && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.status}</Text>
                      )}
                    </View>
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    className={`rounded-lg p-4 items-center my-4 ${isSubmitting ? 'bg-primary-90' : 'bg-primary-100'}`}
                    accessibilityLabel={productId ? 'Update product' : 'Save product'}
                  >
                    <Text style={{ fontFamily: 'Raleway-BoldF' }} className="text-white text-base">
                      {isSubmitting ? 'Saving... ' : (productId ? 'Update Product ' : 'Save Product ')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Tailwind-inspired styles
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 5.84,
    elevation: 2,
    backgroundColor: '#fff',
  },
});

export default AddProductScreen;