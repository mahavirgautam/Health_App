
import React,{useState,useEffect} from "react";
import { View,Text,Button,ScrollView,StyleSheet,TouchableOpacity,Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [loggedIn,setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setLoggedIn(!!token);
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    setLoggedIn(false);
    Alert.alert("✅ Logged out successfully!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.topRightButton} onPress={loggedIn ? handleLogout:() => navigation.navigate("Login")}>
        <Text style={{color:"blue",fontSize:16}}>{loggedIn?"Logout":"Login"}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🏋️‍♂️ Welcome to Health & Fitness App</Text>

      <View style={styles.buttonContainer}>
        <Button title="Go to Sleep Tracker" onPress={() => navigation.navigate("SleepTracker")}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="View Achievements" onPress={() => navigation.navigate("Achievements")}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Join a Group" onPress={() => navigation.navigate("JoinGroup")}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Track Your Meals" onPress={() => navigation.navigate("MealTracker")}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="📝 Take Fitness Assessment" onPress={() => navigation.navigate("FitnessAssessment")}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="📋 View Workout Plan" onPress={() => navigation.navigate("WorkoutPlan")}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="🏆 Track Progress" onPress={() => navigation.navigate("ProgressTracker")}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="User Profile" onPress={() => navigation.navigate("Profile")}/>
      </View>
    </ScrollView>
  );
};

const styles=StyleSheet.create({
  container: {
    flexGrow:1,
    alignItems:"center",
    justifyContent:"center",
    padding:20,
  },
  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:20,
    textAlign:"center",
  },
  buttonContainer:{
    marginBottom:10,
    width:"80%",
  },
  topRightButton: {
    position:"absolute",
    top:10,
    right:10,
    padding:5,
  },
});

export default HomeScreen;
