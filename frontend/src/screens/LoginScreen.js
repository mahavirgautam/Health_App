import React,{useState} from "react";
import {View,Text,TextInput,Button,Alert,TouchableOpacity,StyleSheet} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({navigation}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [failedAttempts,setFailedAttempts]=useState(0);
  const [showForgotPassword,setShowForgotPassword]=useState(false);

  const validateEmail=(email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin=async () => {
    if (!email || !password){
      Alert.alert("Error","Please enter email and password.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error","Invalid email format.");
      return;
    }

    try {
      const response=await fetch("https://fitfolk-33796.el.r.appspot.com/api/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password }),
      });

      const data=await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("authToken",data.token);
        Alert.alert("Success","Login successful!");
        navigation.replace("Home");
      } else {
        setFailedAttempts(failedAttempts + 1);
        if (failedAttempts >= 4){
          setShowForgotPassword(true);
        }
        Alert.alert("Error",data.error || "Login failed!");
      }
    } catch (error){
      Alert.alert("Error","Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace("Home")}>
        <Text style={styles.skipText}>Skip Login</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Login</Text>

      <Text>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text>Password:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} disabled={!email || !password}/>
      
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>

      {showForgotPassword && (
        <TouchableOpacity onPress={() => Alert.alert("Reset Password","Forgot Password clicked.")}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles= StyleSheet.create({
  container:{flex:1,padding:20,justifyContent:"center",alignItems:"center" },
  title:{fontSize:24,fontWeight:"bold",marginBottom:20},
  input:{width:"90%",borderWidth:1,padding:10,marginBottom:10,borderRadius:5},
  registerText:{marginTop:10,color:"blue"},
  forgotText:{color:"red",marginTop:10},
  skipButton:{position:"absolute",top:40,right:20,padding:10},
  skipText:{fontSize:16,color:"blue"},
});

