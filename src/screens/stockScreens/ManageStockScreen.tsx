import React, { useState, useEffect, useCallback } from 'react';
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
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastAndroid } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { Fetch, Post, Delete, IMAGE_URL } from '../../utils/apiUtils';
import { loadingSpinner } from '../otherScreen/LoadingComponent';

// Define types
interface Category {
  id: string;
  name: string;
  image: string;
  status: number;
}

interface Product {
  id: string;
  item_name: string;
  images: { url: string }[];
  category: { name: string };
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

// Validation schema
const CategorySchema = Yup.object().shape({
  categoryName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Category name is required'),
});

// API functions
const fetchCategories = async (setLoading: (loading: boolean) => void): Promise<Category[]> => {
  try {
    setLoading(true);
    const response: any = await Fetch('/user/categories', {}, 5000);
    if (!response.success) throw new Error('Failed to fetch categories');
    return response.data;
  } catch (error: any) {
    ToastAndroid.show(error?.message || 'Failed to load categories.', ToastAndroid.SHORT);
    return [];
  } finally {
    setLoading(false);
  }
};

const fetchProductsByCategory = async (
  categoryId: string,
  setLoading: (loading: boolean) => void,
): Promise<Product[]> => {
  try {
    setLoading(true);
    const response: any = await Fetch(`/user/menu-items`, { category_id: categoryId }, 5000);
    if (!response.success) throw new Error('Failed to fetch products');
    return response.data.menu_items;
  } catch (error: any) {
    ToastAndroid.show(error?.message || 'Failed to load products.', ToastAndroid.SHORT);
    return [];
  } finally {
    setLoading(false);
  }
};

const toggleProductStatus = async (
  id: string,
  currentStatus: boolean,
  setLoading: (loading: boolean) => void,
): Promise<any> => {
  try {
    setLoading(true);
    const response: any = await Fetch(
      `/user/menu-items/${id}/active-inactive`,
      { status: currentStatus ? 0 : 1 },
      5000,
    );
    if (!response.success) throw new Error('Failed to toggle status');
    return response.data;
  } catch (error: any) {
    ToastAndroid.show(error?.message || 'Failed to toggle status.', ToastAndroid.SHORT);
    throw error;
  } finally {
    setLoading(false);
  }
};

const deleteProduct = async (
  id: string,
  setLoading: (loading: boolean) => void,
): Promise<any> => {
  try {
    setLoading(true);
    const response: any = await Delete(`/user/menu-items/${id}`, {});
    if (!response.success) throw new Error('Failed to delete product');
    return response.data;
  } catch (error: any) {
    ToastAndroid.show(error?.message || 'Failed to delete product.', ToastAndroid.SHORT);
    throw error;
  } finally {
    setLoading(false);
  }
};

const ManageStockScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [productLoading, setProductLoading] = useState<{ [key: string]: boolean }>({});
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      categoryName: editingCategory?.name || '',
      categoryImage: editingCategory?.image
        ? { uri: `${IMAGE_URL}${editingCategory.image}`, isServerImage: true }
        : null,
      status: editingCategory ? !!editingCategory.status : true,
    },
    validationSchema: CategorySchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsSubmitting(true);
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

        const response: any = editingCategory
          ? await Post(`/user/categories/${editingCategory.id}`, formData, 5000)
          : await Post('/user/categories', formData, 5000);

        if (!response.success) throw new Error('Failed to save category');

        const updatedCategories = await fetchCategories(setIsLoading);
        setCategories(updatedCategories);
        setModalVisible(false);
        setEditingCategory(null);
        resetForm();
        ToastAndroid.show(
          editingCategory ? 'Category updated successfully' : 'Category added successfully',
          ToastAndroid.SHORT,
        );
      } catch (error: any) {
        ToastAndroid.show(error?.message || 'Failed to save category.', ToastAndroid.SHORT);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Image selection
  const selectImage = useCallback(() => {
    launchImageLibrary(
      { mediaType: 'photo', maxHeight: 200, maxWidth: 200, quality: 0.8 },
      response => {
        if (response.didCancel || response.errorCode || !response.assets?.[0]) {
          ToastAndroid.show('Image selection failed', ToastAndroid.SHORT);
          return;
        }
        const asset = response.assets[0];
        formik.setFieldValue('categoryImage', {
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          isServerImage: false,
        });
        formik.setFieldTouched('categoryImage', true);
      },
    );
  }, [formik]);

  // Remove selected image
  const removeImage = useCallback(() => {
    formik.setFieldValue('categoryImage', null);
    formik.setFieldTouched('categoryImage', false);
  }, [formik]);

  // Load categories
  const loadCategories = useCallback(async () => {
    const categoryData = await fetchCategories(setIsLoading);
    setCategories(categoryData);
    if (categoryData.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryData[0]);
    }
  }, [selectedCategory]);

  // Load products
  const loadProducts = useCallback(async () => {
    if (selectedCategory?.id) {
      const productData = await fetchProductsByCategory(selectedCategory.id, setIsLoading);
      setProducts(productData);
    }
  }, [selectedCategory]);

  // Handle data fetching
  useEffect(() => {
    if (isFocused) {
      loadCategories();
    }
  }, [isFocused, loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, loadProducts]);

  // Handlers
  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  }, []);

  const handleDeleteCategory = useCallback((categoryId: string, categoryName: string) => {
    setConfirmAction({ type: 'category', id: categoryId, name: categoryName });
    setConfirmModalVisible(true);
  }, []);

  const handleToggleStatus = useCallback(
    async (productId: string, currentStatus: boolean) => {
      const originalProducts = [...products];
      setProducts(products.map(item =>
        item.id === productId ? { ...item, status: currentStatus ? 0 : 1 } : item
      ));
      setProductLoading(prev => ({ ...prev, [productId]: true }));

      try {
        await toggleProductStatus(productId, currentStatus, (loading: boolean) =>
          setProductLoading(prev => ({ ...prev, [productId]: loading }))
        );
        ToastAndroid.show('Status updated successfully', ToastAndroid.SHORT);
      } catch {
        setProducts(originalProducts);
      }
    },
    [products]
  );

  const handleDeleteProduct = useCallback((productId: string, productName: string) => {
    setConfirmAction({ type: 'product', id: productId, name: productName });
    setConfirmModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'category') {
      try {
        setIsLoading(true);
        const response: any = await Delete(`/user/categories/${confirmAction.id}`, {});
        if (!response.success) throw new Error('Failed to delete category');
        setCategories(prev => prev.filter(cat => cat.id !== confirmAction.id));
        if (selectedCategory?.id === confirmAction.id) setSelectedCategory(null);
        ToastAndroid.show('Category deleted successfully', ToastAndroid.SHORT);
      } catch (error: any) {
        ToastAndroid.show(error?.message || 'Failed to delete category.', ToastAndroid.SHORT);
      } finally {
        setIsLoading(false);
      }
    } else if (confirmAction.type === 'product') {
      const originalProducts = [...products];
      setProductLoading(prev => ({ ...prev, [confirmAction.id]: true }));
      try {
        setProducts(prev => prev.filter(item => item.id !== confirmAction.id));
        await deleteProduct(confirmAction.id, (loading: boolean) =>
          setProductLoading(prev => ({ ...prev, [confirmAction.id]: loading }))
        );
        ToastAndroid.show('Product deleted successfully', ToastAndroid.SHORT);
      } catch {
        setProducts(originalProducts);
      }
    }

    setConfirmModalVisible(false);
    setConfirmAction(null);
  }, [confirmAction, products, selectedCategory]);

  const handleCancelDelete = useCallback(() => {
    setConfirmModalVisible(false);
    setConfirmAction(null);
  }, []);

  // Render functions
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View className="items-center p-2 bg-gray-100 m-2 rounded-xl shadow-md">
      <TouchableOpacity
        onPress={() => setSelectedCategory(item)}
        disabled={isLoading}
        className="relative"
      >
        <Image
          source={{ uri: `${IMAGE_URL}${item.image}` }}
          resizeMode="cover"
          className="h-32 w-32 rounded-xl"
        />
        <View className="absolute inset-0 bg-black/40 rounded-xl" />
        <Text className="absolute bottom-2 left-2 right-2 text-white text-lg font-semibold text-center">
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View className="flex-row bg-gray-100 rounded-xl p-4 mb-3 mx-4 shadow-sm">
      <TouchableOpacity
        className="w-2/5 mr-3"
        onPress={() => navigation.navigate('ProductDetailsScreen', { productId: item.id })}
      >
        <Image
          source={{ uri: `${IMAGE_URL}${item.images[0]}` }}
          className="w-full h-36 rounded-xl"
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.item_name}</Text>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-500">{item.category.name}</Text>
          <Text className="text-md font-bold">${item.price}</Text>
        </View>
        <Text className="text-sm text-gray-600 mt-1">{item.stock_quantity} {item.unit}</Text>
        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity
            onPress={() => navigation.navigate('AddProductScreen', { productId: item.id })}
            className="bg-blue-500 flex-row items-center px-3 py-2 rounded-lg"
          >
            <Icon name="edit" size={16} color="white" />
            <Text className="text-white font-medium ml-1">Edit</Text>
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-xs text-gray-500">Status</Text>
            {productLoading[item.id] ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <Switch
                value={item.status === 1}
                onValueChange={() => handleToggleStatus(item.id, item.status === 1)}
                disabled={productLoading[item.id]}
              />
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteProduct(item.id, item.item_name)}
          className="absolute top-2 right-2"
          disabled={productLoading[item.id]}
        >
          <Icon name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {isLoading && loadingSpinner}
      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 absolute left-2"
        >
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold">Your Inventory 📦</Text>
          <Text className="text-gray-500">Update in real-time, stay stocked</Text>
        </View>
      </View>


      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={handleCancelDelete}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-11/12">
            <Text className="text-xl font-bold mb-2">
              Delete {confirmAction?.type === 'category' ? 'Category' : 'Product'}
            </Text>
            <Text className="text-base mb-4">
              Are you sure you want to delete "{confirmAction?.name}"?
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={handleCancelDelete}
                className="flex-1 bg-gray-200 p-3 rounded-lg mr-2"
                disabled={isLoading}
              >
                <Text className="text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                className={`flex-1 bg-red-500 p-3 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Summary Boxes */}
      <View className="flex-row justify-between px-4 py-4">
        <TouchableOpacity
          className="w-[48%] bg-yellow-100 rounded-xl p-4 items-center shadow-md"
          onPress={() => {
            const lowStockItems = products.filter(item => item.stock_quantity < 5);
            if (lowStockItems.length) {
              navigation.navigate('FilteredProductListScreen', {
                title: 'Low Stock',
                products: lowStockItems,
              });
            } else {
              ToastAndroid.show('No low stock items found.', ToastAndroid.SHORT);
            }
          }}
        >
          <Feather name="alert-triangle" size={30} color="orange" />
          <Text className="text-xl font-bold text-gray-800 mt-2">
            {products.filter(item => item.stock_quantity < 5).length}
          </Text>
          <Text className="text-sm text-gray-600">Low Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[48%] bg-red-100 rounded-xl p-4 items-center shadow-md"
          onPress={() => {
            const outOfStockItems = products.filter(item => item.stock_quantity === 0);
            if (outOfStockItems.length) {
              navigation.navigate('FilteredProductListScreen', {
                title: 'Out of Stock',
                products: outOfStockItems,
              });
            } else {
              ToastAndroid.show('No out of stock items found.', ToastAndroid.SHORT);
            }
          }}
        >
          <Feather name="x-circle" size={30} color="red" />
          <Text className="text-xl font-bold text-gray-800 mt-2">
            {products.filter(item => item.stock_quantity === 0).length}
          </Text>
          <Text className="text-sm text-gray-600">Out of Stock</Text>
        </TouchableOpacity>
      </View>


      {/* Categories Section */}
      <View className="px-4">
        <View className="flex-row justify-between items-center ">
          <Text className="text-xl font-bold">Categories</Text>
        </View>
        {isLoading && !categories.length ? (
          <Text className="text-gray-500">Loading categories...</Text>
        ) : categories.length === 0 ? (
          <Text className="text-gray-500">No categories added yet</Text>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          />
        )}
      </View>


      {/* Product List */}
      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-bold">
            Products in {selectedCategory?.name || 'Selected Category'}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddProductScreen', { categoryId: selectedCategory?.id })
            }
            className="bg-primary-100 p-2 rounded-lg"
          >
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text className="text-gray-500">No products in this category</Text>
        )}
      </View>
    </View>
  );
};

export default ManageStockScreen;