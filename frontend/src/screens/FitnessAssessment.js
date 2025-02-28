import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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
        "https://fitfolk-33796.el.r.appspot.com/api/fitness-assessment",
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Fitness Assessment</Text>
      
      <Text>Push-ups:</Text>
      <TextInput value={pushups} onChangeText={setPushups} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Squats:</Text>
      <TextInput value={squats} onChangeText={setSquats} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Plank (seconds):</Text>
      <TextInput value={plankSeconds} onChangeText={setPlankSeconds} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10 }} />

      <Button title="Submit Assessment" onPress={submitAssessment} />
    </View>
  );
};

export default FitnessAssessment;
