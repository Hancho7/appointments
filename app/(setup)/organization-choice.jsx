// app/(setup)/organization-choice.jsx
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function OrganizationChoiceScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="domain"
            size={80}
            color={theme.colors.primary}
          />
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
            Organization Setup
          </Text>
          <Text variant="bodyMedium"
            style={[
              styles.subtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Choose how you want to get started
          </Text>
        </View>

        <View style={styles.options}>
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="domain-plus"
                  size={40}
                  color={theme.colors.primary}
                />
                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Create Organization
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Set up a new organization and become the admin. You'll get a
                unique code to share with your team members.
              </Text>
              <View style={styles.features}>
                <View style={styles.feature}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={theme.colors.secondary}
                  />
                  <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                    Full admin control
                  </Text>
                </View>
                <View style={styles.feature}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={theme.colors.secondary}
                  />
                  <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                    Manage team members
                  </Text>
                </View>
                <View style={styles.feature}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={theme.colors.secondary}
                  />
                  <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                    Unique join code
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => router.push("/create-organization")}
                style={styles.button}
                icon="arrow-right"
                contentStyle={styles.buttonContent}
              >
                Create Organization
              </Button>
            </Card.Content>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={40}
                  color={theme.colors.secondary}
                />
                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Join Organization
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Join an existing organization using an invitation code provided
                by your admin.
              </Text>
              <View style={styles.features}>
                <View style={styles.feature}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={theme.colors.secondary}
                  />
                  <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                    Quick setup with code
                  </Text>
                </View>
                <View style={styles.feature}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={theme.colors.secondary}
                  />
                  <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                    Role assigned by admin
                  </Text>
                </View>
                <View style={styles.feature}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={theme.colors.secondary}
                  />
                  <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                    Start immediately
                  </Text>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => router.push("/join-organization")}
                style={styles.button}
                icon="arrow-right"
                contentStyle={styles.buttonContent}
              >
                Join Organization
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    padding: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  options: {
    flex: 1,
    gap: 20,
  },
  card: {
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  features: {
    marginVertical: 16,
    gap: 8,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});