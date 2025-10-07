// Presentation/view/cartayterminos/TandC.tsx
import React, { useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from "react-native";
import Checkbox from "expo-checkbox";
import useConsentimientoViewModel from "./ViewModel";
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  navigation: StackNavigationProp<any>;
}; 

export default function Termsandconditions({ navigation }: Props) {
  const { 
    aviso, 
    terminos, 
    loading, 
    error,
    toggleAviso, 
    toggleTerminos, 
    submit 
  } = useConsentimientoViewModel();

  // 🔥 DEBUG: Ver qué hay en el storage
  useEffect(() => {
    const debugStorage = async () => {
      const id_paciente = await AsyncStorage.getItem("id_paciente");
      const token = await AsyncStorage.getItem("userToken");
      console.log("🔍 DEBUG Storage - id_paciente:", id_paciente, "token:", token);
    };
    debugStorage();
  }, []);

  const handleSubmit = async () => {
    console.log("🎯 Intentando enviar consentimientos...");
    
    const success = await submit();
    
    if (success) {
      Alert.alert("✅ Éxito", "Consentimientos guardados correctamente", [
        {
          text: "Continuar",
          onPress: () => navigation.replace("Welcome") // 👈 Cambia "HomeApp" por "Welcome"
        }
      ]);
    } else {
      if (error) {
        Alert.alert("❌ Error", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soy Duelingo, tu acompañante en este proceso 🕊️</Text>
      <Text style={styles.subtitle}>Para continuar, necesitamos tu consentimiento</Text>

      <View style={styles.checkboxContainer}>
        <Checkbox 
          value={aviso} 
          onValueChange={toggleAviso} 
          disabled={loading}
        />
        <Text style={styles.label}>Acepto el Aviso de Privacidad</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox 
          value={terminos} 
          onValueChange={toggleTerminos} 
          disabled={loading}
        />
        <Text style={styles.label}>Acepto los Términos y Condiciones</Text>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.infoText}>Marca ambas casillas para continuar</Text>
      )}

      <TouchableOpacity 
        style={[
          styles.button, 
          (!aviso || !terminos || loading) && styles.buttonDisabled
        ]} 
        onPress={handleSubmit}
        disabled={!aviso || !terminos || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Aceptar y Continuar</Text>
        )}
      </TouchableOpacity>

      {/* 🔥 BOTÓN TEMPORAL PARA DEBUG */}
      <TouchableOpacity 
        style={[styles.debugButton]}
        onPress={async () => {
          const id = await AsyncStorage.getItem("id_paciente");
          Alert.alert("Debug", `id_paciente en storage: ${id || "NO ENCONTRADO"}`);
        }}
      >
        <Text style={styles.debugButtonText}>Debug: Ver ID</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10, 
    textAlign: "center",
    color: "#333"
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#666"
  },
  checkboxContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20 
  },
  label: { 
    marginLeft: 10, 
    fontSize: 16,
    flex: 1 
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold", 
    textAlign: "center" 
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  infoText: {
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  debugButton: {
    backgroundColor: "#FF9800",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  debugButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
  },
});