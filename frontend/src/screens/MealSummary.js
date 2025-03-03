import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Card } from "react-native-paper";

const MealSummary = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoggedMeals();
  }, []);

  const fetchLoggedMeals = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in first.");
        return;
      }

      const response = await axios.get("https://flask-s8i3.onrender.com/api/get-meals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data); // Debug API response

      if (Array.isArray(response.data.meals) && response.data.meals.length > 0) {
        setMeals(response.data.meals);
      } else {
        setMeals([]); // Set meals to empty array if no data
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      Alert.alert("Error", "Failed to load meals.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🍽 Meal Summary</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : meals.length === 0 ? (
        <Text style={styles.noMealsText}>No meals logged yet.</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card style={styles.mealCard}>
              <Card.Content>
                <Text style={styles.dateText}>📅 Date: {item.date || "N/A"}</Text>
                <Text style={styles.mealText}>🍳 Breakfast: {item.meals?.breakfast || "Not logged"}</Text>
                <Text style={styles.mealText}>🥗 Lunch: {item.meals?.lunch || "Not logged"}</Text>
                <Text style={styles.mealText}>🍪 Snacks: {item.meals?.snacks || "Not logged"}</Text>
                <Text style={styles.mealText}>🍽 Dinner: {item.meals?.dinner || "Not logged"}</Text>
                <Text style={styles.nutritionText}>🔥 Calories: {item.nutrition?.calories ?? "N/A"} kcal</Text>
                <Text style={styles.nutritionText}>💪 Protein: {item.nutrition?.protein ?? "N/A"} g</Text>
                <Text style={styles.nutritionText}>🥖 Carbs: {item.nutrition?.carbs ?? "N/A"} g</Text>
                <Text style={styles.nutritionText}>🧈 Fats: {item.nutrition?.fats ?? "N/A"} g</Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
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
    color: "#4CAF50",
  },
  noMealsText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  mealCard: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  dateText: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  mealText: {
    fontSize: 14,
    color: "#555",
  },
  nutritionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});

export default MealSummary;
