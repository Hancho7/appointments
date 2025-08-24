import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

export default function LoadingScreen() {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MaterialCommunityIcons 
        name="calendar-account" 
        size={80} 
        color={theme.colors.primary}
      />
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
        Walk-in
      </Text>
      <ActivityIndicator 
        animating={true} 
        size="large" 
        color={theme.colors.primary}
        style={styles.loader}
      />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});