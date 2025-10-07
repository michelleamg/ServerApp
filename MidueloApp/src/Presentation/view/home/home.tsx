// Presentation/view/home/home.tsx
import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Image, Alert, 
  ActivityIndicator 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../../App";
import useViewModel from "./ViewModel";

export const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { email, password, onChange, login, error } = useViewModel();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Debes ingresar correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const response = await login();
      
      if (response && response.user) {
        console.log("📋 Consentimientos del usuario:", {
          aviso: response.user.aviso_privacidad,
          terminos: response.user.terminos_condiciones
        });
        
        // 🔥 NAVEGACIÓN BASADA EN CONSENTIMIENTOS
        if (response.user.aviso_privacidad === 0 || response.user.terminos_condiciones === 0) {
          console.log("🚀 Navegando a TermsAndConditions");
          navigation.replace("TermsAndConditions");
        } else {
          console.log("🚀 Navegando a Welcome");
          navigation.replace("Welcome");
        }
      } else {
        const errorMessage = response?.message || "Credenciales incorrectas";
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error en login:", error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/MiDueloFondo.png")}
        style={styles.imageBackground}
      />

      <View style={styles.form}>
        <Text style={styles.formText}>Ingresar</Text>

        <View style={styles.inputContainer}>
          <Image
            source={require("../../../../assets/email.png")}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Correo Electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => onChange("email", text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={require("../../../../assets/password.png")}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={(text) => onChange("password", text)}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  imageBackground: { width, height, position: "absolute" },
  form: {
    width: "90%",
    maxWidth: 350,
    height: "50%",
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  formText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    paddingBottom: 10,
  },
  textInput: { flex: 1, marginLeft: 10, paddingLeft: 10, fontSize: 16 },
  inputIcon: { width: 25, height: 25 },
  loginButton: {
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  loginButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  registerText: { fontSize: 14, color: "black" },
  registerLink: { fontSize: 14, color: "#4CAF50", fontWeight: "bold" },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default HomeScreen;