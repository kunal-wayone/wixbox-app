import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import { Post, Put, Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { ImagePath } from '../../constants/ImagePath'; // Assuming ImagePath is defined elsewhere

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  slug: Yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9-]+$/i, 'Slug must contain only alphanumeric characters and hyphens')
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug cannot exceed 100 characters'),
  content: Yup.string()
    .required('Content is required')
    .min(10, 'Content must be at least 10 characters'),
  excerpt: Yup.string()
    .required('Excerpt is required')
    .min(10, 'Excerpt must be at least 10 characters')
    .max(200, 'Excerpt cannot exceed 200 characters'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['published', 'draft'], 'Status must be either published or draft'),
});

const PostScreen = () => {
  const navigation = useNavigation();
  const route: any = useRoute();
  const postDetails = route.params?.postDetails || null;
  const [isFetching, setIsFetching] = React.useState(!!postDetails);
  const [fetchedPostDetails, setFetchedPostDetails] = React.useState(postDetails);
  const [image, setImage] = React.useState<string | null>(null);
  // Fetch post details if editing
  useEffect(() => {
    if (postDetails?.id) {
      const fetchPostDetails = async () => {
        try {
          setIsFetching(true);
          const response: any = await Fetch(`/user/posts/${postDetails.id}`, undefined, 5000);

          if (!response.success) {
            throw new Error('Failed to fetch post details');
          }

          const data = await response?.data;
          setFetchedPostDetails(data);
          setImage(IMAGE_URL + data.image || null);
        } catch (error: any) {
          ToastAndroid.show(
            error.message || 'Failed to load post details',
            ToastAndroid.LONG,
          );
        } finally {
          setIsFetching(false);
        }
      };

      fetchPostDetails();
    }
  }, [postDetails?.id]);

  // Image picker handler
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (!result.didCancel && result.assets) {
        setImage(result.assets[0].uri!);
      }
    } catch (error) {
      ToastAndroid.show('Error picking image', ToastAndroid.SHORT);
    }
  };

  // Remove image handler
  const removeImage = () => {
    setImage(null);
  };

  // API call handler
  const handleSavePost = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('slug', values.slug);
      formData.append('content', values.content);
      formData.append('excerpt', values.excerpt);
      formData.append('status', values.status);
      if (postDetails) {
        formData.append('_method', "PUT");
      }

      if (image) {
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'post_image.jpg',
        } as any);
      }

      const url = postDetails ? `/user/posts/${postDetails.id}` : '/user/posts';
      const method = postDetails ? Post : Post;
      const response: any = await method(url, formData, 5000);
      console.log(url, values, formData)
      if (!response?.success) {
        throw new Error('Failed to save post');
      }

      ToastAndroid.show(
        postDetails ? 'Post updated successfully!' : 'Post created successfully!',
        ToastAndroid.SHORT,
      );
      resetForm();
      setImage(null);
      navigation.goBack();
    } catch (error: any) {
      ToastAndroid.show(
        error.response?.data?.message || 'Something went wrong. Please try again.',
        ToastAndroid.LONG,
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
      {/* Loading Overlay */}
      {isFetching && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color="#B68AD4" />
          <Text style={{ color: '#fff', marginTop: 10, fontSize: 16 }}>
            Loading...
          </Text>
        </View>
      )}
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
        <View className="flex-row items-center border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 30,
              fontWeight: 'bold',
              fontFamily: 'Poppins',
              color: '#374151',
            }}
          >
            {postDetails ? 'Edit Post' : 'Create Post'}
          </Text>
          <Text
            style={{ textAlign: 'center', marginVertical: 8, color: '#4B5563' }}
          >
            {postDetails
              ? 'Update the post details below.'
              : 'Enter the post details to create a new post.'}
          </Text>

          <Formik
            initialValues={{
              title: fetchedPostDetails?.title || '',
              slug: fetchedPostDetails?.slug || '',
              content: fetchedPostDetails?.content || '',
              excerpt: fetchedPostDetails?.excerpt || '',
              status: fetchedPostDetails?.status || 'published',
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSavePost}
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
              <View style={{ marginTop: 16 }}>
                {/* Image Upload Container */}
                <View style={{ marginBottom: 12 }}>
                  {!image && <TouchableOpacity
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
                    onPress={pickImage}
                  >
                    <Image
                      source={ImagePath.uploadIcon}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                    <Text style={{ color: '#4B5563', marginTop: 8 }}>
                      {image ? 'Replace Image' : 'Add Image'}
                    </Text>
                  </TouchableOpacity>}

                  {/* Display Selected Image */}
                  {image && (
                    <View style={{ marginBottom: 8, alignItems: 'center' }}>
                      <Image
                        source={{ uri: image }}
                        resizeMode='stretch'
                        style={{ width: "100%", height: 200, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          borderRadius: 12,
                        }}
                        onPress={removeImage}
                      >
                        <Ionicons name="close" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Title */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Title
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
                    placeholder="Enter post title"
                    onChangeText={handleChange('title')}
                    onBlur={handleBlur('title')}
                    value={values.title}
                  />
                  {touched.title && errors.title && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.title}
                    </Text>
                  )}
                </View>

                {/* Slug */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Slug
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
                    placeholder="Enter post slug (e.g., post-123)"
                    onChangeText={handleChange('slug')}
                    onBlur={handleBlur('slug')}
                    value={values.slug}
                  />
                  {touched.slug && errors.slug && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.slug}
                    </Text>
                  )}
                </View>

                {/* Content */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Content
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      minHeight: 150,
                      textAlignVertical: 'top',
                    }}
                    placeholder="Enter post content"
                    onChangeText={handleChange('content')}
                    onBlur={handleBlur('content')}
                    value={values.content}
                    multiline
                  />
                  {touched.content && errors.content && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.content}
                    </Text>
                  )}
                </View>

                {/* Excerpt */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Short Description
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
                      textAlignVertical: 'top',
                    }}
                    placeholder="Enter post short description"
                    onChangeText={handleChange('excerpt')}
                    onBlur={handleBlur('excerpt')}
                    value={values.excerpt}
                    multiline
                  />
                  {touched.excerpt && errors.excerpt && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.excerpt}
                    </Text>
                  )}
                </View>

                {/* Status Switch */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Post Status
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Switch
                      value={values.status === 'published'}
                      onValueChange={value =>
                        setFieldValue('status', value ? 'published' : 'draft')
                      }
                      trackColor={{ false: '#D1D5DB', true: '#B68AD4' }}
                      thumbColor={values.status === 'published' ? '#fff' : '#f4f3f4'}
                    />
                    <Text style={{ marginLeft: 8, color: '#374151' }}>
                      {values.status === 'published' ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting || isFetching}
                  style={{
                    backgroundColor:
                      isSubmitting || isFetching ? '#B68AD480' : '#B68AD4',
                    padding: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 16,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : postDetails
                        ? 'Update Post'
                        : 'Create Post'}
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

export default PostScreen;