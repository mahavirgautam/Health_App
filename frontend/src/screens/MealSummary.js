import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import MultiSelect from "react-native-multiple-select";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MealTracker = ({ navigation }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], snacks: [], dinner: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get("https://flask-s8i3.onrender.com/api/get-food-items");
        if (response.data.food_items.length === 0) {
          Alert.alert("⚠️ Warning", "No food items found in the database.");
        }
        setFoodItems(response.data.food_items.map((food, index) => ({ id: index.toString(), name: food })));
      } catch (error) {
        console.error("Error fetching food items:", error);
        Alert.alert("⚠️ Error", "Failed to load food items.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  const updateMeal = (mealType, selectedItems) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: selectedItems.map((id) => foodItems.find((item) => item.id === id)?.name || ""),
    }));
  };

  const logMeal = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Error", "You must be logged in to log meals.");
        return;
      }

      await axios.post(
        "https://flask-s8i3.onrender.com/api/log-meal",
        { meals },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", "Meal logged successfully!");
      navigation.navigate("MealSummary");
    } catch (error) {
      console.error("Error logging meal:", error);
      Alert.alert("⚠️ Error", "Failed to log meal.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Title style={styles.header}>🍽 Meal Tracker</Title>
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}

      <FlatList
        data={Object.keys(meals)}
        keyExtractor={(item) => item}
        renderItem={({ item: mealType }) => (
          <Card style={styles.mealContainer}>
            <Card.Content>
              <Title style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Title>
              <MultiSelect
                items={foodItems}
                uniqueKey="id"
                onSelectedItemsChange={(selectedItems) => updateMeal(mealType, selectedItems)}
                selectedItems={meals[mealType].map((food) => foodItems.find((item) => item.name === food)?.id || "")}
                selectText="Select food items"
                searchInputPlaceholderText="Search food..."
                tagRemoveIconColor="red"
                tagBorderColor="#CCC"
                tagTextColor="#000"
                selectedItemTextColor="#4CAF50"
                selectedItemIconColor="#4CAF50"
                itemTextColor="#333"
                displayKey="name"
                submitButtonText="Confirm"
                nestedScrollEnabled={true}
                styleDropdownMenu={styles.dropdownMenu}
              />
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <Button mode="contained" onPress={logMeal} style={styles.button}>
        Log Meal
      </Button>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  mealContainer: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  mealTitle: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  listContainer: {
    paddingBottom: 20,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
  },
});

export default MealTracker;
