import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const FitnessAssessment = ({ navigation }) => {
  const [pushups, setPushups] = useState("");
  const [squats, setSquats] = useState("");
  const [plankSeconds, setPlankSeconds] = useState("");

  const submitAssessment = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in first.");
        return;
      }

      const response = await axios.post(
        "https://flask-s8i3.onrender.com/api/fitness-assessment",
        { pushups, squats, plank_seconds: plankSeconds }, 
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      Alert.alert("Assessment Completed", `Your level: ${response.data.fitness_level}`);
      navigation.navigate("WorkoutPlan");
    } catch (error) {
      Alert.alert("Error", "Failed to submit assessment.");
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.innerContainer}
      >
        <Text style={styles.heading}>🏋️‍♂️ Fitness Assessment</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Push-ups</Text>
          <TextInput 
            value={pushups} 
            onChangeText={setPushups} 
            keyboardType="numeric" 
            style={styles.input} 
            placeholder="Enter count"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Squats</Text>
          <TextInput 
            value={squats} 
            onChangeText={setSquats} 
            keyboardType="numeric" 
            style={styles.input} 
            placeholder="Enter count"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Plank (seconds)</Text>
          <TextInput 
            value={plankSeconds} 
            onChangeText={setPlankSeconds} 
            keyboardType="numeric" 
            style={styles.input} 
            placeholder="Enter time in seconds"
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={submitAssessment}>
          <Text style={styles.buttonText}>🚀 Submit Assessment</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#ff6600",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FitnessAssessment;
