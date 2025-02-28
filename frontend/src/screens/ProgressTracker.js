import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

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

      const response = await axios.get("https://fitfolk-33796.el.r.appspot.com/api/get-progress", {
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
      await axios.post("https://fitfolk-33796.el.r.appspot.com/api/reset-progress", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("🎯 Time for Reassessment!", "Your progress has been reset. Redirecting to Fitness Assessment...");
      navigation.navigate("FitnessAssessment"); 
    } catch (error) {
      Alert.alert("Error", "Failed to reset progress.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>🏆 Your Progress</Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <View>
          <Text style={{ fontSize: 18, marginVertical: 10 }}>
            ✅ Completed Days: {completedDays} / 7
          </Text>
          {badge && <Text style={{ fontSize: 18, color: "green" }}>🎖 Badge Earned: {badge}</Text>}
        </View>
      )}
    </View>
  );
};

export default ProgressTracker;
