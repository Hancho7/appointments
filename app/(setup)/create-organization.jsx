// app/(setup)/create-organization.jsx
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  IconButton,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { authService } from '../../src/api/authService';
import { loginFailure, loginStart, loginSuccess } from '../../src/store/slices/auth/loginSlice';
import { setOrganization } from '../../src/store/slices/organizationSlice';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Organization name must be at least 2 characters')
    .required('Organization name is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  address: Yup.string()
    .required('Address is required'),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

export default function CreateOrganizationScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const [logo, setLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permissions are required to select an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLogo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    dispatch(loginStart());
    
    try {
      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add organization data
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('address', values.address);
      formData.append('phone', values.phone);
      formData.append('email', values.email);
      
      // Add logo if selected
      if (logo) {
        const logoFile = {
          uri: logo,
          type: 'image/jpeg',
          name: 'logo.jpg',
        };
        formData.append('logo', logoFile);
      }
      
      // Create organization via API
      const response = await authService.createOrganization(formData);
      
      // The response structure is { success, message, data, statusCode, timestamp }
      // where data contains the organization
      console.log('Create organization response:', response);
      
      if (response.success && response.data) {
        // Update Redux state with organization
        dispatch(setOrganization(response.data));
        
        // Get updated user data since the user is now an admin
        try {
          const userData = await authService.getCurrentUser();
          dispatch(loginSuccess({ 
            user: userData, 
            token: await authService.getAuthToken() 
          }));
        } catch (userError) {
          console.warn('Failed to refresh user data:', userError);
          // Continue anyway, the organization creation was successful
        }
        
        Alert.alert(
          'Success!', 
          `Organization created successfully!\n\nYour organization code is: ${response.data.code}\n\nShare this code with team members to join your organization.`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        throw new Error(response.message || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Create organization failed:', error);
      dispatch(loginFailure(error.message));
      Alert.alert('Error', error.message || 'Failed to create organization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              Create Organization
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
              Set up your organization and become the admin
            </Text>

            <View style={styles.logoSection}>
              <Avatar.Image 
                size={100} 
                source={logo ? { uri: logo } : { uri: 'https://via.placeholder.com/100' }}
                style={styles.logo}
              />
              <IconButton
                icon="camera-plus"
                size={24}
                onPress={pickImage}
                style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}
                iconColor={theme.colors.onPrimary}
                mode="contained"
              />
            </View>

            <Formik
              initialValues={{
                name: '',
                description: '',
                address: '',
                phone: '',
                email: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 10 }}>
                    Organization Details
                  </Text>
                  
                  <TextInput
                    label="Organization Name *"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name}
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.name && errors.name && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.name}
                    </Text>
                  )}

                  <TextInput
                    label="Description"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    error={touched.description && errors.description}
                    style={styles.input}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                  />
                  {touched.description && errors.description && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.description}
                    </Text>
                  )}

                  <TextInput
                    label="Address *"
                    value={values.address}
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    error={touched.address && errors.address}
                    style={styles.input}
                    mode="outlined"
                    multiline
                  />
                  {touched.address && errors.address && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.address}
                    </Text>
                  )}

                  <TextInput
                    label="Organization Phone *"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    error={touched.phone && errors.phone}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                  />
                  {touched.phone && errors.phone && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.phone}
                    </Text>
                  )}

                  <TextInput
                    label="Organization Email *"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && errors.email}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.email}
                    </Text>
                  )}

                  <View style={styles.buttonContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => router.back()}
                      style={[styles.button, styles.cancelButton]}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      style={[styles.button, styles.submitButton]}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Create
                    </Button>
                  </View>
                </View>
              )}
            </Formik>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  card: {
    elevation: 4,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  logo: {
    marginBottom: 10,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -5,
    right: '35%',
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  error: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    marginRight: 10,
  },
  submitButton: {
    marginLeft: 10,
  },
});