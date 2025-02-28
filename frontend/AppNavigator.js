import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import SleepTracker from "./src/screens/SleepTracker";
import AchievementsWall from "./src/screens/AchievementsWall";
import JoinGroup from "./src/screens/JoinGroup";
import PostAchievement from "./src/screens/PostAchievement";
import GroupPosts from "./src/screens/GroupPosts";
import MealTracker from "./src/screens/MealTracker";
import MealSummary from "./src/screens/MealSummary";
import FitnessAssessment from "./src/screens/FitnessAssessment";
import WorkoutPlan from "./src/screens/WorkoutPlan";
import ProgressTracker from "./src/screens/ProgressTracker";
import SoothingMusic from "./src/screens/SoothingMusic";
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown:true,gestureEnabled:true}}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{title:"Login",headerShown:false}}/>
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title:"Register",headerShown:false}}/>

        <Stack.Screen name="Home" component={HomeScreen} options={{title:"Home"}}/>

        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title:"User Profile"}}/>
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{title:"Edit Profile",headerBackTitle:"Back to Profile"}} 
        />

        <Stack.Screen name="SleepTracker" component={SleepTracker} options={{ title: "Sleep Tracker" }} />
        <Stack.Screen name="Achievements" component={AchievementsWall} options={{ title: "Achievements" }} />


        <Stack.Screen name="JoinGroup" component={JoinGroup} options={{ title: "Join a Group" }} />
        <Stack.Screen name="PostAchievement" component={PostAchievement} options={{ title: "Post an Achievement" }} />
        <Stack.Screen name="GroupPosts" component={GroupPosts} options={{ title: "Group Posts" }} />

        <Stack.Screen name="MealTracker" component={MealTracker} options={{ title: "Meal Tracker" }} />
        <Stack.Screen name="MealSummary" component={MealSummary} options={{ title: "Meal Summary" }} />

        <Stack.Screen name="FitnessAssessment" component={FitnessAssessment} options={{ title: "Fitness Assessment" }} />
        <Stack.Screen name="WorkoutPlan" component={WorkoutPlan} options={{ title: "Workout Plan" }} />
        <Stack.Screen name="ProgressTracker" component={ProgressTracker} options={{ title: "Progress Tracker" }} />

        <Stack.Screen name="SoothingMusic" component={SoothingMusic} options={{ title: "Soothing Music" }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
