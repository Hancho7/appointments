import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Paragraph, Title, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDateTime } from '../utils/helpers';

export default function NotificationCard({ 
  notification, 
  onPress, 
  onMarkAsRead, 
  onDelete 
}) {
  const theme = useTheme();
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment': return 'calendar-check';
      case 'member_request': return 'account-plus';
      case 'reminder': return 'bell-ring';
      default: return 'information';
    }
  };

  return (
    <Card 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.surface,
          borderLeftWidth: notification.read ? 0 : 3,
          borderLeftColor: theme.colors.primary,
        }
      ]}
      onPress={onPress}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getNotificationIcon(notification.type)}
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.content}>
            <Title style={[
              styles.title, 
              { 
                color: theme.colors.onSurface,
                fontWeight: notification.read ? 'normal' : 'bold'
              }
            ]}>
              {notification.title}
            </Title>
            <Paragraph style={[
              styles.message,
              { 
                color: theme.colors.onSurfaceVariant,
                fontWeight: notification.read ? 'normal' : '500'
              }
            ]}>
              {notification.message}
            </Paragraph>
            <Paragraph style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
              {formatDateTime(notification.timestamp)}
            </Paragraph>
          </View>
          <View style={styles.actions}>
            {!notification.read && (
              <IconButton
                icon="check"
                size={20}
                onPress={() => onMarkAsRead(notification.id)}
                iconColor={theme.colors.secondary}
              />
            )}
            <IconButton
              icon="delete"
              size={20}
              onPress={() => onDelete(notification.id)}
              iconColor={theme.colors.error}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
  },
});
