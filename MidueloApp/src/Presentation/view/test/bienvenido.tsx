import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👋 Bienvenido a MiDuelo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // centra verticalmente
    alignItems: "center",     // centra horizontalmente
    backgroundColor: "#f9f9f9",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90E2", // azul suave
  },
});
