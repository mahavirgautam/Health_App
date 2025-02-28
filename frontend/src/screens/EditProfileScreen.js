import React,{useState,useEffect} from "react";
import {View,Text,TextInput,Button,StyleSheet,Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useNavigation} from "@react-navigation/native";

const EditProfileScreen = () => {
  const navigation=useNavigation();
  const [name,setName]=useState("");
  const [age,setAge]=useState("");
  const [weight,setWeight]=useState("");
  const [medications,setMedications]=useState("");

  useEffect(() => {
    loadUserData();
  },[]);

  const loadUserData= async () => {
    try {
      const data= await AsyncStorage.getItem("userProfile");
      if (data) {
        const userData=JSON.parse(data);
        setName(userData.name || "");
        setAge(userData.age || "");
        setWeight(userData.weight || "");
        setMedications(userData.medications || "");
      }
    } catch (error) {
      console.error("Error loading user data:",error);
    }
  };

  const saveUserData= async () => {
    if (!name || !age || !weight){
      Alert.alert("Error","Please fill in all required fields.");
      return;
    }

    const userData={name,age,weight,medications};
    try {
      await AsyncStorage.setItem("userProfile",JSON.stringify(userData));
      Alert.alert("Success","Profile updated successfully!");
      navigation.goBack();
    } catch (error){
      console.error("Error saving user data:",error);
      Alert.alert("Error","Failed to save profile.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName}/>
      <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric"/>
      <TextInput style={styles.input} placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric"/>
      <TextInput style={styles.input} placeholder="Medications (Optional)" value={medications} onChangeText={setMedications}/>

      <Button title="Save Profile" onPress={saveUserData}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:"center",padding:20,alignItems:"center"},
  heading:{fontSize:22,fontWeight:"bold",marginBottom:20},
  input:{width:"100%",borderWidth:1,padding:10,marginBottom:10,borderRadius:5},
});

export default EditProfileScreen;
