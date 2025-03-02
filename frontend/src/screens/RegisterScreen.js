import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("⚠️ Error", "Please enter email and password.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("⚠️ Error", "Invalid email format.");
      return;
    }

    try {
      const response = await fetch("https://flask-s8i3.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Success", "Registration Successful! Please login.");
        navigation.replace("LoginScreen");
      } else {
        Alert.alert("❌ Registration Failed", data.error || "Unknown error.");
      }
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Create a password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={!email || !password}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Login</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    elevation: 2,
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 15,
  },
  loginText: {
    color: "#333",
    fontSize: 16,
  },
  loginBold: {
    color: "#007bff",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
