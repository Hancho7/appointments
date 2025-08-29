//(tabs)/members.jsx
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  IconButton,
  Menu,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { organizationService } from "../../src/api/organizationService";
import InviteMemberModal from "../../src/components/InviteMemberModal";
import {
  removeMember,
  setMembers,
  setPendingRequests,
  updateMemberRole,
} from "../../src/store/slices/organizationSlice";
import {
  copyToClipboard,
  shareOrganizationCode,
} from "../../src/utils/shareUtils";

export default function MembersScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    members = [],
    pendingRequests = [],
    currentOrganization,
  } = useSelector((state) => state.organization || {});
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [memberMenuVisible, setMemberMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, requestsData] = await Promise.all([
        organizationService.getOrganizationMembers(),
        organizationService.getPendingJoinRequests(),
      ]);
      dispatch(
        setMembers(
          Array.isArray(membersData) ? membersData : membersData?.data || []
        )
      );
      console.log("request Data:", requestsData);
      console.log("request Data id:", requestsData.data.id);
      const pendingRequestsArray = Array.isArray(requestsData?.data)
        ? requestsData.data.map((req) => ({
            ...req.user,
            requestId: req.id,
            status: req.status,
            processedBy: req.processedBy,
            createdAt: req.createdAt,
            processedAt: req.processedAt,
          }))
        : [];
      console.log("Pending Requests:", pendingRequestsArray);
      dispatch(setPendingRequests(pendingRequestsArray));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      Alert.alert("Error", "Failed to load organization data");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSent = () => {
    // Refresh data after sending invitation
    fetchData();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handlePendingRequest = async (requestId, action, role = "employee") => {
    console.log("Handling request:", requestId, action, role);
    try {
      await organizationService.handleJoinRequest(requestId, action, role);
      Alert.alert(
        action === "approve" ? "Success" : "Declined",
        action === "approve"
          ? "Request approved successfully"
          : "Request has been declined"
      );
      await fetchData();
    } catch (error) {
      console.error("Failed to handle request:", error);
      Alert.alert("Error", "Failed to process request");
    }
  };

  const handleMemberAction = async (memberId, action, newRole = null) => {
    try {
      if (action === "changeRole") {
        await organizationService.updateMemberRole(memberId, newRole);
        dispatch(updateMemberRole({ id: memberId, role: newRole }));
        Alert.alert("Success", "Member role updated successfully");
      } else if (action === "remove") {
        Alert.alert(
          "Remove Member",
          "Are you sure you want to remove this member?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Remove",
              style: "destructive",
              onPress: async () => {
                await organizationService.removeMember(memberId);
                dispatch(removeMember(memberId));
                Alert.alert("Success", "Member removed successfully");
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to perform member action:", error);
      Alert.alert("Error", "Failed to perform action");
    } finally {
      setMemberMenuVisible(false);
      setSelectedMenuId(null);
    }
  };

  const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return theme.colors.onSurface; // Darkest
    case "frontdesk":
      return theme.colors.onSurfaceVariant; // Medium
    case "employee":
      return theme.colors.outline; // Lighter
    default:
      return theme.colors.outlineVariant; // Lightest
  }
};

  const handleShare = async () => {
    if (!currentOrganization?.data?.code) {
      Alert.alert("Error", "Organization code not available");
      return;
    }

    try {
      await shareOrganizationCode(
        currentOrganization.data.code,
        currentOrganization.data.name || "Our Organization"
      );
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to share organization code"
      );
    }
  };

  const handleCopy = async () => {
    if (!currentOrganization?.data?.code) {
      Alert.alert("Error", "Organization code not available");
      return;
    }

    try {
      await copyToClipboard(
        currentOrganization.data.code,
        "Organization code copied to clipboard!"
      );
    } catch (error) {
      console.error("Copy error:", error);
      Alert.alert("Error", "Failed to copy organization code");
    }
  };

  const safeMembers = Array.isArray(members) ? members : [];
  const safeRequests = Array.isArray(pendingRequests) ? pendingRequests : [];

  const filteredMembers = safeMembers.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const filteredRequests = safeRequests.filter(
    (req) =>
      req.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    searchbar: {
      flex: 1,
      elevation: 2,
    },
    card: {
      marginHorizontal: 16,
      marginBottom: 12,
      elevation: 2,
    },
    orgCodeSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: 'wrap',
    },
    orgCodeInfo: {
      flex: 1,
      minWidth: 200,
      marginBottom: 12,
    },
    orgCodeActions: {
      flexDirection: "row",
      gap: 8,
      flexWrap: 'wrap',
    },
    copyButton: {
      minWidth: 80,
    },
    shareButton: {
      minWidth: 80,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      marginHorizontal: 16,
    },
    memberHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    memberInfo: {
      flexDirection: "row",
      flex: 1,
    },
    memberDetails: {
      flex: 1,
      marginLeft: 12,
    },
    memberName: {
      fontSize: 16,
      fontWeight: "bold",
    },
    memberActions: {
      alignItems: "flex-end",
    },
    statusChip: {
      marginBottom: 8,
    },
    roleChip: {
      marginBottom: 8,
    },
    divider: {
      marginVertical: 12,
    },
    requestActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      gap: 12,
    },
    actionButton: {
      flex: 1,
    },
    emptyState: {
      alignItems: "center",
      padding: 40,
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text
            variant="titleLarge"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Organization Members
          </Text>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search members..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[
                styles.searchbar,
                { backgroundColor: theme.colors.surface },
              ]}
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
                  setFilterRole("all");
                  setFilterMenuVisible(false);
                }}
                title="All Roles"
                leadingIcon={filterRole === "all" ? "check" : ""}
              />
              <Menu.Item
                onPress={() => {
                  setFilterRole("admin");
                  setFilterMenuVisible(false);
                }}
                title="Admin"
                leadingIcon={filterRole === "admin" ? "check" : ""}
              />
              <Menu.Item
                onPress={() => {
                  setFilterRole("frontdesk");
                  setFilterMenuVisible(false);
                }}
                title="Front Desk"
                leadingIcon={filterRole === "frontdesk" ? "check" : ""}
              />
              <Menu.Item
                onPress={() => {
                  setFilterRole("employee");
                  setFilterMenuVisible(false);
                }}
                title="Employee"
                leadingIcon={filterRole === "employee" ? "check" : ""}
              />
            </Menu>
          </View>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.orgCodeSection}>
              <View style={styles.orgCodeInfo}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Organization Code
                </Text>
                <Text
                  variant="titleLarge"
                  style={{
                    color: theme.colors.onSurface,
                    fontSize: 20,
                    marginVertical: 8,
                    fontFamily: "monospace", // Makes it look like code
                  }}
                  onLongPress={handleCopy}
                  selectable={true}
                >
                  {currentOrganization?.data?.code || "N/A"}
                </Text>
                {currentOrganization?.data?.name && (
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      fontSize: 14,
                    }}
                  >
                    {currentOrganization.data.name}
                  </Text>
                )}
              </View>

              <View style={styles.orgCodeActions}>
                <Button
                  mode="outlined"
                  icon="content-copy"
                  onPress={handleCopy}
                  style={styles.copyButton}
                  compact
                >
                  Copy
                </Button>

                <Button
                  mode="contained"
                  icon="share"
                  onPress={handleShare}
                  style={[
                    styles.shareButton,
                    { backgroundColor: theme.colors.primary }
                  ]}
                  compact
                >
                  Share
                </Button>
              </View>
            </View>

            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginTop: 12,
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              💡 Long press on code to copy or use buttons above
            </Text>
          </Card.Content>
        </Card>

        {filteredRequests.length > 0 && (
          <View style={styles.section}>
            <Text
              variant="titleLarge"
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Pending Requests ({filteredRequests.length})
            </Text>
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
              >
                <Card.Content>
                  <View style={styles.memberHeader}>
                    <View style={styles.memberInfo}>
                      <Avatar.Image
                        size={50}
                        source={{
                          uri:
                            request.profilePicture ||
                            "https://via.placeholder.com/50",
                        }}
                      />
                      <View style={styles.memberDetails}>
                        <Text
                          variant="titleLarge"
                          style={[
                            styles.memberName,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {request.name}
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {request.email}
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {request.phone}
                        </Text>
                      </View>
                    </View>
                    <Chip
                      style={[
                        styles.statusChip,
                        { backgroundColor: theme.colors.tertiary },
                      ]}
                      textStyle={{ color: "white" }}
                    >
                      PENDING
                    </Chip>
                  </View>
                  <Divider style={styles.divider} />
                  <View style={styles.requestActions}>
                    <Menu
                      visible={selectedMenuId === request.requestId}
                      onDismiss={() => setSelectedMenuId(null)}
                      anchor={
                        <Button
                          mode="contained"
                          onPress={() => setSelectedMenuId(request.requestId)}
                          style={[
                            styles.actionButton,
                            { backgroundColor: theme.colors.secondary },
                          ]}
                          icon="account-plus"
                        >
                          Approve as
                        </Button>
                      }
                    >
                      <Menu.Item
                        onPress={() => {
                          handlePendingRequest(
                            request.requestId,
                            "approve",
                            "employee"
                          );
                          setSelectedMenuId(null);
                        }}
                        title="Employee"
                        leadingIcon="account"
                      />
                      <Menu.Item
                        onPress={() => {
                          handlePendingRequest(
                            request.requestId,
                            "approve",
                            "frontdesk"
                          );
                          setSelectedMenuId(null);
                        }}
                        title="Front Desk"
                        leadingIcon="desk"
                      />
                      <Menu.Item
                        onPress={() => {
                          handlePendingRequest(
                            request.requestId,
                            "approve",
                            "admin"
                          );
                          setSelectedMenuId(null);
                        }}
                        title="Admin"
                        leadingIcon="shield-account"
                      />
                    </Menu>
                    <Button
                      mode="outlined"
                      onPress={() =>
                        handlePendingRequest(request.requestId, "reject")
                      }
                      style={styles.actionButton}
                      textColor={theme.colors.error}
                      icon="account-remove"
                    >
                      Decline
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Active Members ({filteredMembers.length})
          </Text>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <Card
                key={member.id}
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
              >
                <Card.Content>
                  <View style={styles.memberHeader}>
                    <View style={styles.memberInfo}>
                      <Avatar.Image
                        size={50}
                        source={{
                          uri:
                            member.profilePicture ||
                            "https://via.placeholder.com/50",
                        }}
                      />
                      <View style={styles.memberDetails}>
                        <Text
                          variant="titleLarge"
                          style={[
                            styles.memberName,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {member.name}
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {member.email}
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {member.phone}
                        </Text>
                        {member.joinedAt && (
                          <Text
                            variant="bodyMedium"
                            style={{
                              color: theme.colors.onSurfaceVariant,
                              fontSize: 12,
                            }}
                          >
                            Joined{" "}
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.memberActions}>
                      <Chip
                        style={[
                          styles.roleChip,
                          { backgroundColor: getRoleColor(member.role) },
                        ]}
                        textStyle={{ color: "white" }}
                      >
                        {member.role.toUpperCase()}
                      </Chip>
                      <Menu
                        visible={
                          memberMenuVisible && selectedMenuId === member.id
                        }
                        onDismiss={() => {
                          setMemberMenuVisible(false);
                          setSelectedMenuId(null);
                        }}
                        anchor={
                          <IconButton
                            icon="dots-vertical"
                            size={20}
                            onPress={() => {
                              setSelectedMenuId(member.id);
                              setMemberMenuVisible(true);
                            }}
                          />
                        }
                      >
                        <Menu.Item
                          onPress={() =>
                            handleMemberAction(
                              member.id,
                              "changeRole",
                              "employee"
                            )
                          }
                          title="Make Employee"
                          leadingIcon="account"
                          disabled={member.role === "employee"}
                        />
                        <Menu.Item
                          onPress={() =>
                            handleMemberAction(
                              member.id,
                              "changeRole",
                              "frontdesk"
                            )
                          }
                          title="Make Front Desk"
                          leadingIcon="desk"
                          disabled={member.role === "frontdesk"}
                        />
                        <Menu.Item
                          onPress={() =>
                            handleMemberAction(member.id, "changeRole", "admin")
                          }
                          title="Make Admin"
                          leadingIcon="shield-account"
                          disabled={member.role === "admin"}
                        />
                        <Divider />
                        <Menu.Item
                          onPress={() =>
                            handleMemberAction(member.id, "remove")
                          }
                          title="Remove Member"
                          leadingIcon="account-remove"
                          titleStyle={{ color: theme.colors.error }}
                        />
                      </Menu>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={60}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="titleLarge"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginTop: 10,
                  }}
                >
                  No members found
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    textAlign: "center",
                  }}
                >
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Share the organization code to invite members"}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
      <FAB
        icon="account-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setInviteModalVisible(true)}
        label="Invite"
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        visible={inviteModalVisible}
        onDismiss={() => setInviteModalVisible(false)}
        onInviteSent={handleInviteSent}
      />
    </View>
  );
}