import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons"; 

const YogaNidra = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playMusic = async () => {
    try {
      if (sound) {
        await sound.playAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require("../../assets/music/yoganidra.mp3") 
        );
        setSound(newSound);
        await newSound.playAsync();
      }
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const pauseMusic = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/music/nidra.jpeg")} style={styles.albumCover} />
      
      <Text style={styles.title}>Yoga Nidra - Deep Relaxation</Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={isPlaying ? pauseMusic : playMusic} style={styles.button}>
          <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={80} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default YogaNidra;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  albumCover: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22, 
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginHorizontal: 10,
  },
});
