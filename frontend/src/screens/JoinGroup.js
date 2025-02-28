import React, { useEffect, useState } from "react";
import { 
  View, Text, Button, FlatList, Alert, TouchableOpacity, ActivityIndicator, StyleSheet 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const JoinGroup = () => {
  const [groups, setGroups] = useState([]); 
  const [userGroups, setUserGroups] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchGroups();
    fetchUserGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get("https://fitfolk-33796.el.r.appspot.com/api/get-groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Alert.alert("⚠️ Error", "Failed to load groups.");
    }
  };

  const fetchUserGroups = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Login Required", "Please log in.");
        return;
      }

      const response = await axios.get(
        "https://fitfolk-33796.el.r.appspot.com/api/get-user-groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserGroups(response.data.groups || []);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      setUserGroups([]); 
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Login Required", "Please log in.");
        return;
      }

      const response = await axios.post(
        "https://fitfolk-33796.el.r.appspot.com/api/join-group",
        { group_name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", response.data.message);
      setUserGroups([...userGroups, groupName]); 
    } catch (error) {
      console.error("Error joining group:", error.response?.data);
      Alert.alert("⚠️ Error", error.response?.data?.error || "Could not join group");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📢 Join a Group</Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={styles.groupContainer}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Button
                title={userGroups.includes(item.name) ? "Joined ✅" : "Join"}
                onPress={() => joinGroup(item.name)}
                disabled={userGroups.includes(item.name)}
              />
              {userGroups.includes(item.name) && (
                <TouchableOpacity 
                  style={styles.postButton} 
                  onPress={() => navigation.navigate("PostAchievement", { group: item.name })}
                >
                  <Text style={styles.postButtonText}>📢 Post Achievement</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  groupContainer: { padding: 15, borderWidth: 1, marginBottom: 10, borderRadius: 8 },
  groupName: { fontSize: 18, fontWeight: "bold" },
  postButton: { marginTop: 10, backgroundColor: "#4CAF50", padding: 8, borderRadius: 5 },
  postButtonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default JoinGroup;
