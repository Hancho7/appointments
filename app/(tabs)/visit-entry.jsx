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
    Text,
    TextInput,
    useTheme
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { appointmentService } from '../../src/api/appointmentService';
import { organizationService } from '../../src/api/organizationService';

const validationSchema = Yup.object().shape({
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

export default function VisitEntryScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [membersLoading, setMembersLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(new Date());

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

    // Show error state if there's an error loading members
    if (error) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 16 }}>
                    Error loading organization members: {error}
                </Text>
                <Button mode="outlined" onPress={fetchOrganizationMembers}>
                    Retry
                </Button>
            </View>
        );
    }

    // Show message if no employees are available
    if (!Array.isArray(members) || employees.length === 0) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
                    No employees available to receive visit requests.
                </Text>
                <Button 
                    mode="outlined" 
                    onPress={fetchOrganizationMembers}
                    style={{ marginTop: 16 }}
                >
                    Refresh
                </Button>
            </View>
        );
    }

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

    const handleSubmit = async (values, { resetForm, setFieldError }) => {
        setIsLoading(true);
        
        try {
            // Prepare appointment data matching CreateAppointmentRequestDto
            const appointmentData = {
                visitorName: values.visitorName,
                visitorEmail: values.visitorEmail,
                visitorPhone: values.visitorPhone || null,
                employeeId: values.employeeId,
                reason: values.reason,
                preferredTime: formatDateTimeForBackend(values.preferredTime)
            };
            
            console.log('Submitting appointment data:', appointmentData);
            
            const response = await appointmentService.createAppointmentRequest(appointmentData);
            
            if (response.success) {
                Alert.alert(
                    'Success!', 
                    'Visit request has been sent to the employee.',
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
                throw new Error(response.message || 'Failed to submit visit request');
            }
        } catch (error) {
            console.error('Submit visit request error:', error);
            
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
                Alert.alert('Error', error.message || 'Failed to submit visit request. Please try again.');
            }
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
                // Date was selected, now show time picker
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
                // Time was selected
                setShowTimePicker(false);
                const finalDateTime = new Date(selectedDateTime);
                finalDateTime.setHours(selectedDate.getHours());
                finalDateTime.setMinutes(selectedDate.getMinutes());
                
                setSelectedDateTime(finalDateTime);
                setFieldValue('preferredTime', finalDateTime);
            }
        }
    };

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                    <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                        New Visit Entry
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
                        Enter visitor details and route to appropriate employee
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
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
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
                                    Send Visit Request
                                </Button>
                            </View>
                        )}
                    </Formik>
                </Card.Content>
            </Card>
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