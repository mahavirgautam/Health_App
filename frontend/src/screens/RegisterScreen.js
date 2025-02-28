
import React,{useState} from "react";
import {View,Text,TextInput,Button,Alert,StyleSheet,TouchableOpacity} from "react-native";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen=() => {
  const navigation= useNavigation();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const validateEmail=(email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error","Please enter email and password.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error","Invalid email format.");
      return;
    }

    try {
      const response = await fetch("https://fitfolk-33796.el.r.appspot.com/api/register",{
        method:"POST",
        headers: { "Content-Type":"application/json"},
        body: JSON.stringify({email,password}),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Registration Successful!","Please login now.");
        navigation.replace("LoginScreen");
      } else {
        Alert.alert("❌ Registration Failed",data.error || "Unknown error.");
      }
    } catch (error) {
      Alert.alert("⚠️ Error","Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      

      <Text style={styles.heading}>Register</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Register" onPress={handleRegister} disabled={!email || !password} />

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Already have an account?Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:"center",alignItems:"center",padding:20},
  heading:{fontSize:22,fontWeight:"bold",marginBottom:20,textAlign:"center"},
  input:{width:"100%",borderWidth:1,padding:10,marginBottom:10,borderRadius:5},
  loginLink:{marginTop:15},
  loginText:{color:"blue",fontSize:16},
});

export default RegisterScreen;
