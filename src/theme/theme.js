import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366f1',
    primaryContainer: '#e0e7ff',
    secondary: '#10b981',
    secondaryContainer: '#d1fae5',
    tertiary: '#f59e0b',
    tertiaryContainer: '#fef3c7',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    background: '#fafafa',
    error: '#ef4444',
    errorContainer: '#fee2e2',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onTertiary: '#ffffff',
    onSurface: '#1f2937',
    onSurfaceVariant: '#6b7280',
    onBackground: '#1f2937',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818cf8',
    primaryContainer: '#3730a3',
    secondary: '#34d399',
    secondaryContainer: '#065f46',
    tertiary: '#fbbf24',
    tertiaryContainer: '#92400e',
    surface: '#1f2937',
    surfaceVariant: '#374151',
    background: '#111827',
    error: '#f87171',
    errorContainer: '#7f1d1d',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onTertiary: '#000000',
    onSurface: '#f9fafb',
    onSurfaceVariant: '#d1d5db',
    onBackground: '#f9fafb',
  },
};