import React, { useEffect, useState } from "react";
import { 
  View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; 
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const SleepTracker = () => {
  const [sleepDetected, setSleepDetected] = useState(false);
  const [sleepHours, setSleepHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    checkSleep();
  }, []);

  const checkSleep = async () => {
    try {
      const lastActive = await AsyncStorage.getItem("lastActiveTime");
      if (!lastActive) {
        setLoading(false);
        return;
      }

      const lastActiveTime = new Date(parseInt(lastActive));
      const currentTime = new Date();
      const inactiveDuration = (currentTime - lastActiveTime) / 1000 / 60 / 60;

      if (inactiveDuration >= 5) {
        setSleepHours(inactiveDuration.toFixed(2));
        setSleepDetected(true);
      }
    } catch (error) {
      console.error("Error detecting sleep:", error);
    } finally {
      setLoading(false);
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
        "https://flask-s8i3.onrender.com/api/log-sleep",
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
    <View style={styles.container}>
      <Text style={styles.header}>🌙 AI Sleep Tracker</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : sleepDetected ? (
        <Text style={styles.sleepText}>😴 Auto-Detected Sleep: {sleepHours} hours</Text>
      ) : (
        <Text style={styles.noSleepText}>🌞 No sleep detected yet.</Text>
      )}

      <TouchableOpacity style={styles.logButton} onPress={logSleepToBackend}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}> Log Sleep</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.yogaButton} 
        onPress={() => navigation.navigate("SoothingMusic")}
      >
        <Ionicons name="musical-notes-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}> YogaNidra for Better Sleep</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  sleepText: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 20,
  },
  noSleepText: {
    fontSize: 18,
    color: "#FF5722",
    fontWeight: "bold",
    marginBottom: 20,
  },
  logButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginBottom: 15,
    elevation: 3,
  },
  yogaButton: {
    flexDirection: "row",
    backgroundColor: "#3F51B5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default SleepTracker;
