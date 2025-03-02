import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Button, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AchievementsWall = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchAchievements();
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

  const postToGroup = async (badgeTitle) => {
    try {
      setPosting(true);
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch("https://flask-s8i3.onrender.com/api/post-badge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_name: "Fitness Achievers",
          badge: badgeTitle,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Badge posted to the group!");
      } else {
        Alert.alert("Error", result.error || "Failed to post badge.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not post badge.");
      console.error("Error posting badge:", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🏆 Achievements Wall</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : achievements.length === 0 ? (
        <Text style={styles.noAchievements}>No achievements yet. Keep working towards your goals! 💪</Text>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.achievementCard}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.user}>By: {item.user}</Text>
              <View style={styles.buttonContainer}>
                <Button title="📢 Post to Group" onPress={() => postToGroup(item.title)} disabled={posting} color="#FF8C00" />
              </View>
            </View>
          )}
          contentContainerStyle={styles.scrollContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFACD" }, // Light yellow
  heading: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#FF8C00" },
  noAchievements: { fontSize: 16, textAlign: "center", color: "#555", marginTop: 20 },
  scrollContainer: { flexGrow: 1 },
  achievementCard: {
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#FFA500", // Orange accent
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  description: { fontSize: 16, color: "#555", marginBottom: 5 },
  user: { fontSize: 14, fontStyle: "italic", color: "#777", marginBottom: 10 },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default AchievementsWall;
