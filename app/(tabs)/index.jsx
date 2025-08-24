//(tabs)/index.jsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Badge,
  Card,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { notificationService } from "../../src/api/notificationService";
import { organizationService } from "../../src/api/organizationService";
import { setMembers, setOrganization, setPendingRequests } from "../../src/store/slices/organizationSlice";

export default function DashboardScreen({ navigation }) {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();

  // Safe Redux selectors with default values
  const { user } = useSelector((state) => state.auth || {});
  const { currentOrganization } = useSelector(
    (state) => state.organization || {}
  );
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
  }, [fetchDashboardData]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Fetch organization data
      const organizationResponse =
        await organizationService.getCurrentOrganization();
      console.log("Fetched organization:", organizationResponse);
      dispatch(setOrganization(organizationResponse));

      // Fetch members
      const membersResponse =
        await organizationService.getOrganizationMembers();
      console.log("Fetched members:", membersResponse);
      dispatch(setMembers(membersResponse));

      // Fetch pending requests
      const requestsResponse =
        await organizationService.getPendingJoinRequests();
      dispatch(setPendingRequests(requestsResponse));

      // ... other data fetches
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Refresh handler
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return theme.colors.tertiary;
      case "approved":
        return theme.colors.secondary;
      case "rejected":
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const handleNotificationPress = () => {
    router.push("../notifications");
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Refresh notifications after marking as read
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Avatar.Image
              size={50}
              source={{
                uri: user?.profilePicture || "https://via.placeholder.com/50",
              }}
            />
            <View style={styles.greetingContainer}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {getGreeting()},
              </Text>
              <Text
                variant="titleLarge"
                style={[styles.userName, { color: theme.colors.onSurface }]}
              >
                {user?.name || "User"}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="bell"
              size={24}
              onPress={handleNotificationPress}
              style={{ position: "relative" }}
            />
            {unreadCount > 0 && (
              <Badge style={styles.badge} size={20}>
                {unreadCount}
              </Badge>
            )}
            <IconButton
              icon="account"
              size={24}
              onPress={() => router.push("../profile")}
            />
          </View>
        </View>
      </Surface>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={30}
              color={theme.colors.primary}
            />
            <View>
              <Text
                variant="titleLarge"
                style={{ color: theme.colors.onSurface }}
              >
                {appointments.length}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Today's Appointments
              </Text>
            </View>
          </Card.Content>
        </Card>
        <Card
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={30}
              color={theme.colors.primary}
            />
            <View>
              <Text
                variant="titleLarge"
                style={{ color: theme.colors.onSurface }}
              >
                {incomingRequests.length}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Pending Requests
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Role-based Quick Actions */}
      {user?.role === "frontdesk" && (
        <Card
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text
              variant="titleLarge"
              style={{ color: theme.colors.onSurface, marginBottom: 10 }}
            >
              Quick Actions
            </Text>
            <View style={styles.actionButtons}>
              <IconButton
                icon="account-plus"
                size={40}
                mode="contained"
                onPress={() => navigation.navigate("VisitEntry")}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                iconColor={theme.colors.onPrimary}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Add New Visit
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {user?.role === "employee" && incomingRequests.length > 0 && (
        <Card
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text
              variant="titleLarge"
              style={{ color: theme.colors.onSurface, marginBottom: 10 }}
            >
              Incoming Requests
            </Text>
            {incomingRequests.slice(0, 3).map((request, index) => (
              <View key={request.id || index} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurface,
                      fontWeight: "bold",
                    }}
                  >
                    {request.visitorName}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {request.reason}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      fontSize: 12,
                    }}
                  >
                    Preferred: {request.preferredTime}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <IconButton
                    icon="check"
                    size={20}
                    mode="contained"
                    style={{ backgroundColor: theme.colors.secondary }}
                    iconColor={theme.colors.onSecondary}
                    onPress={() => {
                      /* TODO: Handle accept request */
                    }}
                  />
                  <IconButton
                    icon="close"
                    size={20}
                    mode="contained"
                    style={{ backgroundColor: theme.colors.error }}
                    iconColor={theme.colors.onError}
                    onPress={() => {
                      /* TODO: Handle reject request */
                    }}
                  />
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Recent Activity - Real notifications from backend */}
      <Card
        style={[styles.activityCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content>
          <Text
            variant="titleLarge"
            style={{ color: theme.colors.onSurface, marginBottom: 10 }}
          >
            Recent Activity
          </Text>
          {notifications.slice(0, 5).map((notification, index) => (
            <View key={notification.id || index} style={styles.activityItem}>
              <MaterialCommunityIcons
                name={notification.type === "appointment" ? "calendar" : "bell"}
                size={20}
                color={theme.colors.primary}
              />
              <View style={styles.activityContent}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurface }}
                >
                  {notification.title}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
                >
                  {new Date(
                    notification.createdAt || notification.timestamp
                  ).toLocaleTimeString()}
                </Text>
              </View>
              {!notification.read && (
                <IconButton
                  icon="check"
                  size={16}
                  onPress={() => handleMarkNotificationAsRead(notification.id)}
                />
              )}
            </View>
          ))}
          {notifications.length === 0 && (
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No recent activity
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingContainer: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 35,
    zIndex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  actionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  actionButtons: {
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    width: 80,
    height: 80,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: "row",
    gap: 5,
  },
  activityCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 15,
  },
  activityContent: {
    flex: 1,
  },
});