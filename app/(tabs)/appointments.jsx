//(tabs)/appointments.jsx
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Menu,
  Searchbar,
  Text,
  useTheme
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { removeIncomingRequest, updateAppointment } from '../../src/store/slices/appointmentSlice';
import { addNotification } from '../../src/store/slices/notificationSlice';

export default function AppointmentsScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { appointments, incomingRequests } = useSelector(state => state.appointment);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleRequestResponse = (requestId, action, alternateTime = null) => {
    const request = incomingRequests.find(req => req.id === requestId);
    if (!request) return;

    if (action === 'accept') {
      const newAppointment = {
        ...request,
        status: 'confirmed',
        confirmedTime: alternateTime || request.preferredTime,
        confirmedAt: new Date().toISOString(),
      };
      
      dispatch(updateAppointment(newAppointment));
      dispatch(addNotification({
        id: Date.now().toString(),
        title: 'Appointment Confirmed',
        message: `Your appointment with ${request.visitorName} has been confirmed`,
        type: 'appointment',
        read: false,
        timestamp: new Date().toISOString(),
      }));
    } else {
      dispatch(addNotification({
        id: Date.now().toString(),
        title: 'Appointment Declined',
        message: `You declined the appointment with ${request.visitorName}`,
        type: 'appointment',
        read: false,
        timestamp: new Date().toISOString(),
      }));
    }
    
    dispatch(removeIncomingRequest(requestId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return theme.colors.secondary;
      case 'pending': return theme.colors.tertiary;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredRequests = incomingRequests.filter(req => 
    req.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
          Appointments
        </Text>
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search appointments..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          />
          
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <IconButton
                icon="filter"
                size={24}
                onPress={() => setFilterMenuVisible(true)}
                style={{ backgroundColor: theme.colors.surface }}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setFilterStatus('all');
                setFilterMenuVisible(false);
              }}
              title="All"
              leadingIcon={filterStatus === 'all' ? 'check' : ''}
            />
            <Menu.Item
              onPress={() => {
                setFilterStatus('confirmed');
                setFilterMenuVisible(false);
              }}
              title="Confirmed"
              leadingIcon={filterStatus === 'confirmed' ? 'check' : ''}
            />
            <Menu.Item
              onPress={() => {
                setFilterStatus('pending');
                setFilterMenuVisible(false);
              }}
              title="Pending"
              leadingIcon={filterStatus === 'pending' ? 'check' : ''}
            />
            <Menu.Item
              onPress={() => {
                setFilterStatus('cancelled');
                setFilterMenuVisible(false);
              }}
              title="Cancelled"
              leadingIcon={filterStatus === 'cancelled' ? 'check' : ''}
            />
          </Menu>
        </View>
      </View>

      {/* Incoming Requests - Only for employees */}
      {(user?.role === 'employee' || user?.role === 'admin') && filteredRequests.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Incoming Requests ({filteredRequests.length})
          </Text>
          
          {filteredRequests.map((request) => (
            <Card key={request.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text variant="titleLarge" style={[styles.visitorName, { color: theme.colors.onSurface }]}>
                      {request.visitorName}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {request.email}
                    </Text>
                    {request.phone && (
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {request.phone}
                      </Text>
                    )}
                  </View>
                  <Chip 
                    style={[styles.statusChip, { backgroundColor: getStatusColor('pending') }]}
                    textStyle={{ color: 'white' }}
                  >
                    PENDING
                  </Chip>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.requestDetails}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    Reason:
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {request.reason}
                  </Text>
                  
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold', marginTop: 10 }}>
                    Preferred Time:
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {request.preferredTime}
                  </Text>
                </View>
                
                <View style={styles.requestActions}>
                  <Button
                    mode="contained"
                    onPress={() => handleRequestResponse(request.id, 'accept')}
                    style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                    icon="check"
                  >
                    Accept
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleRequestResponse(request.id, 'reject')}
                    style={styles.actionButton}
                    textColor={theme.colors.error}
                    icon="close"
                  >
                    Decline
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Confirmed Appointments */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Appointments ({filteredAppointments.length})
        </Text>
        
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentInfo}>
                    <Text variant="titleLarge" style={[styles.visitorName, { color: theme.colors.onSurface }]}>
                      {appointment.visitorName}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {appointment.email}
                    </Text>
                    {appointment.employeeName && user?.role === 'frontdesk' && (
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        with {appointment.employeeName}
                      </Text>
                    )}
                  </View>
                  <Chip 
                    style={[styles.statusChip, { backgroundColor: getStatusColor(appointment.status) }]}
                    textStyle={{ color: 'white' }}
                  >
                    {appointment.status.toUpperCase()}
                  </Chip>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons 
                      name="clock-outline" 
                      size={16} 
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {appointment.confirmedTime || appointment.preferredTime}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons 
                      name="file-document-outline" 
                      size={16} 
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {appointment.reason}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons 
                      name="calendar" 
                      size={16} 
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Created {new Date(appointment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.appointmentActions}>
                  <IconButton
                    icon="phone"
                    size={20}
                    mode="contained"
                    style={{ backgroundColor: theme.colors.primary }}
                    iconColor={theme.colors.onPrimary}
                    onPress={() => {/* Handle call */}}
                  />
                  <IconButton
                    icon="email"
                    size={20}
                    mode="contained"
                    style={{ backgroundColor: theme.colors.secondary }}
                    iconColor={theme.colors.onSecondary}
                    onPress={() => {/* Handle email */}}
                  />
                  {appointment.status === 'confirmed' && (
                    <IconButton
                      icon="calendar-edit"
                      size={20}
                      mode="contained"
                      style={{ backgroundColor: theme.colors.tertiary }}
                      iconColor={theme.colors.onTertiary}
                      onPress={() => {/* Handle reschedule */}}
                    />
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="calendar-blank" 
                size={60} 
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="titleLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>
                No appointments found
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                {searchQuery ? 'Try adjusting your search criteria' : 'Appointments will appear here once scheduled'}
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchbar: {
    flex: 1,
    elevation: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestInfo: {
    flex: 1,
  },
  appointmentInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusChip: {
    marginLeft: 10,
  },
  divider: {
    marginVertical: 12,
  },
  requestDetails: {
    marginBottom: 16,
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
});