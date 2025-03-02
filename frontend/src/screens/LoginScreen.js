import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Invalid email format.");
      return;
    }

    try {
      const response = await fetch("https://flask-s8i3.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("authToken", data.token);
        Alert.alert("Success", "Login successful!");
        navigation.replace("Home");
      } else {
        setFailedAttempts(failedAttempts + 1);
        if (failedAttempts >= 4) {
          setShowForgotPassword(true);
        }
        Alert.alert("Error", data.error || "Login failed!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace("Home")}>
        <Text style={styles.skipText}>Skip Login</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Login</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.loginButton, { opacity: email && password ? 1 : 0.6 }]}
        onPress={handleLogin}
        disabled={!email || !password}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>

      {showForgotPassword && (
        <TouchableOpacity onPress={() => Alert.alert("Reset Password", "Forgot Password clicked.")}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  registerText: {
    marginTop: 15,
    color: "#007BFF",
    fontSize: 16,
  },
  forgotText: {
    color: "#FF6347",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 40 : 20,
    right: 20,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#007BFF",
  },
});
