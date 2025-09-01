import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { API_Miduelo } from "../../../Data/sources/remote/api/ApiMiduelo";

export default function RecoverPasswordScreen() {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");

  const handleRecover = async () => {
    if (!email || !codigo) {
      Alert.alert("Error", "Debes ingresar correo y código del psicólogo");
      return;
    }
    try {
      const res = await API_Miduelo.post("/recover-password", {
        email,
        codigo_psicologo: codigo,
      });
      Alert.alert("✅ Listo", res.data.message);
    } catch (err: any) {
      console.error("❌ Error:", err.response?.data || err);
      Alert.alert("Error", err.response?.data?.message || "No se pudo recuperar la contraseña");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Código del psicólogo"
        value={codigo}
        onChangeText={setCodigo}
      />
      <TouchableOpacity style={styles.button} onPress={handleRecover}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5,
  },
  button: {
    backgroundColor: "#4CAF50", padding: 12, borderRadius: 8, alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
