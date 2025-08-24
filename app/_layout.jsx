// app/_layout.jsx
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import LoadingScreen from '../src/components/LoadingScreen';
import { persistor, store } from '../src/store/store';
import { darkTheme, lightTheme } from '../src/theme/theme';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootLayoutNav() {
  const { isDarkMode } = useSelector(state => state.theme);
  
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  const backgroundColor = currentTheme.colors.surface;
  
  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };
    requestPermissions();
  }, []);

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: backgroundColor 
    }}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      
      <SafeAreaView 
        style={{ flex: 1 }}
        edges={['top']}
      >
        <PaperProvider theme={currentTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(setup)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="profile" 
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Edit Profile'
              }}
            />
          </Stack>
        </PaperProvider>
      </SafeAreaView>
    </View>
  );
}

// Wrapper component to handle persistence conditionally
function AppWithPersistence() {
  // Check if persistor is valid (has the subscribe method)
  const hasPersistence = persistor && typeof persistor.subscribe === 'function';
  
  if (hasPersistence) {
    return (
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    );
  }
  
  // No persistence, render directly
  return <RootLayoutNav />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppWithPersistence />
    </Provider>
  );
}