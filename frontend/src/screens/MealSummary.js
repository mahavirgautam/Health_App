import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MealSummary = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

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

      const response = await axios.get("https://fitfolk-33796.el.r.appspot.com/api/get-logged-meals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.meals.length === 0) {
        Alert.alert("No Meals", "You haven't logged any meals yet.");
      }

      setMeals(response.data.meals);
      calculateTotalNutrition(response.data.meals); 
    } catch (error) {
      console.error("Error fetching meals:", error);
      Alert.alert("Error", "Failed to load meals.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalNutrition = (meals) => {
    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    meals.forEach((meal) => {
      totals.calories += meal.nutrition?.calories || 0;
      totals.protein += meal.nutrition?.protein || 0;
      totals.carbs += meal.nutrition?.carbs || 0;
      totals.fats += meal.nutrition?.fats || 0;
    });

    setTotalNutrition(totals);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; 
    if (typeof dateString === "string") {
      return dateString; 
    }
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toISOString().split("T")[0];
  };
  

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>🍽 Meal Summary</Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
          <View style={{ marginBottom: 20, padding: 10, backgroundColor: "#eee", borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>🔥 Total Nutrition</Text>
            <Text>🔥 Calories: {totalNutrition.calories} kcal</Text>
            <Text>💪 Protein: {totalNutrition.protein} g</Text>
            <Text>🥖 Carbs: {totalNutrition.carbs} g</Text>
            <Text>🧈 Fats: {totalNutrition.fats} g</Text>
          </View>

          <FlatList
            data={meals}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 10 }}>
                <Text style={{ fontWeight: "bold" }}>📅 Date: {formatDate(item.date)}</Text>
                <Text>🍳 Breakfast: {item.meals?.breakfast || "Not logged"}</Text>
                <Text>🥗 Lunch: {item.meals?.lunch || "Not logged"}</Text>
                <Text>🍪 Snacks: {item.meals?.snacks || "Not logged"}</Text>
                <Text>🍽 Dinner: {item.meals?.dinner || "Not logged"}</Text>
                <Text>🔥 Calories: {item.nutrition?.calories || 0} kcal</Text>
                <Text>💪 Protein: {item.nutrition?.protein || 0} g</Text>
                <Text>🥖 Carbs: {item.nutrition?.carbs || 0} g</Text>
                <Text>🧈 Fats: {item.nutrition?.fats || 0} g</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

export default MealSummary;
