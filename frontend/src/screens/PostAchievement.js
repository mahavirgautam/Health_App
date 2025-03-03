import React, { useState, useEffect } from "react";
import { View, Alert, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Card, Text, Button, IconButton } from "react-native-paper";

const PostAchievement = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params || {};

  const [achievements, setAchievements] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 Navigated to PostAchievement for:", group);
    if (!group) {
      Alert.alert("Error", "No group selected!");
      navigation.goBack();
      return;
    }

    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (!storedToken) {
          Alert.alert("⚠️ Login Required", "You need to log in first!");
          navigation.navigate("LoginScreen");
        } else {
          setToken(storedToken);
          fetchAchievements(storedToken);
        }
      } catch (error) {
        console.log("❌ Error loading token:", error);
      }
    };

    loadToken();
  }, []);

  const fetchAchievements = async (token) => {
    try {
      console.log("🔄 Fetching achievements...");
      const response = await axios.get("https://flask-s8i3.onrender.com/api/get-achievements", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Response:", response.data);
      setAchievements(response.data);
    } catch (error) {
      console.log("❌ Error fetching achievements:", error.response?.data || error.message);
      Alert.alert("⚠️ Error", "Failed to load achievements!");
    } finally {
      setLoading(false);
    }
  };

  const postAchievementToGroup = async (achievement) => {
    try {
      console.log("📌 Posting to group:", group, achievement);

      const response = await axios.post(
        "https://flask-s8i3.onrender.com/api/group-post",
        { group_name: group, content: `🏆 ${achievement.title} - ${achievement.description}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Success:", response.data);
      Alert.alert("Success", "Achievement posted!");
      navigation.navigate("GroupPosts", { group });
    } catch (error) {
      console.log("❌ Error posting achievement:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to post achievement.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#F7F9FC" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center" }}>
        🏅 Share Achievements in {group}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6200ea" style={{ marginTop: 20 }} />
      ) : achievements.length === 0 ? (
        <Text style={{ textAlign: "center", fontSize: 16, color: "#666" }}>
          No achievements yet. Complete workouts or log sleep to earn achievements!
        </Text>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card
              style={{
                marginBottom: 15,
                borderRadius: 12,
                backgroundColor: "#ffffff",
                elevation: 3,
              }}
            >
              <Card.Content>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: "#333" }}>{item.title}</Text>
                <Text style={{ fontSize: 14, color: "#666", marginVertical: 5 }}>{item.description}</Text>
              </Card.Content>
              <Card.Actions>
                <Button
                  icon="send"
                  mode="contained"
                  onPress={() => postAchievementToGroup(item)}
                  style={{ flex: 1, backgroundColor: "#6200ea", borderRadius: 8 }}
                >
                  Post
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
      )}
    </View>
  );
};

export default PostAchievement;
