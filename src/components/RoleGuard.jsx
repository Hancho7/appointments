// src/components/RoleGuard.jsx
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { usePermissions } from '../hooks/usePermissions';

export const RoleGuard = ({ 
  requiredPermissions = [], 
  requiredRoles = [],
  fallback = null,
  showFallback = true,
  children 
}) => {
  const { userRole, hasPermission, hasAnyPermission } = usePermissions();
  const theme = useTheme();

  // Check role-based access
  const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.includes(userRole);
  
  // Check permission-based access
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    hasAnyPermission(requiredPermissions);

  if (hasRequiredRole && hasRequiredPermissions) {
    return children;
  }

  // Show custom fallback or default unauthorized message
  if (fallback) {
    return fallback;
  }

  if (!showFallback) {
    return null;
  }

  return (
    <View style={{ 
      padding: 20, 
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      margin: 16,
    }}>
      <Text 
        variant="bodyLarge" 
        style={{ 
          color: theme.colors.onSurfaceVariant,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Access Restricted
      </Text>
      <Text 
        variant="bodyMedium" 
        style={{ 
          color: theme.colors.onSurfaceVariant,
          textAlign: 'center',
        }}
      >
        You don't have permission to access this feature.
      </Text>
    </View>
  );
};