//(tabs)/appointments.jsx
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Menu,
  Portal,
  Searchbar,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { appointmentService } from '../../src/api/appointmentService';
import { setAppointments, setIncomingRequests, setLoading } from '../../src/store/slices/appointmentSlice';

export default function AppointmentsScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { appointments, incomingRequests, isLoading } = useSelector(state => state.appointment);
  
  // UI State
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [memberMenuVisible, setMemberMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Dialog states
  const [responseDialogVisible, setResponseDialogVisible] = useState(false);
  const [rescheduleDialogVisible, setRescheduleDialogVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseAction, setResponseAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [alternateTime, setAlternateTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Load data on mount
  useEffect(() => {
    fetchAppointments();
    if (user?.role === 'employee' || user?.role === 'admin') {
      fetchIncomingRequests();
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      dispatch(setLoading(true));
      const response = await appointmentService.getAppointments();
      dispatch(setAppointments(response.data || []));
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const response = await appointmentService.getIncomingRequests();
      dispatch(setIncomingRequests(response.data || []));
    } catch (error) {
      console.error('Failed to fetch incoming requests:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAppointments(),
        (user?.role === 'employee' || user?.role === 'admin') && fetchIncomingRequests()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.role]);

  const handleRequestResponse = async (request, action) => {
    setSelectedRequest(request);
    setResponseAction(action);
    setResponseDialogVisible(true);
  };

  const submitResponse = async () => {
    if (!selectedRequest) return;

    try {
      const responseData = {
        requestId: selectedRequest.id,
        response: responseAction,
        rejectionReason: responseAction === 'reject' ? rejectionReason : undefined,
        alternateTime: alternateTime || undefined
      };

      const response = await appointmentService.respondToRequest(selectedRequest.id, responseData);
      
      if (response.success) {
        Alert.alert(
          'Success',
          `Request ${responseAction === 'approve' ? 'approved' : 'rejected'} successfully`
        );
        fetchIncomingRequests();
        fetchAppointments();
      }
    } catch (error) {
      console.error('Response error:', error);
      Alert.alert('Error', error.message || 'Failed to process request');
    } finally {
      setResponseDialogVisible(false);
      setSelectedRequest(null);
      setRejectionReason('');
      setAlternateTime('');
    }
  };

  const handleAppointmentAction = async (appointment, action) => {
    setSelectedRequest(appointment);
    
    switch (action) {
      case 'cancel':
        setCancelDialogVisible(true);
        break;
      case 'reschedule':
        setRescheduleDialogVisible(true);
        break;
      case 'complete':
        await completeAppointment(appointment.id);
        break;
    }
  };

  const cancelAppointment = async () => {
    if (!selectedRequest) return;

    try {
      const response = await appointmentService.cancelAppointment(selectedRequest.id, {
        reason: cancelReason
      });
      
      if (response.success) {
        Alert.alert('Success', 'Appointment cancelled successfully');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Cancel error:', error);
      Alert.alert('Error', error.message || 'Failed to cancel appointment');
    } finally {
      setCancelDialogVisible(false);
      setSelectedRequest(null);
      setCancelReason('');
    }
  };

  const rescheduleAppointment = async () => {
    if (!selectedRequest || !rescheduleTime) return;

    try {
      const response = await appointmentService.rescheduleAppointment(selectedRequest.id, {
        newTime: rescheduleTime
      });
      
      if (response.success) {
        Alert.alert('Success', 'Appointment rescheduled successfully');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Reschedule error:', error);
      Alert.alert('Error', error.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduleDialogVisible(false);
      setSelectedRequest(null);
      setRescheduleTime('');
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const response = await appointmentService.completeAppointment(appointmentId, {
        notes: 'Appointment completed'
      });
      
      if (response.success) {
        Alert.alert('Success', 'Appointment completed successfully');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Complete error:', error);
      Alert.alert('Error', error.message || 'Failed to complete appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return theme.colors.secondary;
      case 'pending': return theme.colors.tertiary;
      case 'cancelled': return theme.colors.error;
      case 'completed': return theme.colors.primary;
      case 'in_progress': return theme.colors.secondary;
      default: return theme.colors.outline;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'calendar-check';
      case 'pending': return 'clock-outline';
      case 'cancelled': return 'calendar-remove';
      case 'completed': return 'check-circle';
      case 'in_progress': return 'account-clock';
      default: return 'calendar';
    }
  };

  // Filter data based on search and filters
  const filteredAppointments = (appointments || []).filter(apt => {
    const matchesSearch = apt.visitorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.confirmationCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredRequests = (incomingRequests || []).filter(req => 
    req.visitorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.confirmationCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderAppointmentCard = (appointment) => (
    <Card key={appointment.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentInfo}>
            <View style={styles.visitorDetails}>
              <Avatar.Text 
                size={40} 
                label={appointment.visitorName?.charAt(0) || 'V'} 
                style={{ backgroundColor: getStatusColor(appointment.status) }}
              />
              <View style={styles.textContainer}>
                <Text variant="titleMedium" style={[styles.visitorName, { color: theme.colors.onSurface }]}>
                  {appointment.visitorName || 'Unknown Visitor'}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {appointment.visitorEmail}
                </Text>
                {appointment.employeeName && user?.role === 'frontdesk' && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    with {appointment.employeeName}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(appointment.status) }]}
              textStyle={{ color: 'white', fontSize: 12 }}
              icon={getStatusIcon(appointment.status)}
            >
              {appointment.status?.toUpperCase() || 'UNKNOWN'}
            </Chip>
            {appointment.confirmationCode && (
              <Text variant="bodySmall" style={{ 
                color: theme.colors.onSurfaceVariant,
                fontFamily: 'monospace',
                marginTop: 4
              }}>
                {appointment.confirmationCode}
              </Text>
            )}
          </View>
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
              {formatDateTime(appointment.confirmedTime || appointment.preferredTime)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="file-document-outline" 
              size={16} 
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {appointment.reason || 'No reason provided'}
            </Text>
          </View>
          
          {appointment.walkedInAt && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name="account-arrow-right" 
                size={16} 
                color={theme.colors.secondary}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                Walked in: {formatDateTime(appointment.walkedInAt)}
              </Text>
            </View>
          )}

          {appointment.walkedOutAt && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name="account-arrow-left" 
                size={16} 
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                Walked out: {formatDateTime(appointment.walkedOutAt)}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="calendar-plus" 
              size={16} 
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Created {formatDateTime(appointment.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.appointmentActions}>
          <IconButton
            icon="phone"
            size={20}
            mode="contained-tonal"
            onPress={() => {/* Handle call */}}
          />
          <IconButton
            icon="email"
            size={20}
            mode="contained-tonal"
            onPress={() => {/* Handle email */}}
          />
          {appointment.status === 'CONFIRMED' && (
            <>
              <IconButton
                icon="calendar-edit"
                size={20}
                mode="contained-tonal"
                onPress={() => handleAppointmentAction(appointment, 'reschedule')}
              />
              <IconButton
                icon="check-circle"
                size={20}
                mode="contained-tonal"
                onPress={() => handleAppointmentAction(appointment, 'complete')}
              />
            </>
          )}
          {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
            <IconButton
              icon="calendar-remove"
              size={20}
              mode="contained-tonal"
              onPress={() => handleAppointmentAction(appointment, 'cancel')}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderRequestCard = (request) => (
    <Card key={request.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <Avatar.Text 
              size={40} 
              label={request.visitorName?.charAt(0) || 'V'} 
              style={{ backgroundColor: theme.colors.tertiary }}
            />
            <View style={styles.textContainer}>
              <Text variant="titleMedium" style={[styles.visitorName, { color: theme.colors.onSurface }]}>
                {request.visitorName || 'Unknown Visitor'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {request.visitorEmail}
              </Text>
              {request.visitorPhone && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {request.visitorPhone}
                </Text>
              )}
            </View>
          </View>
          <Chip 
            style={[styles.statusChip, { backgroundColor: theme.colors.tertiary }]}
            textStyle={{ color: 'white' }}
            icon="clock-outline"
          >
            PENDING
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.requestDetails}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
            Reason:
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            {request.reason || 'No reason provided'}
          </Text>
          
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
            Preferred Time:
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatDateTime(request.preferredTime)}
          </Text>
        </View>
        
        <View style={styles.requestActions}>
          <Button
            mode="contained"
            onPress={() => handleRequestResponse(request, 'approve')}
            style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
            icon="check"
          >
            Accept
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleRequestResponse(request, 'reject')}
            style={styles.actionButton}
            textColor={theme.colors.error}
            icon="close"
          >
            Decline
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
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
                  icon="filter-variant"
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
                  setFilterStatus('in_progress');
                  setFilterMenuVisible(false);
                }}
                title="In Progress"
                leadingIcon={filterStatus === 'in_progress' ? 'check' : ''}
              />
              <Menu.Item
                onPress={() => {
                  setFilterStatus('completed');
                  setFilterMenuVisible(false);
                }}
                title="Completed"
                leadingIcon={filterStatus === 'completed' ? 'check' : ''}
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

        {/* Tab Selection */}
        {(user?.role === 'employee' || user?.role === 'admin') && (
          <Card style={[styles.tabCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <SegmentedButtons
                value={activeTab}
                onValueChange={setActiveTab}
                buttons={[
                  {
                    value: 'appointments',
                    label: `Appointments (${filteredAppointments.length})`,
                    icon: 'calendar',
                  },
                  {
                    value: 'requests',
                    label: `Requests (${filteredRequests.length})`,
                    icon: 'clock-outline',
                  },
                ]}
              />
            </Card.Content>
          </Card>
        )}

        {/* Incoming Requests Tab */}
        {activeTab === 'requests' && (user?.role === 'employee' || user?.role === 'admin') && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Incoming Requests ({filteredRequests.length})
            </Text>
            
            {filteredRequests.length > 0 ? (
              filteredRequests.map(renderRequestCard)
            ) : (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.emptyState}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={60} 
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>
                    No pending requests
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    New appointment requests will appear here
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Appointments ({filteredAppointments.length})
            </Text>
            
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(renderAppointmentCard)
            ) : (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.emptyState}>
                  <MaterialCommunityIcons 
                    name="calendar-blank" 
                    size={60} 
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>
                    No appointments found
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    {searchQuery ? 'Try adjusting your search criteria' : 'Appointments will appear here once scheduled'}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}
      </ScrollView>

      {/* Response Dialog */}
      <Portal>
        <Dialog visible={responseDialogVisible} onDismiss={() => setResponseDialogVisible(false)}>
          <Dialog.Title>
            {responseAction === 'approve' ? 'Approve Request' : 'Decline Request'}
          </Dialog.Title>
          <Dialog.Content>
            {responseAction === 'reject' ? (
              <TextInput
                label="Rejection Reason"
                value={rejectionReason}
                onChangeText={setRejectionReason}
                mode="outlined"
                multiline
                numberOfLines={3}
              />
            ) : (
              <View>
                <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
                  Approve appointment for {selectedRequest?.visitorName}?
                </Text>
                <TextInput
                  label="Alternate Time (Optional)"
                  value={alternateTime}
                  onChangeText={setAlternateTime}
                  mode="outlined"
                  placeholder="yyyy-MM-dd HH:mm:ss"
                />
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResponseDialogVisible(false)}>Cancel</Button>
            <Button onPress={submitResponse}>
              {responseAction === 'approve' ? 'Approve' : 'Decline'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog visible={cancelDialogVisible} onDismiss={() => setCancelDialogVisible(false)}>
          <Dialog.Title>Cancel Appointment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Cancellation Reason"
              value={cancelReason}
              onChangeText={setCancelReason}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDialogVisible(false)}>Cancel</Button>
            <Button onPress={cancelAppointment}>Confirm Cancel</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog visible={rescheduleDialogVisible} onDismiss={() => setRescheduleDialogVisible(false)}>
          <Dialog.Title>Reschedule Appointment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="New Date and Time"
              value={rescheduleTime}
              onChangeText={setRescheduleTime}
              mode="outlined"
              placeholder="yyyy-MM-dd HH:mm:ss"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRescheduleDialogVisible(false)}>Cancel</Button>
            <Button onPress={rescheduleAppointment}>Reschedule</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
    fontSize: 28,
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
  tabCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentInfo: {
    flex: 1,
  },
  requestInfo: {
    flex: 1,
  },
  visitorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginLeft: 10,
  },
  divider: {
    marginVertical: 12,
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  requestDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
});