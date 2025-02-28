import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // ✅ Import Navigation Hook
import axios from "axios";

const SleepTracker = () => {
  const [sleepDetected, setSleepDetected] = useState(false);
  const [sleepHours, setSleepHours] = useState(0);
  const navigation = useNavigation(); // ✅ Initialize Navigation

  useEffect(() => {
    checkSleep();
  }, []);

  const checkSleep = async () => {
    try {
      const lastActive = await AsyncStorage.getItem("lastActiveTime");
      if (!lastActive) return;

      const lastActiveTime = new Date(parseInt(lastActive));
      const currentTime = new Date();

      const inactiveDuration = (currentTime - lastActiveTime) / 1000 / 60 / 60; // Convert ms to hours

      if (inactiveDuration >= 5) {
        console.log(`😴 Sleep detected: ${inactiveDuration.toFixed(2)} hours`);
        setSleepHours(inactiveDuration.toFixed(2));
        setSleepDetected(true);
      }
    } catch (error) {
      console.error("Error detecting sleep:", error);
    }
  };

  const logSleepToBackend = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in.");
        return;
      }

      if (!sleepDetected) {
        Alert.alert("No Sleep Data", "No sleep detected from inactivity.");
        return;
      }

      const response = await axios.post(
        "https://fitfolk-33796.el.r.appspot.com/api/log-sleep",
        {
          date: new Date().toISOString().split("T")[0],
          sleep_hours: sleepHours,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", response.data.message);
    } catch (error) {
      console.error("Error logging sleep:", error);
      Alert.alert("Error", "Failed to log sleep data.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>📊 AI Sleep Tracker</Text>

      {sleepDetected ? (
        <Text style={{ fontSize: 18, color: "green", marginBottom: 15 }}>
          😴 Auto-Detected Sleep: {sleepHours} hours
        </Text>
      ) : (
        <Text style={{ fontSize: 18, color: "red", marginBottom: 15 }}>🌞 No sleep detected yet.</Text>
      )}

      <Button title="Log Sleep to Backend" onPress={logSleepToBackend} />

      <View style={{ marginTop: 15 }}>
        <Button
          title="YogaNidra for better sleep"
          onPress={() => navigation.navigate("SoothingMusic")}
        />
      </View>
    </View>
  );
};

export default SleepTracker;
