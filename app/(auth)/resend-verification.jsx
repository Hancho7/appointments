// app/(auth)/resend-verification.jsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';
import { authService } from '../../src/api/authService';

export default function ResendVerificationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
    }
  }, [params.email]);

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.resendVerification(email);
      
      Alert.alert(
        'Success', 
        'Verification email sent! Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('Resend verification failed:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to send verification email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      padding: 16, 
      justifyContent: 'center',
      backgroundColor: theme.colors.background
    }}>
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ 
            textAlign: 'center', 
            marginBottom: 20,
            color: theme.colors.onSurface
          }}>
            Resend Verification Email
          </Text>
          
          <Text variant="bodyMedium" style={{ 
            textAlign: 'center', 
            marginBottom: 20,
            color: theme.colors.onSurfaceVariant
          }}>
            Enter your email address to receive a new verification link
          </Text>
          
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            style={{ marginBottom: 20 }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          
          <Button
            mode="contained"
            onPress={handleResend}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginBottom: 10 }}
          >
            Resend Verification
          </Button>
          
          <Button
            mode="text"
            onPress={() => router.back()}
          >
            Back
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}