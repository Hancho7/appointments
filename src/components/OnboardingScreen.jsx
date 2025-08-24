import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Paragraph, Title, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="calendar-account"
            size={80}
            color={theme.colors.primary}
          />
          <View style={styles.headerInfo}>
            <Title style={[styles.title, { color: theme.colors.onBackground }]}>
              Walk-In
            </Title>
            <Paragraph
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Streamline your organization's appointment scheduling
            </Paragraph>
          </View>
        </View>

        <View style={styles.options}>
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="account-plus"
                  size={40}
                  color={theme.colors.primary}
                />
                <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Sign Up
                </Title>
              </View>
              <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                Create a new account to start managing appointments and join organizations.
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => router.push("/(auth)/signup")}
                style={styles.button}
                icon="arrow-right"
                contentStyle={styles.buttonContent}
              >
                Create Account
              </Button>
            </Card.Content>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="login"
                  size={40}
                  color={theme.colors.secondary}
                />
                <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Sign In
                </Title>
              </View>
              <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                Already have an account? Sign in to access your organizations and appointments.
              </Paragraph>
              <Button
                mode="outlined"
                onPress={() => router.push("/(auth)/login")}
                style={styles.button}
                icon="arrow-right"
                contentStyle={styles.buttonContent}
              >
                Sign In
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
  headerInfo: {
    alignItems: "center",
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  options: {
    flex: 1,
    gap: 16,
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
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});