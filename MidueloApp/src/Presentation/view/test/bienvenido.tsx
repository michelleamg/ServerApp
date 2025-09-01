import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Image 
        source={require("../../../../assets/duelofondo.png")}  
        style={styles.imageBackground}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  container: { 
    flex: 1, 
    backgroundColor: "#fff" },

  imageBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
});
