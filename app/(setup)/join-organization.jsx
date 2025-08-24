// app/(setup)/join-organization.jsx
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Icon,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { authService } from '../../src/api/authService';
import { organizationService } from '../../src/api/organizationService';
import { updateUser } from '../../src/store/slices/auth/loginSlice';

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .length(6, 'Organization code must be 6 characters')
    .matches(/^[A-Z0-9]+$/, 'Organization code can only contain uppercase letters and numbers')
    .required('Organization code is required'),
});

export default function JoinOrganizationScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewOrg, setPreviewOrg] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handlePreviewOrganization = async (code) => {
    if (code.length !== 6) return;
    
    setIsPreviewLoading(true);
    try {
      const response = await organizationService.getOrganizationByCode(code);
      setPreviewOrg(response.data);
    } catch (error) {
      console.log('Organization not found or invalid code');
      setPreviewOrg(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      // Submit join request
      const response = await organizationService.joinOrganization({ code: values.code });
      
      // Get updated user data to reflect the new pending status
      const userData = await authService.getCurrentUser();
      console.log('Updated user data:', userData);
      
      // Update Redux state with updated user status
      dispatch(updateUser(userData));
      
      // Always show success message and navigate to waiting screen
      // The backend handles setting the user status to PENDING_APPROVAL
      Alert.alert(
        'Request Submitted!', 
        'Your join request has been submitted successfully. You will receive a notification once an admin approves your request.',
        [{ 
          text: 'OK', 
          onPress: () => {
            router.replace('/waiting');
          }
        }]
      );
      
    } catch (error) {
      console.error('Join organization failed:', error);
      
      let errorMessage = error.message || 'Failed to join organization. Please try again.';
      
      if (errorMessage.includes('already belongs to an organization')) {
        errorMessage = 'You already belong to an organization.';
        // If they already belong to an organization, they shouldn't be here
        Alert.alert(
          'Already Member', 
          errorMessage,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
        return;
      } else if (errorMessage.includes('already have a pending request')) {
        errorMessage = 'You already have a pending request for this organization.';
        // If they already have a pending request, take them to waiting screen
        Alert.alert(
          'Existing Request', 
          errorMessage,
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
        return;
      } else if (errorMessage.includes('Organization not found')) {
        errorMessage = 'Invalid organization code. Please check and try again.';
      }
      
      Alert.alert('Join Request Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.iconContainer}>
              <Icon source="account-group" size={60} color={theme.colors.primary} />
            </View>
            
            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              Join Organization
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Enter the organization code provided by your admin
            </Text>

            <Formik
              initialValues={{ code: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View>
                  <TextInput
                    label="Organization Code *"
                    value={values.code}
                    onChangeText={(text) => {
                      const upperText = text.toUpperCase();
                      setFieldValue('code', upperText);
                      handleChange('code')(upperText);
                      if (upperText.length === 6) {
                        handlePreviewOrganization(upperText);
                      } else {
                        setPreviewOrg(null);
                      }
                    }}
                    onBlur={handleBlur('code')}
                    error={touched.code && errors.code}
                    style={styles.input}
                    mode="outlined"
                    autoCapitalize="characters"
                    maxLength={6}
                    placeholder="ABCD12"
                    right={
                      isPreviewLoading ? (
                        <TextInput.Icon icon="loading" />
                      ) : previewOrg ? (
                        <TextInput.Icon icon="check-circle" iconColor={theme.colors.primary} />
                      ) : null
                    }
                  />
                  {touched.code && errors.code && (
                    <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                      {errors.code}
                    </Text>
                  )}

                  {/* Organization Preview */}
                  {previewOrg && (
                    <Card style={[styles.previewCard, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Card.Content style={styles.previewContent}>
                        <View style={styles.previewHeader}>
                          <Icon source="domain" size={24} color={theme.colors.onPrimaryContainer} />
                          <Text variant="titleMedium" style={{ 
                            color: theme.colors.onPrimaryContainer,
                            marginLeft: 8,
                            flex: 1 
                          }}>
                            {previewOrg.name}
                          </Text>
                        </View>
                        
                        {previewOrg.description && (
                          <Text variant="bodyMedium" style={{ 
                            color: theme.colors.onPrimaryContainer,
                            opacity: 0.8,
                            marginTop: 4
                          }}>
                            {previewOrg.description}
                          </Text>
                        )}
                        
                        <View style={styles.previewDetails}>
                          <Text variant="bodySmall" style={{ 
                            color: theme.colors.onPrimaryContainer,
                            opacity: 0.7
                          }}>
                            Members: {previewOrg.memberCount || 0}
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>
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
                      disabled={isLoading || !values.code || values.code.length !== 6}
                    >
                      Join
                    </Button>
                  </View>
                </View>
              )}
            </Formik>

            <View style={styles.helpSection}>
              <Text variant="bodySmall" style={{ 
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
                marginTop: 20
              }}>
                Don't have an organization code?{'\n'}
                Ask your organization admin for the 6-character code.
              </Text>
            </View>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  error: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  previewCard: {
    marginBottom: 20,
    elevation: 2,
  },
  previewContent: {
    paddingVertical: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDetails: {
    marginTop: 8,
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
  helpSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
});