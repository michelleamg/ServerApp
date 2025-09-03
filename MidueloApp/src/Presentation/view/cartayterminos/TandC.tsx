import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Checkbox from "expo-checkbox";
import useConsentimientoViewModel from "./ViewModel";

import type { StackNavigationProp } from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
}; 

export default function Termsandconditions({ navigation }: Props) {

  const { aviso, terminos, toggleAviso, toggleTerminos, submit } =
    useConsentimientoViewModel();

  const handleSubmit = async () => {
    try {
      const ok = await submit();
      if (ok) {
        Alert.alert("✅ Consentimientos guardados");
        navigation.replace("HomeApp"); // 👈 Manda al dashboard
      } else {
        Alert.alert("⚠️ Debes aceptar ambos para continuar");
      }
    } catch (err) {
      Alert.alert("❌ Error al guardar consentimientos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soy Duelingo, tu acompañante en este proceso 🕊️</Text>

      <View style={styles.checkboxContainer}>
        <Checkbox value={aviso} onValueChange={toggleAviso} />
        <Text style={styles.label}>Acepto el Aviso de Privacidad</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox value={terminos} onValueChange={toggleTerminos} />
        <Text style={styles.label}>Acepto los Términos y Condiciones</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Aceptar y Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  label: { marginLeft: 10, fontSize: 16 },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold", textAlign: "center" },
});
