import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function EmptyState({ 
  icon = 'inbox', 
  title = 'No items found', 
  description = 'Items will appear here when available',
  style 
}) {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={60} 
        color={theme.colors.onSurfaceVariant}
      />
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});