import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {ToastAndroid} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {Fetch, Post, Put, Delete, IMAGE_URL} from '../../utils/apiUtils';
import {loadingSpinner} from '../otherScreen/LoadingComponent';

// Define types for better type safety
interface Category {
  id: string;
  name: string;
  image: string;
  status: number;
}

interface Product {
  id: string;
  item_name: string;
  images: {url: string}[];
  category: {name: string};
  price: number;
  stock_quantity: number;
  unit: string;
  status: number;
}

interface ConfirmAction {
  type: 'category' | 'product';
  id: string;
  name: string;
}

// Validation schema for category form
const CategorySchema = Yup.object().shape({
  categoryName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Category name is required'),
  categoryImage: Yup.mixed().required('Image is required'), // Simplified to avoid Hermes issues
});

// Function to fetch categories with retry logic
const fetchCategories = async (
  setLoading: (loading: boolean) => void,
  retries = 3,
): Promise<Category[]> => {
  try {
    setLoading(true);
    const response: any = await Fetch('/user/categories', {}, 5000);
    if (!response.success) throw new Error('Failed to fetch categories');
    console.log('Fetched categories:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('fetchCategories error:', error.message); // Debug log
    // if (retries > 0) {
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    //   return fetchCategories(setLoading, retries - 1);
    // }
    ToastAndroid.show(
      error?.message || 'Failed to load categories.',
      ToastAndroid.SHORT,
    );
    return [];
  } finally {
    setLoading(false);
  }
};

// Function to fetch products by category ID
const fetchProductsByCategory = async (
  categoryId: string,
  setLoading: (loading: boolean) => void,
): Promise<Product[]> => {
  try {
    setLoading(true);
    const response: any = await Fetch(
      `/user/menu-items?categoryId=${categoryId}`,
      {},
      5000,
    );
    if (!response.success) throw new Error('Failed to fetch products');
    console.log(
      'Fetched products for category',
      categoryId,
      ':',
      response.data,
    ); // Debug log
    return response.data.menu_items;
  } catch (error: any) {
    console.error('fetchProductsByCategory error:', error.message); // Debug log
    ToastAndroid.show(
      error?.message || 'Failed to load products.',
      ToastAndroid.SHORT,
    );
    return [];
  } finally {
    setLoading(false);
  }
};

// Function to toggle product status
const toggleProductStatus = async (
  id: string,
  currentStatus: boolean,
  setLoading: (loading: boolean) => void,
): Promise<any> => {
  try {
    setLoading(true);
    const response: any = await Fetch(
      `/user/menu-items/${id}/active-inactive`,
      {status: currentStatus ? 0 : 1},
      5000,
    );
    if (!response.success) throw new Error('Failed to toggle status');
    console.log('Toggled product status:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('toggleProductStatus error:', error.message); // Debug log
    ToastAndroid.show(
      error?.message || 'Failed to toggle status.',
      ToastAndroid.SHORT,
    );
    throw error;
  } finally {
    setLoading(false);
  }
};

// Function to delete product
const deleteProduct = async (
  id: string,
  setLoading: (loading: boolean) => void,
): Promise<any> => {
  try {
    setLoading(true);
    const response: any = await Delete(`/user/menu-items/${id}`, {});
    if (!response.success) throw new Error('Failed to delete product');
    console.log('Deleted product:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('deleteProduct error:', error.message); // Debug log
    ToastAndroid.show(
      error?.message || 'Failed to delete product.',
      ToastAndroid.SHORT,
    );
    throw error;
  } finally {
    setLoading(false);
  }
};

const ManageStockScreen = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [products, setProducts] = useState<{[key: string]: Product[]}>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [productLoading, setProductLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [polling, setPolling] = useState<boolean>(true);
  const [confirmModalVisible, setConfirmModalVisible] =
    useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  // Formik setup for category modal form
  const formik: any = useFormik({
    initialValues: {
      categoryName: editingCategory?.name || '',
      categoryImage: editingCategory?.image
        ? {
            uri: `${IMAGE_URL}${editingCategory.image}`,
            isServerImage: true,
          }
        : null,
      status: editingCategory ? !!editingCategory.status : true,
    },
    validationSchema: CategorySchema,
    enableReinitialize: true,
    onSubmit: async (values: any, {resetForm}) => {
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', values.categoryName);
        formData.append('status', values.status ? '1' : '0');
        if (values.categoryImage && !values.categoryImage.isServerImage) {
          formData.append('image', {
            uri: values.categoryImage.uri,
            type: values.categoryImage.type || 'image/jpeg',
            name: values.categoryImage.fileName || 'category_image.jpg',
          });
        }
        if (editingCategory) {
          formData.append('_method', 'PUT');
        }
        console.log(values);
        const response: any = editingCategory
          ? await Post(`/user/categories/${editingCategory.id}`, formData, 5000)
          : await Post('/user/categories', formData, 5000);

        console.log(response);
        if (!response.success) throw new Error('Failed to save category');

        const updatedCategories = await fetchCategories(setIsLoading);
        setCategories(updatedCategories);
        setModalVisible(false);
        setEditingCategory(null);
        resetForm();
        ToastAndroid.show(
          editingCategory
            ? 'Category updated successfully'
            : 'Category added successfully',
          ToastAndroid.SHORT,
        );
      } catch (error: any) {
        console.error('Category form submission error:', error.message); // Debug log
        ToastAndroid.show(
          error?.message || 'Failed to save category.',
          ToastAndroid.SHORT,
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Debug Formik values
  useEffect(() => {
    console.log('Formik Values:', formik.values);
    console.log('Formik Errors:', formik.errors);
  }, [formik.values, formik.errors]);

  // Image selection
  const selectImage = useCallback(() => {
    launchImageLibrary(
      {mediaType: 'photo', maxHeight: 200, maxWidth: 200, quality: 0.8},
      response => {
        if (response.didCancel) {
          console.log('Image selection cancelled'); // Debug log
          return;
        }
        if (response.errorCode) {
          console.error('Image Picker Error:', response.errorMessage); // Debug log
          ToastAndroid.show('Error selecting image', ToastAndroid.SHORT);
          return;
        }
        const asset = response.assets?.[0];
        if (!asset) {
          console.error('No asset found in response:', response); // Debug log
          ToastAndroid.show('No image selected', ToastAndroid.SHORT);
          return;
        }
        formik.setFieldValue('categoryImage', {
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          isServerImage: false, // flag to indicate it's a new image
        });
        formik.setFieldTouched('categoryImage', true);
        console.log('Selected image:', asset); // Debug log
      },
    );
  }, [formik]);

  // Remove selected image
  const removeImage = useCallback(() => {
    formik.setFieldValue('categoryImage', null);
    formik.setFieldTouched('categoryImage', false);
    console.log('Image removed'); // Debug log
  }, [formik]);

  // Load categories and set default selected category
  const loadCategories = useCallback(async () => {
    const categoryData = await fetchCategories(setIsLoading);
    setCategories(categoryData);
    if (categoryData.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryData[0]);
      console.log('Default category selected:', categoryData[0]); // Debug log
    }
  }, [selectedCategory]);

  // Load products for selected category
  const loadProducts = useCallback(async () => {
    if (selectedCategory?.id) {
      const productData = await fetchProductsByCategory(
        selectedCategory.id,
        setIsLoading,
      );
      setProducts((prev: any) => ({
        ...prev,
        [selectedCategory.name]: productData,
      }));
      console.log('Loaded products for category:', selectedCategory.name); // Debug log
    }
  }, [selectedCategory]);

  // Polling for real-time updates
  useEffect(() => {
    loadCategories();
    // const interval = setInterval(() => {
    //   if (polling) loadCategories();
    // }, 30000);
    // return () => clearInterval(interval);
  }, [loadCategories]);

  // Fetch products when selectedCategory changes
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, loadProducts]);

  // Handle category edit
  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
    console.log('Opening modal for editing category:', category); // Debug log
  }, []);

  // Handle category deletion
  const handleDeleteCategory = useCallback(
    (categoryId: string, categoryName: string) => {
      setConfirmAction({type: 'category', id: categoryId, name: categoryName});
      setConfirmModalVisible(true);
      console.log('Initiating category deletion:', categoryName); // Debug log
    },
    [],
  );

  // Handle product status toggle with optimistic update
  const handleToggleStatus = useCallback(
    async (productId: string, currentStatus: boolean) => {
      const originalProducts = {...products};
      setProducts((prev: any) => ({
        ...prev,
        [selectedCategory!.name]: prev[selectedCategory!.name].map(
          (item: Product) =>
            item.id === productId
              ? {...item, status: currentStatus ? 0 : 1}
              : item,
        ),
      }));
      setProductLoading((prev: any) => ({...prev, [productId]: true}));

      try {
        await toggleProductStatus(
          productId,
          currentStatus,
          (loading: boolean) =>
            setProductLoading((prev: any) => ({...prev, [productId]: loading})),
        );
        ToastAndroid.show('Status updated successfully', ToastAndroid.SHORT);
      } catch (error: any) {
        console.error('Toggle status error, reverting:', error.message); // Debug log
        setProducts(originalProducts);
      }
    },
    [products, selectedCategory],
  );

  // Handle product deletion
  const handleDeleteProduct = useCallback(
    async (productId: string, productName: string) => {
      setConfirmAction({type: 'product', id: productId, name: productName});
      setConfirmModalVisible(true);
      console.log('Initiating product deletion:', productName); // Debug log
    },
    [],
  );

  // Handle confirmation modal action
  const handleConfirmDelete = useCallback(async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'category') {
      try {
        setIsLoading(true);
        const response: any = await Delete(
          `/user/categories/${confirmAction.id}`,
          {},
          undefined,
          5000,
        );
        if (!response.success) throw new Error('Failed to delete category');

        setCategories((prev: Category[]) =>
          prev.filter((cat: Category) => cat.id !== confirmAction.id),
        );
        if (selectedCategory?.id === confirmAction.id)
          setSelectedCategory(null);
        ToastAndroid.show('Category deleted successfully', ToastAndroid.SHORT);
        console.log('Category deleted:', confirmAction.name); // Debug log
      } catch (error: any) {
        console.error('Delete category error:', error.message); // Debug log
        ToastAndroid.show(
          error?.message || 'Failed to delete category.',
          ToastAndroid.SHORT,
        );
      } finally {
        setIsLoading(false);
      }
    } else if (confirmAction.type === 'product') {
      const originalProducts = {...products};
      setProductLoading((prev: any) => ({...prev, [confirmAction.id]: true}));
      try {
        setProducts((prev: any) => ({
          ...prev,
          [selectedCategory!.name]: prev[selectedCategory!.name].filter(
            (item: Product) => item.id !== confirmAction.id,
          ),
        }));
        await deleteProduct(confirmAction.id, (loading: boolean) =>
          setProductLoading((prev: any) => ({
            ...prev,
            [confirmAction.id]: loading,
          })),
        );
        ToastAndroid.show('Product deleted successfully', ToastAndroid.SHORT);
        console.log('Product deleted:', confirmAction.name); // Debug log
      } catch (error: any) {
        console.error('Delete product error, reverting:', error.message); // Debug log
        setProducts(originalProducts);
      }
    }

    setConfirmModalVisible(false);
    setConfirmAction(null);
  }, [confirmAction, products, selectedCategory]);

  // Cancel confirmation modal
  const handleCancelDelete = useCallback(() => {
    setConfirmModalVisible(false);
    setConfirmAction(null);
    console.log('Delete action cancelled'); // Debug log
  }, []);

  const renderCategoryItem = ({item}: {item: Category}) => (
    <View className="items-center p-1 bg-gray-100 m-2 rounded-xl">
      <TouchableOpacity
        onPress={() => setSelectedCategory(item)}
        disabled={isLoading}>
        {/* Image Wrapper with Overlay */}
        <View className="relative">
          <Image
            source={{uri: `${IMAGE_URL}${item?.image}`}}
            resizeMode="stretch"
            className="h-32 w-32 rounded-xl mb-1"
          />
          {/* Overlay */}
          <View className="absolute top-0 left-0 h-32 w-32 rounded-xl bg-black opacity-40" />

          {/* Text Over Image */}
          <Text className="absolute bottom-2 left-2 right-2 text-white text-lg font-medium">
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Edit/Delete Buttons */}
      <View className="flex-col justify-between gap-0 absolute top-0 right-0">
        <TouchableOpacity
          onPress={() => handleEditCategory(item)}
          className="p-2 bg-white rounded-t-lg rounded-tl-none"
          disabled={isLoading}>
          <Icon name="edit" size={20} color={'#B68AD4'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteCategory(item.id, item.name)}
          className="p-2 bg-white rounded-b-3xl rounded-br-none"
          disabled={isLoading}>
          <Icon name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductItem = ({item}: {item: Product}) => (
    <View className="flex-row bg-gray-100 rounded-xl p-4 mb-4 shadow-sm">
      <TouchableOpacity
        className="w-2/5 mr-3 items-center"
        onPress={() =>
          navigation.navigate('ProductDetailsScreen', {productId: item?.id})
        }>
        <Image
          source={{uri: `${IMAGE_URL}${item?.images[0]?.url}`}}
          className="w-full h-28 rounded-2xl mb-2"
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">
          {item.item_name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">
            {item?.category?.name} •
          </Text>
          <Text className="text-md font-bold">{item.price}</Text>
        </View>
        <Text className="text-sm text-gray-600 mt-1">
          {item?.stock_quantity} {item?.unit}
        </Text>
        <View className="flex-row items-center justify-between gap-2 mt-2">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddProductScreen', {productId: item.id})
            }
            className="bg-primary-90 flex-row items-center gap-2 px-3 py-2 rounded-lg">
            <Icon name="edit" color="white" />
            <Text className="text-white text-md font-medium">Edit Item</Text>
          </TouchableOpacity>
          <View className="flex-col justify-start items-center">
            <Text className="text-xs text-gray-500">Status</Text>
            {productLoading[item.id] ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <Switch
                value={item.status === 1}
                onValueChange={() =>
                  handleToggleStatus(item.id, item.status === 1)
                }
                disabled={productLoading[item.id]}
              />
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteProduct(item.id, item.item_name)}
          className="rounded-lg absolute top-0 right-0"
          disabled={productLoading[item.id]}>
          <Icon name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {isLoading && loadingSpinner}
      <View className="flex-row items-center p-4 border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 absolute top-1">
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-center w-full text-xl">Manage Stocks</Text>
      </View>

      {/* Add Category Button */}
      <View className="p-4 py-1">
        <TouchableOpacity
          onPress={() => {
            setEditingCategory(null);
            formik.resetForm();
            setModalVisible(true);
            console.log('Opening modal for new category'); // Debug log
          }}
          className="bg-primary-90 p-4 rounded-xl"
          disabled={isLoading}>
          <Text className="text-white text-center font-medium">
            Add New Category
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingCategory(null);
          formik.resetForm();
          console.log('Closing category modal'); // Debug log
        }}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-11/12">
            <Text className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2"
              placeholder="Enter category name"
              value={formik.values.categoryName}
              onChangeText={formik.handleChange('categoryName')}
              onBlur={formik.handleBlur('categoryName')}
              editable={!isLoading}
            />
            {formik.touched.categoryName && formik.errors.categoryName && (
              <Text className="text-red-500 text-sm mb-2">
                {formik.errors.categoryName}
              </Text>
            )}
            <TouchableOpacity
              onPress={selectImage}
              className="border border-gray-300 border-dashed rounded p-2 mb-2"
              disabled={isLoading}>
              <Text className="text-center">
                {formik.values.categoryImage ? 'Change Image' : 'Select Image'}
              </Text>
            </TouchableOpacity>
            {/* ✅ Unified Image Preview Logic */}
            {formik.values.categoryImage?.uri && (
              <View className="mb-2 relative">
                <Image
                  source={{uri: formik.values.categoryImage.uri}}
                  className="h-44 rounded"
                  resizeMode="contain"
                />
                <TouchableOpacity
                  onPress={removeImage}
                  className="bg-red-500 p-1 absolute right-0 top-0 rounded-full"
                  disabled={isLoading}>
                  <Icon name="close" size={15} color="white" />
                </TouchableOpacity>
              </View>
            )}
            {formik.touched.categoryImage && formik.errors.categoryImage && (
              <Text className="text-red-500 text-sm mb-2">
                {formik.errors.categoryImage}
              </Text>
            )}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base">
                Status: {formik.values.status ? 'Active' : 'Inactive'}
              </Text>
              <Switch
                value={formik.values.status}
                onValueChange={value => formik.setFieldValue('status', value)}
                disabled={isLoading}
              />
            </View>
            <TouchableOpacity
              onPress={() => formik.handleSubmit()}
              className={`bg-primary-90 p-4 rounded-xl ${
                isLoading ? 'opacity-50' : ''
              }`}
              disabled={isLoading}>
              <Text className="text-white text-center font-medium">
                {isLoading
                  ? 'Saving...'
                  : editingCategory
                  ? 'Update Category'
                  : 'Add Category'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setEditingCategory(null);
                formik.resetForm();
              }}
              className="bg-white border border-gray-500 p-4 rounded-xl mt-2"
              disabled={isLoading}>
              <Text className="text-center font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={handleCancelDelete}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-11/12">
            <Text className="text-xl font-bold mb-2">
              Delete{' '}
              {confirmAction?.type === 'category' ? 'Category' : 'Product'}
            </Text>
            <Text className="text-base mb-4">
              Are you sure you want to delete "{confirmAction?.name}"?
            </Text>
            <View className="flex-row justify-between gap-2">
              <TouchableOpacity
                onPress={handleCancelDelete}
                className="flex-1 bg-white border border-gray-500 p-4 rounded-xl"
                disabled={isLoading}>
                <Text className="text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                className={`flex-1 bg-red-500 p-4 rounded-xl ${
                  isLoading ? 'opacity-50' : ''
                }`}
                disabled={isLoading}>
                <Text className="text-white text-center font-medium">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category List */}
      <View className="px-4">
        <Text className="text-xl font-bold mb-1">Categories</Text>
        {isLoading && !categories.length ? (
          <Text className="text-gray-500">Loading categories...</Text>
        ) : categories.length === 0 ? (
          <Text className="text-gray-500">No categories added yet</Text>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      {/* Product List */}
      {selectedCategory && (
        <View className="mt-4 flex-1">
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-xl font-bold ">
              Products in {selectedCategory.name}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AddProductScreen', {
                  categoryId: selectedCategory.id,
                })
              }
              className="bg-primary-90 p-2 w-10 h-10 rounded-lg flex-row justify-center items-center">
              <Icon name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          {isLoading && !products[selectedCategory.name]?.length ? (
            <Text className="text-gray-500 px-4">Loading products...</Text>
          ) : products[selectedCategory.name]?.length > 0 ? (
            <FlatList
              data={products[selectedCategory.name]}
              renderItem={renderProductItem}
              keyExtractor={item => item.id}
              className="px-4 mt-2"
              nestedScrollEnabled={true}
            />
          ) : (
            <Text className="text-gray-500 px-4">
              No products in this category
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ManageStockScreen;
