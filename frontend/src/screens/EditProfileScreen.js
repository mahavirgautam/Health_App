import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [medications, setMedications] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userProfile");
      if (data) {
        const userData = JSON.parse(data);
        setName(userData.name || "");
        setAge(userData.age || "");
        setWeight(userData.weight || "");
        setMedications(userData.medications || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const saveUserData = async () => {
    if (!name || !age || !weight) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const userData = { name, age, weight, medications };
    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(userData));
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", "Failed to save profile.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📝 Edit Profile</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Name" 
        value={name} 
        onChangeText={setName} 
        placeholderTextColor="#666"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Age" 
        value={age} 
        onChangeText={setAge} 
        keyboardType="numeric" 
        placeholderTextColor="#666"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Weight (kg)" 
        value={weight} 
        onChangeText={setWeight} 
        keyboardType="numeric" 
        placeholderTextColor="#666"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Medications (Optional)" 
        value={medications} 
        onChangeText={setMedications} 
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.button} onPress={saveUserData}>
        <Text style={styles.buttonText}>💾 Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#E8F5E9", // 🌿 Soft pastel green
    paddingHorizontal: 20
  },
  heading: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "#2C3E50" 
  },
  input: { 
    width: "100%", 
    backgroundColor: "#FFF", 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 15, 
    fontSize: 16, 
    color: "#333", 
    borderWidth: 1, 
    borderColor: "#B2DFDB", 
    elevation: 3, // Adds subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  button: { 
    backgroundColor: "#388E3C", // 🌱 Dark Green for Save Button
    paddingVertical: 12, 
    paddingHorizontal: 30, 
    borderRadius: 8, 
    marginTop: 10,
    elevation: 4, // Adds button shadow
  },
  buttonText: { 
    fontSize: 18, 
    color: "#FFF", 
    fontWeight: "bold" 
  }
});

export default EditProfileScreen;

