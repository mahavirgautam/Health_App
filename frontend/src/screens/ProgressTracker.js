import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const ProgressTracker = () => {
  const [completedDays, setCompletedDays] = useState(0);
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.get("https://flask-s8i3.onrender.com/api/get-progress", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCompletedDays(response.data.completed_days);
      setBadge(response.data.badge);
      setLoading(false);

      if (response.data.completed_days === 0 && response.data.badge === "🏆 7-Day Champion Badge") {
        resetProgress(token);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch progress.");
      setLoading(false);
    }
  };

  const resetProgress = async (token) => {
    try {
      await axios.post("https://flask-s8i3.onrender.com/api/reset-progress", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("🎯 Time for Reassessment!", "Your progress has been reset. Redirecting to Fitness Assessment...");
      navigation.navigate("FitnessAssessment"); 
    } catch (error) {
      Alert.alert("Error", "Failed to reset progress.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏆 Your Progress</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <View style={styles.card}>
          <Text style={styles.progressText}>
            ✅ Completed Days: {completedDays} / 7
          </Text>

          {/* Custom Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedDays / 7) * 100}%` }]} />
          </View>

          {badge && (
            <Text style={styles.badgeText}>
              🎖 Badge Earned: <Text style={styles.badge}>{badge}</Text>
            </Text>
          )}

<TouchableOpacity 
  style={styles.resetButton} 
  onPress={async () => {
    const token = await AsyncStorage.getItem("authToken");
    resetProgress(token); // Ensure token is passed
  }}
>
  <MaterialIcons name="refresh" size={20} color="#fff" />
  <Text style={styles.buttonText}> Reset Progress</Text>
</TouchableOpacity>

        </View>
      )}
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
    width: "90%",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#D9D9D9",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  badge: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: "#FF5722",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default ProgressTracker;
