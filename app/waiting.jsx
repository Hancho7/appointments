// app/waiting.jsx - Create this as your waiting screen
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Icon,
    Text,
    useTheme
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../src/api/authService';
import { organizationService } from '../src/api/organizationService';
import { updateUser } from '../src/store/slices/auth/loginSlice';
import { setOrganization } from '../src/store/slices/organizationSlice';

export default function WaitingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    // Check status when component mounts
    checkApprovalStatus();
    
    // Set up interval to check status every 30 seconds
    const interval = setInterval(checkApprovalStatus, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const checkApprovalStatus = async () => {
    if (checkingStatus) return; // Prevent multiple simultaneous checks
    
    setCheckingStatus(true);
    try {
      // Get updated user data
      const userData = await authService.getCurrentUser();
      console.log('Checked user status:', userData);
      
      // Update Redux with latest user data
      dispatch(updateUser(userData));
      
      // If user has been approved and has an organization
      if (userData.organizationId && userData.organizationStatus === 'APPROVED') {
        try {
          // Get organization details
          const organization = await organizationService.getCurrentOrganization();
          dispatch(setOrganization(organization));
          
          // Navigate to main app
          router.replace('/(tabs)');
        } catch (error) {
          console.warn('Failed to get organization:', error.message);
          // Still navigate to main app even if organization fetch fails
          router.replace('/(tabs)');
        }
      }
      // If user was rejected or no longer has pending status without organization
      else if (!userData.organizationId && userData.status === 'ACTIVE') {
        // User was likely rejected or request expired, redirect to setup
        router.replace('/(setup)/organization-choice');
      }
    } catch (error) {
      console.error('Failed to check approval status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkApprovalStatus();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.iconContainer}>
            <Icon 
              source="clock-outline" 
              size={80} 
              color={theme.colors.primary} 
            />
          </View>
          
          <Text 
            variant="titleLarge" 
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Pending Approval
          </Text>
          
          <Text 
            variant="bodyLarge" 
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            Your request to join the organization is being reviewed by an admin.
          </Text>
          
          <Text 
            variant="bodyMedium" 
            style={[styles.submessage, { color: theme.colors.onSurfaceVariant }]}
          >
            You will receive a notification once your request has been approved. 
            This usually takes a few minutes to a few hours.
          </Text>

          {user?.email && (
            <View style={styles.userInfo}>
              <Text 
                variant="bodySmall" 
                style={[styles.emailText, { color: theme.colors.onSurfaceVariant }]}
              >
                Logged in as: {user.email}
              </Text>
            </View>
          )}

          <View style={styles.actionContainer}>
            <Button 
              mode="outlined"
              onPress={onRefresh}
              style={[styles.button, styles.refreshButton]}
              loading={checkingStatus}
              disabled={checkingStatus}
              icon="refresh"
            >
              Check Status
            </Button>
            
            
            <Button 
              mode="text"
              onPress={handleLogout}
              style={[styles.button, styles.logoutButton]}
            >
              Logout
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {/* Tips Card */}
      <Card style={[styles.tipsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content>
          <Text 
            variant="titleMedium" 
            style={[styles.tipsTitle, { color: theme.colors.onSurfaceVariant }]}
          >
            What happens next?
          </Text>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon 
                source="numeric-1-circle" 
                size={20} 
                color={theme.colors.primary} 
              />
              <Text 
                variant="bodySmall" 
                style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}
              >
                The organization admin will review your request
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Icon 
                source="numeric-2-circle" 
                size={20} 
                color={theme.colors.primary} 
              />
              <Text 
                variant="bodySmall" 
                style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}
              >
                You'll receive a notification when approved
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Icon 
                source="numeric-3-circle" 
                size={20} 
                color={theme.colors.primary} 
              />
              <Text 
                variant="bodySmall" 
                style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}
              >
                You can then access all organization features
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  card: {
    elevation: 4,
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  submessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    opacity: 0.8,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emailText: {
    fontStyle: 'italic',
  },
  actionContainer: {
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
  refreshButton: {
    marginBottom: 8,
  },
  changeButton: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 4,
  },
  tipsCard: {
    elevation: 2,
  },
  tipsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    lineHeight: 18,
  },
});