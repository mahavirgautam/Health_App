import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, ActivityIndicator, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const WorkoutPlan = () => {
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState(0);
  const [badge, setBadge] = useState(null);
  const [fitnessLevel, setFitnessLevel] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserFitnessLevel();
    fetchProgress();
  }, []);

  const fetchUserFitnessLevel = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in.");
        return;
      }
      const response = await axios.get("https://flask-s8i3.onrender.com/api/get-fitness-level", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFitnessLevel(response.data.fitness_level);
      fetchWorkoutPlan(response.data.fitness_level);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch fitness level.");
      setLoading(false);
    }
  };

  const fetchWorkoutPlan = async (level) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get("https://flask-s8i3.onrender.com/api/workout-plan", {
        headers: { Authorization: `Bearer ${token}` },
        params: { level },
      });
      setWorkoutPlan(response.data.workout_plan);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch workout plan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get("https://flask-s8i3.onrender.com/api/get-progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompletedDays(response.data.completed_days);
      setBadge(response.data.badge);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch progress.");
    }
  };

  const markWorkoutCompleted = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.post(
        "https://flask-s8i3.onrender.com/api/track-progress",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompletedDays(response.data.completed_days);
      setBadge(response.data.badge);
      let alertMessage = "You Have Done it, See You Tomorrow!";
      if (response.data.badge) {
        alertMessage += `\n🎉 New Badge Earned: ${response.data.badge}`;
      }
      Alert.alert("Workout Completed!", alertMessage);
      if (response.data.redirect) {
        navigation.navigate("FitnessAssessment");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update workout progress.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Workout Plan</Text>
      {fitnessLevel ? (
        <Text style={styles.level}>🚀 Fitness Level: {fitnessLevel}</Text>
      ) : (
        <ActivityIndicator size="small" color="blue" />
      )}
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : (
        <FlatList
          data={workoutPlan}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.workoutItem}>
              <Text style={styles.workoutDay}>{item.day}</Text>
              <Text style={styles.workoutDesc}>{item.workout}</Text>
            </View>
          )}
        />
      )}
      <Button title="Mark Workout as Completed" onPress={markWorkoutCompleted} color="#28a745" />
      {completedDays > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>✅ Workouts Completed: {completedDays}</Text>
          {badge && <Text style={styles.badgeText}>🏆 Earned Badge: {badge}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  level: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#007bff",
  },
  loader: {
    marginTop: 20,
  },
  workoutItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  workoutDay: {
    fontSize: 16,
    fontWeight: "bold",
  },
  workoutDesc: {
    fontSize: 14,
    color: "#555",
  },
  progressContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d63384",
    marginTop: 5,
  },
});

export default WorkoutPlan;
