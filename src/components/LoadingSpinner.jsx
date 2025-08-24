import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

export default function LoadingSpinner({ size = 'large', color, style }) {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator 
        animating={true} 
        size={size} 
        color={color || theme.colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});