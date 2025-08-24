//(tabs)/visit-entry.jsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Menu,
    Searchbar,
    SegmentedButtons,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { appointmentService } from '../../src/api/appointmentService';
import { organizationService } from '../../src/api/organizationService';
import { visitorLogService } from '../../src/api/visitorLogService';

// Validation schemas
const appointmentValidationSchema = Yup.object().shape({
  visitorName: Yup.string()
    .min(2, 'Visitor name must be at least 2 characters')
    .required('Visitor name is required'),
  visitorEmail: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  visitorPhone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  reason: Yup.string()
    .required('Reason for visit is required'),
  preferredTime: Yup.date()
    .min(new Date(), 'Preferred time must be in the future')
    .required('Preferred time is required'),
  employeeId: Yup.number()
    .required('Please select an employee'),
});

const walkInOutValidationSchema = Yup.object().shape({
  confirmationCode: Yup.string()
    .required('Confirmation code is required'),
  notes: Yup.string(),
});

export default function VisitEntryScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('appointment');
    const [isLoading, setIsLoading] = useState(false);
    const [membersLoading, setMembersLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    
    // Appointment form state
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(new Date());

    // Walk-in/out state
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [visitorStatus, setVisitorStatus] = useState(null);

    // Fetch organization members on component mount
    useEffect(() => {
        fetchOrganizationMembers();
    }, []);

    const fetchOrganizationMembers = async () => {
        try {
            setMembersLoading(true);
            setError(null);
            
            const response = await organizationService.getOrganizationMembers();
            
            if (response.success) {
                setMembers(response.data || []);
            } else {
                throw new Error(response.message || 'Failed to fetch organization members');
            }
        } catch (error) {
            console.error('Error fetching organization members:', error);
            setError(error.message);
        } finally {
            setMembersLoading(false);
        }
    };

    // Filter employees and admins
    const employees = Array.isArray(members) 
        ? members.filter(member => 
            member?.role === 'EMPLOYEE' || member?.role === 'ADMIN'
          )
        : [];

    const formatDateTime = (date) => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDateTimeForBackend = (date) => {
        // Format: yyyy-MM-dd HH:mm:ss
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Handle appointment creation
    const handleAppointmentSubmit = async (values, { resetForm, setFieldError }) => {
        setIsLoading(true);
        
        try {
            const appointmentData = {
                visitorName: values.visitorName,
                visitorEmail: values.visitorEmail,
                visitorPhone: values.visitorPhone || null,
                employeeId: values.employeeId,
                reason: values.reason,
                preferredTime: formatDateTimeForBackend(values.preferredTime)
            };
            
            console.log('Creating appointment:', appointmentData);
            
            const response = await appointmentService.createAppointmentRequest(appointmentData);
            
            if (response.success) {
                Alert.alert(
                    'Success!', 
                    'Appointment request has been sent to the employee.',
                    [{ 
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            setSelectedEmployee(null);
                            setSelectedDateTime(new Date());
                        }
                    }]
                );
            } else {
                throw new Error(response.message || 'Failed to create appointment');
            }
        } catch (error) {
            console.error('Create appointment error:', error);
            
            // Handle validation errors from backend
            if (error.message.includes('Employee ID is required')) {
                setFieldError('employeeId', 'Please select an employee');
            } else if (error.message.includes('Visitor name is required')) {
                setFieldError('visitorName', error.message);
            } else if (error.message.includes('Visitor email is required')) {
                setFieldError('visitorEmail', error.message);
            } else if (error.message.includes('valid email')) {
                setFieldError('visitorEmail', 'Please enter a valid email address');
            } else if (error.message.includes('Reason is required')) {
                setFieldError('reason', error.message);
            } else if (error.message.includes('future')) {
                setFieldError('preferredTime', 'Preferred time must be in the future');
            } else {
                Alert.alert('Error', error.message || 'Failed to create appointment. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Search appointments by confirmation code
    const searchAppointments = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);
            // Search in appointments first
            const appointments = await appointmentService.searchAppointments(query);
            setSearchResults(appointments.data || []);
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Failed to search appointments');
        } finally {
            setSearchLoading(false);
        }
    };

    // Check visitor status
    const checkVisitorStatus = async (confirmationCode) => {
        try {
            const response = await visitorLogService.checkVisitorStatus(confirmationCode);
            setVisitorStatus(response.data);
        } catch (error) {
            console.error('Status check error:', error);
            setVisitorStatus(null);
        }
    };

    // Handle walk-in
    const handleWalkIn = async (values, { resetForm }) => {
        setIsLoading(true);
        
        try {
            const response = await visitorLogService.recordWalkIn({
                confirmationCode: values.confirmationCode,
                notes: values.notes
            });
            
            if (response.success) {
                Alert.alert(
                    'Walk-in Recorded!', 
                    `${response.data.visitorName} has been checked in successfully.`,
                    [{ 
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            setSelectedAppointment(null);
                            setVisitorStatus(null);
                        }
                    }]
                );
            } else {
                throw new Error(response.message || 'Failed to record walk-in');
            }
        } catch (error) {
            console.error('Walk-in error:', error);
            Alert.alert('Error', error.message || 'Failed to record walk-in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle walk-out
    const handleWalkOut = async (values, { resetForm }) => {
        setIsLoading(true);
        
        try {
            const response = await visitorLogService.recordWalkOut({
                confirmationCode: values.confirmationCode,
                notes: values.notes
            });
            
            if (response.success) {
                Alert.alert(
                    'Walk-out Recorded!', 
                    `${response.data.visitorName} has been checked out successfully.`,
                    [{ 
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            setSelectedAppointment(null);
                            setVisitorStatus(null);
                        }
                    }]
                );
            } else {
                throw new Error(response.message || 'Failed to record walk-out');
            }
        } catch (error) {
            console.error('Walk-out error:', error);
            Alert.alert('Error', error.message || 'Failed to record walk-out. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (event, selectedDate, setFieldValue) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            setShowTimePicker(false);
            return;
        }

        if (selectedDate) {
            if (showDatePicker) {
                setShowDatePicker(false);
                setSelectedDateTime(prev => {
                    const newDate = new Date(prev);
                    newDate.setFullYear(selectedDate.getFullYear());
                    newDate.setMonth(selectedDate.getMonth());
                    newDate.setDate(selectedDate.getDate());
                    return newDate;
                });
                setShowTimePicker(true);
            } else if (showTimePicker) {
                setShowTimePicker(false);
                const finalDateTime = new Date(selectedDateTime);
                finalDateTime.setHours(selectedDate.getHours());
                finalDateTime.setMinutes(selectedDate.getMinutes());
                
                setSelectedDateTime(finalDateTime);
                setFieldValue('preferredTime', finalDateTime);
            }
        }
    };

    // Show loading indicator if data is being fetched
    if (membersLoading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
                    Loading organization members...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Tab Selection */}
            <Card style={[styles.tabCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                    <SegmentedButtons
                        value={activeTab}
                        onValueChange={setActiveTab}
                        buttons={[
                            {
                                value: 'appointment',
                                label: 'New Appointment',
                                icon: 'calendar-plus',
                            },
                            {
                                value: 'walkin',
                                label: 'Walk-in',
                                icon: 'account-arrow-right',
                            },
                            {
                                value: 'walkout',
                                label: 'Walk-out',
                                icon: 'account-arrow-left',
                            },
                        ]}
                    />
                </Card.Content>
            </Card>

            {/* Appointment Creation Form */}
            {activeTab === 'appointment' && (
                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                            Create New Appointment
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
                            Schedule a new appointment for a visitor
                        </Text>

                        <Formik
                            initialValues={{
                                visitorName: '',
                                visitorEmail: '',
                                visitorPhone: '',
                                reason: '',
                                preferredTime: new Date(),
                                employeeId: '',
                            }}
                            validationSchema={appointmentValidationSchema}
                            onSubmit={handleAppointmentSubmit}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                                <View>
                                    <TextInput
                                        label="Visitor Name *"
                                        value={values.visitorName}
                                        onChangeText={handleChange('visitorName')}
                                        onBlur={handleBlur('visitorName')}
                                        error={touched.visitorName && errors.visitorName}
                                        style={styles.input}
                                        mode="outlined"
                                    />
                                    {touched.visitorName && errors.visitorName && (
                                        <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                                            {errors.visitorName}
                                        </Text>
                                    )}

                                    <TextInput
                                        label="Email *"
                                        value={values.visitorEmail}
                                        onChangeText={handleChange('visitorEmail')}
                                        onBlur={handleBlur('visitorEmail')}
                                        error={touched.visitorEmail && errors.visitorEmail}
                                        style={styles.input}
                                        mode="outlined"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {touched.visitorEmail && errors.visitorEmail && (
                                        <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                                            {errors.visitorEmail}
                                        </Text>
                                    )}

                                    <TextInput
                                        label="Phone Number"
                                        value={values.visitorPhone}
                                        onChangeText={handleChange('visitorPhone')}
                                        onBlur={handleBlur('visitorPhone')}
                                        error={touched.visitorPhone && errors.visitorPhone}
                                        style={styles.input}
                                        mode="outlined"
                                        keyboardType="phone-pad"
                                    />
                                    {touched.visitorPhone && errors.visitorPhone && (
                                        <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                                            {errors.visitorPhone}
                                        </Text>
                                    )}

                                    <TextInput
                                        label="Reason for Visit *"
                                        value={values.reason}
                                        onChangeText={handleChange('reason')}
                                        onBlur={handleBlur('reason')}
                                        error={touched.reason && errors.reason}
                                        style={styles.input}
                                        mode="outlined"
                                        multiline
                                        numberOfLines={3}
                                    />
                                    {touched.reason && errors.reason && (
                                        <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                                            {errors.reason}
                                        </Text>
                                    )}

                                    <TextInput
                                        label="Preferred Date & Time *"
                                        value={formatDateTime(selectedDateTime)}
                                        onFocus={() => setShowDatePicker(true)}
                                        error={touched.preferredTime && errors.preferredTime}
                                        style={styles.input}
                                        mode="outlined"
                                        editable={false}
                                        right={<TextInput.Icon icon="calendar" />}
                                    />
                                    {touched.preferredTime && errors.preferredTime && (
                                        <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                                            {errors.preferredTime}
                                        </Text>
                                    )}

                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={selectedDateTime}
                                            mode="date"
                                            display="default"
                                            minimumDate={new Date()}
                                            onChange={(event, date) => handleDateChange(event, date, setFieldValue)}
                                        />
                                    )}

                                    {showTimePicker && (
                                        <DateTimePicker
                                            value={selectedDateTime}
                                            mode="time"
                                            display="default"
                                            onChange={(event, date) => handleDateChange(event, date, setFieldValue)}
                                        />
                                    )}

                                    <Menu
                                        visible={menuVisible}
                                        onDismiss={() => setMenuVisible(false)}
                                        anchor={
                                            <TextInput
                                                label="Select Employee *"
                                                value={selectedEmployee ? selectedEmployee.name : ''}
                                                onFocus={() => setMenuVisible(true)}
                                                error={touched.employeeId && errors.employeeId}
                                                style={styles.input}
                                                mode="outlined"
                                                editable={false}
                                                right={<TextInput.Icon icon="menu-down" />}
                                            />
                                        }
                                    >
                                        {employees.length > 0 ? (
                                            employees.map((employee) => (
                                                <Menu.Item
                                                    key={employee?.id || Math.random()}
                                                    onPress={() => {
                                                        setSelectedEmployee(employee);
                                                        setFieldValue('employeeId', employee.id);
                                                        setMenuVisible(false);
                                                    }}
                                                    title={`${employee?.name || 'Unknown'} (${employee?.role || 'Unknown'})`}
                                                />
                                            ))
                                        ) : (
                                            <Menu.Item
                                                title="No employees available"
                                                disabled
                                            />
                                        )}
                                    </Menu>
                                    {touched.employeeId && errors.employeeId && (
                                        <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                                            {errors.employeeId}
                                        </Text>
                                    )}

                                    <Button
                                        mode="contained"
                                        onPress={handleSubmit}
                                        style={styles.submitButton}
                                        loading={isLoading}
                                        disabled={isLoading}
                                        icon="send"
                                    >
                                        Create Appointment
                                    </Button>
                                </View>
                            )}
                        </Formik>
                    </Card.Content>
                </Card>
            )}

            {/* Walk-in Form */}
            {activeTab === 'walkin' && (
                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                            Visitor Walk-in
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
                            Record visitor arrival using confirmation code
                        </Text>

                        <Formik
                            initialValues={{
                                confirmationCode: '',
                                notes: '',
                            }}
                            validationSchema={walkInOutValidationSchema}
                            onSubmit={handleWalkIn}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                <View>
                                    <Searchbar
                                        placeholder="Enter confirmation code..."
                                        onChangeText={(text) => {
                                            handleChange('confirmationCode')(text);
                                            searchAppointments(text);
                                            if (text.length > 3) {
                                                checkVisitorStatus(text);
                                            }
                                        }}
                                        value={values.confirmationCode}
                                        style={styles.searchInput}
                                        loading={searchLoading}
                                    />
                                    {touched.confirmationCode && errors.confirmationCode && (
                                        <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                                            {errors.confirmationCode}
                                        </Text>
                                    )}

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <Card style={[styles.searchResults, { backgroundColor: theme.colors.surfaceVariant }]}>
                                            <Card.Content>
                                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                                                    Search Results:
                                                </Text>
                                                {searchResults.slice(0, 3).map((appointment) => (
                                                    <View key={appointment.id} style={styles.searchResultItem}>
                                                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                                            {appointment.visitorName}
                                                        </Text>
                                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                            Code: {appointment.confirmationCode} • {appointment.status}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </Card.Content>
                                        </Card>
                                    )}

                                    {/* Visitor Status */}
                                    {visitorStatus && (
                                        <Card style={[
                                            styles.statusCard, 
                                            { 
                                                backgroundColor: visitorStatus.isInside 
                                                    ? theme.colors.errorContainer 
                                                    : theme.colors.secondaryContainer 
                                            }
                                        ]}>
                                            <Card.Content style={styles.statusContent}>
                                                <MaterialCommunityIcons
                                                    name={visitorStatus.isInside ? "account-check" : "account-plus"}
                                                    size={24}
                                                    color={visitorStatus.isInside ? theme.colors.error : theme.colors.secondary}
                                                />
                                                <Text variant="bodyMedium" style={{ 
                                                    color: visitorStatus.isInside ? theme.colors.onErrorContainer : theme.colors.onSecondaryContainer,
                                                    marginLeft: 8
                                                }}>
                                                    {visitorStatus.isInside ? "Visitor is already inside" : "Ready for walk-in"}
                                                </Text>
                                            </Card.Content>
                                        </Card>
                                    )}

                                    <TextInput
                                        label="Notes (Optional)"
                                        value={values.notes}
                                        onChangeText={handleChange('notes')}
                                        onBlur={handleBlur('notes')}
                                        style={styles.input}
                                        mode="outlined"
                                        multiline
                                        numberOfLines={3}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={handleSubmit}
                                        style={styles.submitButton}
                                        loading={isLoading}
                                        disabled={isLoading || visitorStatus?.isInside}
                                        icon="account-arrow-right"
                                    >
                                        Record Walk-in
                                    </Button>
                                </View>
                            )}
                        </Formik>
                    </Card.Content>
                </Card>
            )}

            {/* Walk-out Form */}
            {activeTab === 'walkout' && (
                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                            Visitor Walk-out
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
                            Record visitor departure using confirmation code
                        </Text>

                        <Formik
                            initialValues={{
                                confirmationCode: '',
                                notes: '',
                            }}
                            validationSchema={walkInOutValidationSchema}
                            onSubmit={handleWalkOut}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                <View>
                                    <Searchbar
                                        placeholder="Enter confirmation code..."
                                        onChangeText={(text) => {
                                            handleChange('confirmationCode')(text);
                                            searchAppointments(text);
                                            if (text.length > 3) {
                                                checkVisitorStatus(text);
                                            }
                                        }}
                                        value={values.confirmationCode}
                                        style={styles.searchInput}
                                        loading={searchLoading}
                                    />
                                    {touched.confirmationCode && errors.confirmationCode && (
                                        <Text variant="bodyMedium" style={[styles.error, { color: theme.colors.error }]}>
                                            {errors.confirmationCode}
                                        </Text>
                                    )}

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <Card style={[styles.searchResults, { backgroundColor: theme.colors.surfaceVariant }]}>
                                            <Card.Content>
                                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                                                    Search Results:
                                                </Text>
                                                {searchResults.slice(0, 3).map((appointment) => (
                                                    <View key={appointment.id} style={styles.searchResultItem}>
                                                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                                            {appointment.visitorName}
                                                        </Text>
                                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                            Code: {appointment.confirmationCode} • {appointment.status}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </Card.Content>
                                        </Card>
                                    )}

                                    {/* Visitor Status */}
                                    {visitorStatus && (
                                        <Card style={[
                                            styles.statusCard, 
                                            { 
                                                backgroundColor: !visitorStatus.isInside 
                                                    ? theme.colors.errorContainer 
                                                    : theme.colors.secondaryContainer 
                                            }
                                        ]}>
                                            <Card.Content style={styles.statusContent}>
                                                <MaterialCommunityIcons
                                                    name={!visitorStatus.isInside ? "account-remove" : "account-arrow-left"}
                                                    size={24}
                                                    color={!visitorStatus.isInside ? theme.colors.error : theme.colors.secondary}
                                                />
                                                <Text variant="bodyMedium" style={{ 
                                                    color: !visitorStatus.isInside ? theme.colors.onErrorContainer : theme.colors.onSecondaryContainer,
                                                    marginLeft: 8
                                                }}>
                                                    {!visitorStatus.isInside ? "Visitor is not inside" : "Ready for walk-out"}
                                                </Text>
                                            </Card.Content>
                                        </Card>
                                    )}

                                    <TextInput
                                        label="Notes (Optional)"
                                        value={values.notes}
                                        onChangeText={handleChange('notes')}
                                        onBlur={handleBlur('notes')}
                                        style={styles.input}
                                        mode="outlined"
                                        multiline
                                        numberOfLines={3}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={handleSubmit}
                                        style={styles.submitButton}
                                        loading={isLoading}
                                        disabled={isLoading || !visitorStatus?.isInside}
                                        icon="account-arrow-left"
                                    >
                                        Record Walk-out
                                    </Button>
                                </View>
                            )}
                        </Formik>
                    </Card.Content>
                </Card>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    tabCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
    },
    card: {
        marginBottom: 24,
        borderRadius: 12,
        elevation: 2,
        paddingVertical: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    searchInput: {
        marginBottom: 12,
        elevation: 2,
    },
    searchResults: {
        marginBottom: 12,
        elevation: 1,
    },
    searchResultItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    statusCard: {
        marginBottom: 12,
        elevation: 1,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    error: {
        fontSize: 13,
        marginBottom: 8,
    },
    submitButton: {
        marginTop: 16,
        borderRadius: 8,
        paddingVertical: 6,
    },
});