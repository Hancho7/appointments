import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { organizationService } from "../../src/api/organizationService";
import LoadingScreen from "../../src/components/LoadingScreen";
import { setMembers, setOrganization, setPendingRequests } from "../../src/store/slices/organizationSlice";

export default function DashboardScreen({ navigation }) {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();

  // Safe Redux selectors with default values
  const { user } = useSelector((state) => state.auth || {});
  const { currentOrganization, members = [], pendingRequests = [] } = useSelector(
    (state) => state.organization || {}
  );

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  console.log("Current Organization:", currentOrganization);
  console.log("Members:", members);
  console.log("user:", user);
  const { appointments = [], incomingRequests = [] } = useSelector(
    (state) => state.appointment || {}
  );
  const { notifications = [], unreadCount = 0 } = useSelector(
    (state) => state.notification || {}
  );

  const [refreshing, setRefreshing] = React.useState(false);

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Fetch organization data
      const organizationResponse = await organizationService.getCurrentOrganization();
      dispatch(setOrganization(organizationResponse));

      // Fetch members
      const membersResponse = await organizationService.getOrganizationMembers();
      dispatch(setMembers(membersResponse));

      // Fetch pending requests
      const requestsResponse = await organizationService.getPendingJoinRequests();
      dispatch(setPendingRequests(requestsResponse));

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const todayAppointments = appointments.filter(apt => {
    if (!apt.confirmedTime && !apt.preferredTime) return false;
    const appointmentDate = new Date(apt.confirmedTime || apt.preferredTime);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = appointments
    .filter(apt => {
      if (!apt.confirmedTime && !apt.preferredTime) return false;
      const appointmentDate = new Date(apt.confirmedTime || apt.preferredTime);
      const now = new Date();
      return appointmentDate > now && apt.status === 'CONFIRMED';
    })
    .slice(0, 3);

    if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <Avatar.Image
              size={56}
              source={{
                uri: user?.data?.profilePicture || "https://via.placeholder.com/56",
              }}
            />
            <View style={styles.userText}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {getGreeting()}
              </Text>
              <Text variant="headlineSmall" style={[styles.userName, { color: theme.colors.onSurface }]}>
                {user?.data?.name || "User"}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {user?.data?.role.charAt(0).toUpperCase() + user?.data?.role.slice(1) || "User"}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <IconButton
              icon="bell"
              size={24}
              onPress={() => router.push("../notifications")}
              style={styles.headerButton}
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onError }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Organization Info */}
        {/* {currentOrganization?.data && (
          <View style={styles.orgInfo}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {currentOrganization.data.name}
            </Text>
            <View style={styles.orgStats}>
              <Chip
                mode="outlined"
                compact
                style={styles.orgChip}
                textStyle={{ fontSize: 12 }}
              >
                {members?.data.length} members
              </Chip>
              {pendingRequests.length > 0 && (
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.orgChip, { borderColor: theme.colors.tertiary }]}
                  textStyle={{ fontSize: 12, color: theme.colors.tertiary }}
                >
                  {pendingRequests.length} pending
                </Chip>
              )}
            </View>
          </View>
        )} */}
      </Surface>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name="calendar-today"
                size={24}
                color={theme.colors.onPrimaryContainer}
              />
            </View>
            <View style={styles.statText}>
              <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                {todayAppointments.length}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Today's Appointments
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color={theme.colors.onSecondaryContainer}
              />
            </View>
            <View style={styles.statText}>
              <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                {incomingRequests.length}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Pending Appointments
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions for Front Desk */}
      {user?.data?.role === "frontdesk" && (
        <Card style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                Quick Actions
              </Text>
            </View>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="account-plus"
                onPress={() => navigation.navigate("VisitEntry")}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                New Visit
              </Button>
              <Button
                mode="outlined"
                icon="calendar"
                onPress={() => navigation.navigate("Appointments")}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                View Appointments
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                Upcoming Appointments
              </Text>
              <Button
                mode="text"
                compact
                onPress={() => navigation.navigate("Appointments")}
              >
                View All
              </Button>
            </View>
            
            {upcomingAppointments.map((appointment, index) => (
              <View key={appointment.id} style={styles.appointmentItem}>
                <View style={styles.appointmentTime}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                    {formatDate(appointment.confirmedTime || appointment.preferredTime)}
                  </Text>
                </View>
                <View style={styles.appointmentDetails}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                    {appointment.visitorName}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {appointment.reason}
                  </Text>
                  {user?.role === 'frontdesk' && appointment.employeeName && (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      with {appointment.employeeName}
                    </Text>
                  )}
                </View>
                <Chip
                  mode="flat"
                  compact
                  style={{ backgroundColor: theme.colors.secondaryContainer }}
                  textStyle={{ color: theme.colors.onSecondaryContainer, fontSize: 11 }}
                >
                  {appointment.status}
                </Chip>
                {index < upcomingAppointments.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Pending Requests for Employees */}
      {(user?.data?.role === "employee" || user?.data?.role === "admin") && incomingRequests.length > 0 && (
        <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                Pending Appointments
              </Text>
              <Button
                mode="text"
                compact
                onPress={() => navigation.navigate("Appointments")}
              >
                View All
              </Button>
            </View>
            
            {incomingRequests.slice(0, 3).map((request, index) => (
              <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                    {request.visitorName}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {request.reason}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Preferred: {formatDate(request.preferredTime)}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <IconButton
                    icon="check"
                    size={20}
                    mode="contained"
                    containerColor={theme.colors.secondaryContainer}
                    iconColor={theme.colors.onSecondaryContainer}
                    onPress={() => {/* TODO: Handle accept */}}
                  />
                  <IconButton
                    icon="close"
                    size={20}
                    mode="contained"
                    containerColor={theme.colors.errorContainer}
                    iconColor={theme.colors.onErrorContainer}
                    onPress={() => {/* TODO: Handle reject */}}
                  />
                </View>
                {index < incomingRequests.slice(0, 3).length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Recent Activity */}
      <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface, marginTop: 16 }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              Recent Activity
            </Text>
          </View>
          
          {notifications.length > 0 ? (
            notifications.slice(0, 4).map((notification, index) => (
              <View key={notification.id || index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialCommunityIcons
                    name={notification.type === "appointment" ? "calendar" : "bell"}
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    {notification.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDate(notification.createdAt || notification.timestamp)}
                  </Text>
                </View>
                {!notification.read && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                )}
                {index < notifications.slice(0, 4).length - 1 && <Divider style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                No recent activity
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  header: {
    elevation: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userText: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: "600",
    marginTop: 2,
  },
  headerActions: {
    position: 'relative',
  },
  headerButton: {
    margin: 0,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  orgInfo: {
    alignItems: 'flex-start',
  },
  orgStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  orgChip: {
    height: 28,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    elevation: 1,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statText: {
    flex: 1,
  },
  actionCard: {
    margin: 16,
    elevation: 1,
  },
  contentCard: {
    margin: 16,
    marginTop: 16,
    marginTop: 0,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    height: 48,
  },
  appointmentItem: {
    paddingVertical: 12,
  },
  appointmentTime: {
    marginBottom: 4,
  },
  appointmentDetails: {
    marginBottom: 8,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: "row",
    gap: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    position: 'relative',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});