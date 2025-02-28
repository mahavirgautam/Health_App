import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";

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
      const response = await axios.get("https://fitfolk-33796.el.r.appspot.com/api/get-achievements", {
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
        "https://fitfolk-33796.el.r.appspot.com/api/group-post",
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
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        🏅 Post to {group}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : achievements.length === 0 ? (
        <Text>No achievements yet. Earn one by completing workouts or logging sleep!</Text>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ borderWidth: 1, padding: 10, marginTop: 10, borderRadius: 10 }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.title}</Text>
              <Text style={{ marginBottom: 5 }}>{item.description}</Text>
              <Button title="📢 Post to Group" onPress={() => postAchievementToGroup(item)} />
            </View>
          )}
        />
      )}
    </View>
  );
};

export default PostAchievement;
