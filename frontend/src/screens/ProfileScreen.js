import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen= () => {
  const navigation=useNavigation();
  const [userData,setUserData]=useState(null);

  useEffect(() => {
    loadUserData();
  },[]);

  const loadUserData =async () => {
    try{
      const data=await AsyncStorage.getItem("userProfile");
      if (data){
        setUserData(JSON.parse(data));
      }
    } catch (error){
      console.error("Error loading user data:",error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Profile</Text>

      {userData ?(
        <>
          <Text style={styles.label}>👤 Name:{userData.name}</Text>
          <Text style={styles.label}>📅 Age:{userData.age}</Text>
          <Text style={styles.label}>⚖️ Weight:{userData.weight} kg</Text>
          <Text style={styles.label}>💊 Medications:{userData.medications || "None"}</Text>
        </>
      ) : (
        <Text style={styles.label}>No details available.Please add your details.</Text>
      )}

      <Button title="Edit Profile" onPress={() => navigation.navigate("EditProfile")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 18, marginBottom: 10 },
});

export default ProfileScreen;
