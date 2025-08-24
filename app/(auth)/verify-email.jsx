// app/(auth)/verify-email.jsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';
import { authService } from '../../src/api/authService';

export default function VerifyEmailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { email: paramEmail } = useLocalSearchParams();
  
  const [email, setEmail] = useState(paramEmail || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (paramEmail) {
      setEmail(paramEmail);
    }
  }, [paramEmail]);

  const handleVerify = async () => {
    if (!email || !verificationCode) {
      Alert.alert('Error', 'Please enter both email and verification code');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.verifyEmail(verificationCode, email);
      
      Alert.alert(
        'Success', 
        'Email verified successfully! You can now log in.',
        [
          {
            text: 'Login Now',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
      
    } catch (error) {
      console.error('Email verification failed:', error);
      Alert.alert(
        'Verification Failed',
        error.message || 'Failed to verify email. Please check your code and try again.',
        [
          {
            text: 'Resend Code',
            onPress: handleResend
          },
          {
            text: 'OK'
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsResending(true);
    
    try {
      await authService.resendVerification(email);
      Alert.alert('Success', 'Verification code sent! Please check your email.');
    } catch (error) {
      console.error('Resend failed:', error);
      Alert.alert('Error', error.message || 'Failed to send verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            Verify Your Email
          </Text>
          
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            We've sent a verification code to your email address. Please enter it below.
          </Text>

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isLoading}
          />

          <TextInput
            label="Verification Code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            style={styles.input}
            mode="outlined"
            keyboardType="default"
            autoCapitalize="characters"
            placeholder="Enter verification code from email"
            disabled={isLoading}
          />

          <Button
            mode="contained"
            onPress={handleVerify}
            loading={isLoading}
            disabled={isLoading || !email || !verificationCode}
            style={styles.button}
          >
            Verify Email
          </Button>

          <Button
            mode="outlined"
            onPress={handleResend}
            loading={isResending}
            disabled={isResending || !email}
            style={styles.button}
          >
            Resend Code
          </Button>

          <Button
            mode="text"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          >
            Back to Login
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
});