import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Button, 
  Alert, 
  AppState 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AchievementsWall = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();

    const subscription = AppState.addEventListener("change", nextAppState => {
      console.log("App State changed:", nextAppState);
    });

    return () => {
      subscription.remove(); 
    };
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("https://flask-s8i3.onrender.com/api/get-achievements", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("Fetched Achievements:", data);
      setAchievements(data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAchievements = async () => {
    try {
      await AsyncStorage.removeItem("achievements"); 
      setAchievements([]); 
      Alert.alert("Success", "Achievement logs cleared!");
    } catch (error) {
      Alert.alert("Error", "Failed to clear achievements.");
      console.error("Error clearing achievements:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🏆 Achievements Wall</Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : achievements.length === 0 ? (
        <Text style={styles.noAchievementsText}>
          No achievements yet. Keep working towards your goals!
        </Text>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.achievementCard}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.user}>By: {item.user}</Text>
            </View>
          )}
          contentContainerStyle={styles.scrollContainer}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Clear Logs" onPress={clearAchievements} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#E8F5E9" // 🌿 Soft pastel green background
  },
  heading: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center", 
    color: "#2C3E50" 
  },
  noAchievementsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#7F8C8D",
    marginTop: 20
  },
  scrollContainer: { flexGrow: 1 },
  achievementCard: {
    padding: 15,
    backgroundColor: "#F9E79F", // Light yellow for contrast
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#D4AC0D", // Gold accent
  },
  title: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2C3E50" 
  },
  description: { 
    fontSize: 16, 
    color: "#555", 
    marginBottom: 5 
  },
  user: { 
    fontSize: 14, 
    fontStyle: "italic", 
    color: "#777", 
    marginBottom: 10 
  },
  buttonContainer: { 
    marginTop: 20, 
    alignItems: "center" 
  },
});

export default AchievementsWall;
