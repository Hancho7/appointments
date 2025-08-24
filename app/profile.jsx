import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  IconButton,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { updateUser } from '../src/store/slices/auth/loginSlice';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
});

export default function ProfileScreen({ navigation }) {
    const router= useRouter()
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedUser = {
        ...values,
        profilePicture: profilePicture,
      };
      
      dispatch(updateUser(updatedUser));
      
      Alert.alert('Success!', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => router.back }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            Edit Profile
          </Text>

          <View style={styles.avatarSection}>
            <Avatar.Image 
              size={120} 
              source={{ uri: profilePicture || 'https://via.placeholder.com/120' }}
            />
            <IconButton
              icon="camera"
              size={24}
              onPress={pickImage}
              style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}
              iconColor={theme.colors.onPrimary}
            />
          </View>

          <Formik
            initialValues={{
              name: user?.name || '',
              email: user?.email || '',
              phone: user?.phone || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <TextInput
                  label="Name *"
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
                  label="Email *"
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

                <TextInput
                  label="Phone Number *"
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
                    Save Changes
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    elevation: 4,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 120,
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