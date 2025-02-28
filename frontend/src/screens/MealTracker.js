import React, { useEffect, useState } from "react";
import { 
  View, Text, Button, ScrollView, Alert, TouchableOpacity, StyleSheet 
} from "react-native";
import { Picker } from "@react-native-picker/picker"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const MealTracker = () => {
  const [foodItems, setFoodItems] = useState([]); 
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  });
  const [selectedMealItem, setSelectedMealItem] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });

  const navigation = useNavigation(); 

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get("https://fitfolk-33796.el.r.appspot.com/api/get-food-items");
      setFoodItems(response.data.food_items || []); 
    } catch (error) {
      console.error("Error fetching food items:", error);
      Alert.alert("⚠️ Error", "Failed to load food items.");
    }
  };

  const addFoodToMeal = (mealType) => {
    const selectedFood = selectedMealItem[mealType];
    
    if (!selectedFood) {
      Alert.alert("⚠️ Select a food item", "Please select a food item before adding.");
      return;
    }

    if (!meals[mealType].includes(selectedFood)) {
      setMeals((prevMeals) => ({
        ...prevMeals,
        [mealType]: [...prevMeals[mealType], selectedFood], 
      }));
    }
  };

  const removeFoodFromMeal = (mealType, food) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].filter((item) => item !== food),
    }));
  };

  const logMeal = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Login Required", "Please log in first.");
        return;
      }

      const hasMeals = Object.values(meals).some((meal) => meal.length > 0);
      if (!hasMeals) {
        Alert.alert("⚠️ No Meals Selected", "Please add at least one meal before logging.");
        return;
      }

      await axios.post(
        "https://fitfolk-33796.el.r.appspot.com/api/log-meal",
        { meals: meals }, 
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      Alert.alert("✅ Success", "Meal logged successfully!");
      navigation.replace("MealSummary"); 

    } catch (error) {
      console.error("Error logging meal:", error.response?.data || error);
      Alert.alert("⚠️ Error", error.response?.data?.error || "Failed to log meal.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🍽 Meal Tracker</Text>

      {Object.keys(meals).map((mealType) => (
        <View key={mealType} style={styles.mealContainer}>
          <Text style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>

          <Picker
            selectedValue={selectedMealItem[mealType]}
            onValueChange={(itemValue) => setSelectedMealItem({ ...selectedMealItem, [mealType]: itemValue })}
            style={styles.picker}
          >
            <Picker.Item label="Select a food item" value="" />
            {foodItems.map((item, index) => (
              <Picker.Item key={index} label={item} value={item} />
            ))}
          </Picker>

          <Button title="➕ Add to Meal" onPress={() => addFoodToMeal(mealType)} />

          {meals[mealType].length > 0 ? (
            <View style={styles.selectedItemsContainer}>
              {meals[mealType].map((food, index) => (
                <View key={index} style={styles.selectedItem}>
                  <Text>{food}</Text>
                  <TouchableOpacity onPress={() => removeFoodFromMeal(mealType, food)}>
                    <Text style={styles.removeText}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noItemsText}>No items selected</Text>
          )}
        </View>
      ))}

      <View style={styles.logMealButtonContainer}>
        <Button title="✅ Log Meal" onPress={logMeal} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  mealContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    height: 50,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
  },
  selectedItemsContainer: {
    marginTop: 10,
    padding: 5,
    borderRadius: 5,
  },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    padding: 5,
    marginVertical: 2,
    borderRadius: 5,
  },
  removeText: {
    color: "red",
    fontWeight: "bold",
    paddingHorizontal: 5,
  },
  noItemsText: {
    color: "#888",
    fontStyle: "italic",
    marginTop: 5,
  },
  logMealButtonContainer: {
    marginBottom: 20,
  },
});

export default MealTracker;
