import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Switch,
  Text,
  useTheme
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../src/store/slices/auth/loginSlice';
import { updateSettings } from '../../src/store/slices/notificationSlice';
import { toggleTheme } from '../../src/store/slices/themeSlice';

export default function SettingsScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector(state => state.auth);
  const { currentOrganization } = useSelector(state => state.organization);
  const { isDarkMode } = useSelector(state => state.theme);
  const { settings } = useSelector(state => state.notification);
  
  const [notificationSettings, setNotificationSettings] = useState(settings || {
    sms: true,
    email: true,
    inApp: true,
  });

  const handleNotificationToggle = (type) => {
    const newSettings = {
      ...notificationSettings,
      [type]: !notificationSettings[type],
    };
    setNotificationSettings(newSettings);
    dispatch(updateSettings(newSettings));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            try {
              dispatch(logout());
              // Navigate to login screen after logout
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };
  console.log("LOGO", currentOrganization.data.logo)

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.profileSection}>
            <Avatar.Image 
              size={80} 
              source={{ uri: user?.data?.profilePicture || 'https://via.placeholder.com/80' }}
            />
            <View style={styles.profileInfo}>
              <Text variant="titleLarge"  style={{ color: theme.colors.onSurface }}>
                {user?.data?.name || 'User'}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {user?.data?.email || 'No email'}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {user?.data?.role.toUpperCase() || 'USER'} • {currentOrganization?.data.name || 'No Organization'}
              </Text>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={() => router.push('/profile')}
            style={styles.editButton}
            icon="account-edit"
          >
            Edit Profile
          </Button>
        </Card.Content>
      </Card>

      {/* Organization Section */}
      {currentOrganization && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge"  style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Organization
            </Text>
            <View style={styles.orgSection}>
              <Avatar.Image 
                size={50} 
                source={{ uri: currentOrganization?.data.logo || 'https://via.placeholder.com/50' }}
              />
              <View style={styles.orgInfo}>
                <Text variant="titleLarge"  style={{ color: theme.colors.onSurface, fontSize: 16 }}>
                  {currentOrganization?.data.name}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Code: {currentOrganization?.data.code}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Notification Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Notification Settings
          </Text>
          
          <List.Item
            title="SMS Notifications"
            description="Receive appointment updates via SMS"
            left={() => <MaterialCommunityIcons name="message-text" size={24} color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={notificationSettings.sms}
                onValueChange={() => handleNotificationToggle('sms')}
              />
            )}
          />
          
          <List.Item
            title="Email Notifications"
            description="Receive appointment updates via email"
            left={() => <MaterialCommunityIcons name="email" size={24} color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={notificationSettings.email}
                onValueChange={() => handleNotificationToggle('email')}
              />
            )}
          />
          
          <List.Item
            title="In-App Notifications"
            description="Show notifications within the app"
            left={() => <MaterialCommunityIcons name="bell" size={24} color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={notificationSettings.inApp}
                onValueChange={() => handleNotificationToggle('inApp')}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            App Settings
          </Text>
          
          <List.Item
            title="Dark Mode"
            description="Switch between light and dark themes"
            left={() => <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={() => dispatch(toggleTheme())}
              />
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="About"
            description="App version and information"
            left={() => <MaterialCommunityIcons name="information" size={24} color={theme.colors.onSurfaceVariant} />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
            onPress={() => {
              Alert.alert('About', 'Walk-in v1.0.0\nA simple appointment management system.');
            }}
          />
          
          <List.Item
            title="Help & Support"
            description="Get help and contact support"
            left={() => <MaterialCommunityIcons name="help-circle" size={24} color={theme.colors.onSurfaceVariant} />}
            right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
            onPress={() => {
              Alert.alert('Help & Support', 'For support, please contact:\hanchotech@gmail.com');
            }}
          />
        </Card.Content>
      </Card>

      {/* Logout Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            icon="logout"
            contentStyle={{ flexDirection: 'row-reverse' }}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
      
      <View style={styles.footer}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          Walk-in by Jose v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  editButton: {
    marginTop: 8,
  },
  orgSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgInfo: {
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    marginVertical: 8,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
});