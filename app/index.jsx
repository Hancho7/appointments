// app/index.jsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import WaitingScreen from './waiting';

export default function IndexScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [showWaiting, setShowWaiting] = useState(false);

  useEffect(() => {
    handleInitialNavigation();
  }, [isAuthenticated, user]);

  const handleInitialNavigation = async () => {
    try {
      // Wait a moment for Redux state to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Auth state:', { isAuthenticated, user, token });
      
      // Check if user is actually authenticated (has both user data and token)
      if (!isAuthenticated || !user || !token) {
        console.log('User not authenticated, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      console.log('User organization status:', {
        organizationId: user.organizationId,
        organizationStatus: user.organizationStatus,
        status: user.status
      });

      // Use organizationStatus field consistently (from your login.jsx code)
      const orgStatus = user.organizationStatus;

      if (orgStatus === "APPROVED" && user.organizationId) {
        // User is approved and has organization - go to main app
        console.log('User approved, going to tabs');
        router.replace('/(tabs)');
        return;
      } else if (orgStatus === "PENDING_APPROVAL") {
        // User is pending approval - show waiting screen
        console.log('User pending approval, showing waiting screen');
        setShowWaiting(true);
        setIsLoading(false);
        return;
      } else if (orgStatus === "NO_ORGANIZATION") {
        // User doesn't have an organization - go to setup
        console.log('User has no organization, going to setup');
        router.replace('/(setup)/organization-choice');
        return;
      } else {
        // Unknown status - default to organization choice
        console.log('Unknown organization status, going to setup');
        router.replace('/(setup)/organization-choice');
        return;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // On error, default to auth screen
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Show waiting screen if determined
  if (showWaiting) {
    return <WaitingScreen />;
  }

  // Show loading screen while determining navigation
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text 
          variant="bodyLarge" 
          style={[styles.loadingText, { color: theme.colors.onBackground }]}
        >
          Loading...
        </Text>
      </View>
    );
  }

  // This should rarely be reached, but just in case
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
});