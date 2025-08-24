import React from 'react';
import { Chip, useTheme } from 'react-native-paper';

export default function StatusChip({ status, style }) {
  const theme = useTheme();
  
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'approved':
        return {
          color: theme.colors.secondary,
          textColor: 'white',
          label: status.toUpperCase(),
        };
      case 'pending':
        return {
          color: theme.colors.tertiary,
          textColor: 'white',
          label: 'PENDING',
        };
      case 'cancelled':
      case 'rejected':
        return {
          color: theme.colors.error,
          textColor: 'white',
          label: status.toUpperCase(),
        };
      case 'admin':
        return {
          color: theme.colors.error,
          textColor: 'white',
          label: 'ADMIN',
        };
      case 'frontdesk':
        return {
          color: theme.colors.primary,
          textColor: 'white',
          label: 'FRONT DESK',
        };
      case 'employee':
        return {
          color: theme.colors.secondary,
          textColor: 'white',
          label: 'EMPLOYEE',
        };
      default:
        return {
          color: theme.colors.surfaceVariant,
          textColor: theme.colors.onSurfaceVariant,
          label: status?.toUpperCase() || 'UNKNOWN',
        };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <Chip
      style={[
        { backgroundColor: config.color },
        style
      ]}
      textStyle={{ color: config.textColor, fontWeight: 'bold' }}
    >
      {config.label}
    </Chip>
  );
}
