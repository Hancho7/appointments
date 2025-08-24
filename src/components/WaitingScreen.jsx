// src/components/WaitingScreen.jsx
import { router } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { authService } from "../api/authService";
import { organizationService } from "../api/organizationService";
import { loginSuccess, logout } from "../store/slices/auth/loginSlice";
import { setOrganization } from "../store/slices/organizationSlice";

export default function WaitingScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { currentOrganization } = useSelector(
    (state) => state.organization || {}
  );
  
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkApprovalStatus();
    setRefreshing(false);
  };

  const checkApprovalStatus = async () => {
    setIsCheckingStatus(true);
    try {
      // Re-fetch user data to check if status has changed
      const updatedUser = await authService.getCurrentUser();
      
      if (updatedUser.status === "approved") {
        // Update Redux state with new user data
        dispatch(loginSuccess({
          user: updatedUser,
          token: user.token // Keep the existing token
        }));

        // Get organization data
        if (updatedUser.organizationId) {
          try {
            const organization = await organizationService.getCurrentOrganization();
            dispatch(setOrganization(organization));
          } catch (error) {
            console.warn("Failed to get organization:", error.message);
          }
        }

        // Navigate to main app
        router.replace("/(tabs)");
      } else if (updatedUser.status === "rejected") {
        // Handle rejection - could show a different screen or redirect to setup
        router.replace("/(setup)/organization-choice");
      }
      // If still pending, inactive, or undefined, do nothing - stay on waiting screen
    } catch (error) {
      console.error("Failed to check approval status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    router.replace("/");
  };

  const handleChangeOrganization = () => {
    router.replace("/(setup)/organization-choice");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          {/* Icon */}
          <MaterialCommunityIcons
            name="clock-outline"
            size={100}
            color={theme.colors.primary}
            style={styles.icon}
          />

          {/* Title */}
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Approval Pending
          </Text>

          {/* Subtitle */}
          <Text
            variant="titleMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Your request is being reviewed
          </Text>

          {/* Description */}
          <Text
            variant="bodyLarge"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            Your request to join{" "}
            <Text style={{ fontWeight: "bold", color: theme.colors.onSurface }}>
              {currentOrganization?.name || "the organization"}
            </Text>{" "}
            is currently being reviewed by an administrator.
          </Text>

          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            You'll receive a notification once your request has been approved.
            In the meantime, you can check your status by pulling down to refresh.
          </Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: theme.colors.tertiaryContainer }]}>
            <MaterialCommunityIcons
              name="account-clock"
              size={20}
              color={theme.colors.onTertiaryContainer}
            />
            <Text
              variant="labelLarge"
              style={[styles.statusText, { color: theme.colors.onTertiaryContainer }]}
            >
              Status: {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Pending Review'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={checkApprovalStatus}
              loading={isCheckingStatus}
              disabled={isCheckingStatus}
              style={styles.button}
              icon="refresh"
            >
              Check Status
            </Button>

            <Button
              mode="outlined"
              onPress={handleChangeOrganization}
              style={styles.button}
              icon="swap-horizontal"
            >
              Change Organization
            </Button>

            <Button
              mode="text"
              onPress={handleLogout}
              style={styles.button}
              textColor={theme.colors.error}
            >
              Sign Out
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Help Section */}
      <Card style={[styles.helpCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={[styles.helpTitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Need Help?
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}
          >
            If your request is taking longer than expected, you can contact your organization's administrator directly or try joining a different organization.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  cardContent: {
    alignItems: "center",
    padding: 30,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  statusText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
  helpCard: {
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
  },
  helpTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  helpText: {
    lineHeight: 20,
  },
});