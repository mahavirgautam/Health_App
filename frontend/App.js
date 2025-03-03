import React, { useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigator from "./AppNavigator"; // Ensure this file correctly sets up the navigator
import { NavigationContainer } from "@react-navigation/native"; // Ensure NavigationContainer is wrapped

export default function App() {
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "active") {
        await AsyncStorage.setItem("lastActiveTime", Date.now().toString());
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove(); // Fix: Properly remove the event listener
    };
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
