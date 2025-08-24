// app/(auth)/signup.jsx
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  Banner,
  Button,
  Card,
  Divider,
  Menu,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { authService } from '../../src/api/authService';
import { clearSignupState, signupFailure, signupStart, signupSuccess } from '../../src/store/slices/auth/signupSlice';

// Country codes data - you can expand this list
const COUNTRY_CODES = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: '#### ### ####' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '(###) ###-####' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: '#### ### ###' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', format: '### ### ####' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', format: '### ### ####' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', format: '### ### ###' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', format: '## ### ####' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', format: '##### #####' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: '#### #######' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: '# ## ## ## ##' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: '##-####-####' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', format: '### #### ####' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', format: '## #####-####' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', format: '## #### ####' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', format: '## ### ####' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', format: '#### ####' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', format: '##-### ####' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', format: '##-###-####' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', format: '#### ### ####' },
];

// More flexible phone validation
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: Yup.string()
    .min(4, 'Phone number is too short')
    .max(15, 'Phone number is too long')
    .matches(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function SignUpScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error, signUpSuccess } = useSelector((state) => state.signup);
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default to US
  const [countryMenuVisible, setCountryMenuVisible] = useState(false);

  const formatPhoneNumber = (value, country) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply country-specific formatting
    const format = country.format;
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
      if (format[i] === '#') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else if (digitIndex > 0) {
        formatted += format[i];
      }
    }
    
    return formatted;
  };

  const getFullPhoneNumber = (phoneNumber, country) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return `${country.dialCode}${cleanNumber}`;
  };

  const handleSubmit = async (values) => {
    dispatch(signupStart());
    
    try {
      // Format the phone number with country code
      const fullPhoneNumber = getFullPhoneNumber(values.phone, selectedCountry);
      
      // Register with backend
      const response = await authService.register({
        name: values.name,
        email: values.email,
        phone: fullPhoneNumber,
        password: values.password,
      });
      
      // Update Redux state with the response
      dispatch(signupSuccess({
        message: response.message,
        data: response.data
      }));
      
      // Show success message and navigate to verification with email
      Alert.alert(
        'Success', 
        response.message || 'Account created successfully! Please check your email for verification code.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear the signup state before navigating
              dispatch(clearSignupState());
              // Navigate to verification screen with email parameter
              router.replace({
                pathname: '/(auth)/verify-email',
                params: { email: values.email }
              });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Sign up failed:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error types to provide better user experience
      if (error.message && error.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please use a different email or try signing in.';
      }
      
      dispatch(signupFailure(errorMessage));
    }
  };

  const handleDismissError = () => {
    dispatch(clearSignupState());
  };

  const CountrySelector = ({ onSelect, selectedCountry }) => (
    <Menu
      visible={countryMenuVisible}
      onDismiss={() => setCountryMenuVisible(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setCountryMenuVisible(true)}
          style={styles.countrySelector}
          contentStyle={styles.countrySelectorContent}
          labelStyle={styles.countrySelectorLabel}
        >
          {selectedCountry.flag} {selectedCountry.dialCode}
        </Button>
      }
      contentStyle={styles.countryMenu}
    >
      <ScrollView style={styles.countryMenuScroll}>
        {COUNTRY_CODES.map((country) => (
          <View key={country.code}>
            <Menu.Item
              onPress={() => {
                onSelect(country);
                setCountryMenuVisible(false);
              }}
              title={`${country.flag} ${country.name}`}
              leadingIcon={() => (
                <Text style={styles.dialCode}>{country.dialCode}</Text>
              )}
              style={selectedCountry.code === country.code ? styles.selectedCountryItem : null}
            />
            <Divider />
          </View>
        ))}
      </ScrollView>
    </Menu>
  );

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
            {/* Error Banner */}
            {error && (
              <Banner
                visible={true}
                actions={[
                  {
                    label: 'Dismiss',
                    onPress: handleDismissError,
                  },
                ]}
                icon="alert-circle"
                style={[styles.errorBanner, { backgroundColor: theme.colors.errorContainer }]}
                contentStyle={{ color: theme.colors.onErrorContainer }}
              >
                {error}
              </Banner>
            )}

            {/* Success Banner */}
            {signUpSuccess && (
              <Banner
                visible={true}
                actions={[
                  {
                    label: 'Dismiss',
                    onPress: handleDismissError,
                  },
                ]}
                icon="check-circle"
                style={[styles.successBanner, { backgroundColor: theme.colors.primaryContainer }]}
                contentStyle={{ color: theme.colors.onPrimaryContainer }}
              >
                Account created successfully! Please check your email.
              </Banner>
            )}

            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              Create Account
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
              Sign up to get started with appointment management
            </Text>

            <Formik
              initialValues={{
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View>
                  <TextInput
                    label="Full Name *"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name}
                    style={styles.input}
                    mode="outlined"
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  {touched.email && errors.email && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.email}
                    </Text>
                  )}

                  {/* Phone Number with Country Selector */}
                  <Text variant="bodyMedium" style={[styles.phoneLabel, { color: theme.colors.onSurface }]}>
                    Phone Number *
                  </Text>
                  <View style={styles.phoneContainer}>
                    <CountrySelector 
                      onSelect={setSelectedCountry}
                      selectedCountry={selectedCountry}
                    />
                    <TextInput
                      label="Phone Number"
                      value={values.phone}
                      onChangeText={(text) => {
                        const formatted = formatPhoneNumber(text, selectedCountry);
                        setFieldValue('phone', formatted);
                      }}
                      onBlur={handleBlur('phone')}
                      error={touched.phone && errors.phone}
                      style={styles.phoneInput}
                      mode="outlined"
                      keyboardType="phone-pad"
                      disabled={isLoading}
                      placeholder={selectedCountry.format.replace(/#/g, '0')}
                    />
                  </View>
                  {touched.phone && errors.phone && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.phone}
                    </Text>
                  )}
                  <Text variant="bodySmall" style={[styles.phonePreview, { color: theme.colors.onSurfaceVariant }]}>
                    Full number: {getFullPhoneNumber(values.phone || '', selectedCountry)}
                  </Text>

                  <TextInput
                    label="Password *"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && errors.password}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                    disabled={isLoading}
                  />
                  {touched.password && errors.password && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.password}
                    </Text>
                  )}

                  <TextInput
                    label="Confirm Password *"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={touched.confirmPassword && errors.confirmPassword}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                    disabled={isLoading}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                  
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Create Account
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.linkButton}
                    disabled={isLoading}
                  >
                    Already have an account? Sign In
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => router.back()}
                    style={styles.backButton}
                    disabled={isLoading}
                  >
                    Back to Options
                  </Button>
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
  input: {
    marginBottom: 16,
  },
  error: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  phoneLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  countrySelector: {
    marginRight: 8,
    minWidth: 100,
    height: 56,
  },
  countrySelectorContent: {
    height: 56,
    justifyContent: 'center',
  },
  countrySelectorLabel: {
    fontSize: 14,
  },
  phoneInput: {
    flex: 1,
  },
  phonePreview: {
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  countryMenu: {
    maxHeight: 300,
    width: 280,
  },
  countryMenuScroll: {
    maxHeight: 280,
  },
  dialCode: {
    fontSize: 12,
    opacity: 0.7,
    minWidth: 40,
  },
  selectedCountryItem: {
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 10,
  },
  backButton: {
    marginTop: 5,
  },
  errorBanner: {
    marginBottom: 16,
  },
  successBanner: {
    marginBottom: 16,
  },
});