import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, ActivityIndicator, Alert } from "react-native";
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

      const response = await axios.get("https://fitfolk-33796.el.r.appspot.com/api/get-fitness-level", {
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

      const response = await axios.get("https://fitfolk-33796.el.r.appspot.com/api/workout-plan", {
        headers: { Authorization: `Bearer ${token}` },
        params: { level: level },
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

      const response = await axios.get("https://fitfolk-33796.el.r.appspot.com/api/get-progress", {
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
        "https://fitfolk-33796.el.r.appspot.com/api/track-progress",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCompletedDays(response.data.completed_days);
      setBadge(response.data.badge);

      let alertMessage = `Workout day ${response.data.completed_days} marked as completed!`;
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
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Your Workout Plan</Text>

      {fitnessLevel ? (
        <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}>
          🚀 Your Fitness Level: {fitnessLevel}
        </Text>
      ) : (
        <ActivityIndicator size="small" color="blue" />
      )}

      {/* ✅ Show Workout Plan */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={workoutPlan}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{item.day}</Text>
              <Text>{item.workout}</Text>
            </View>
          )}
        />
      )}

      <Button title="Mark Workout as Completed" onPress={markWorkoutCompleted} />

      {completedDays > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text>✅ Workouts Completed: {completedDays}</Text>
          {badge && <Text>🏆 Earned Badge: {badge}</Text>}
        </View>
      )}
    </View>
  );
};

export default WorkoutPlan;
