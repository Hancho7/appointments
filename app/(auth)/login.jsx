// app/(auth)/login.jsx
import { router } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text, TextInput, useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { authService } from "../../src/api/authService";
import { organizationService } from "../../src/api/organizationService";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../../src/store/slices/auth/loginSlice";
import { setOrganization } from "../../src/store/slices/organizationSlice";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    dispatch(loginStart());

    try {
      // Login with backend - now returns the data object
      const loginData = await authService.login(values.email, values.password);

      // Update Redux state with user and token
      dispatch(
        loginSuccess({
          user: loginData.user,
          token: loginData.token,
        })
      );

      // Check if user has an organization
      if (
        loginData.user.organizationStatus == "APPROVED" &&
        loginData.user.organizationId
      ) {
        const organization = await organizationService.getCurrentOrganization();
        dispatch(setOrganization(organization));
        router.replace("/(tabs)");
        return;
      } else if (loginData.user.organizationStatus == "PENDING_APPROVAL") {
        router.replace("/waiting");
        return;
      } else if (loginData.user.organizationStatus == "NO_ORGANIZATION") {
        router.replace("/(setup)/organization-choice");
        return;
      }
    } catch (error) {
      console.error("Login failed:", error);
      dispatch(loginFailure(error.message));

      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text
              variant="titleLarge"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              Welcome
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}
            >
              Sign in to your account
            </Text>

            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View>
                  <TextInput
                    label="Email *"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    error={touched.email && errors.email}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && (
                    <Text
                      variant="bodyMedium"
                      style={[styles.error, { color: theme.colors.error }]}
                    >
                      {errors.email}
                    </Text>
                  )}

                  <TextInput
                    label="Password *"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    error={touched.password && errors.password}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    right={
                      <TextInput.Icon 
                        icon={showPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      />
                    }
                  />
                  {touched.password && errors.password && (
                    <Text
                      variant="bodyMedium"
                      style={[styles.error, { color: theme.colors.error }]}
                    >
                      {errors.password}
                    </Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Sign In
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => router.push("/(auth)/signup")}
                    style={styles.linkButton}
                    disabled={isLoading}
                  >
                    Don't have an account? Sign Up
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => router.push("/(auth)/forgot-password")}
                    style={styles.linkButton}
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => router.back()}
                    style={styles.backButton}
                    disabled={isLoading}
                  >
                    Back to Options
                  </Button>
                </View>
              )}
            </Formik>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  error: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 10,
  },
  backButton: {
    marginTop: 5,
  },
});