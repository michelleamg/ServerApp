import React from "react";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../../App";
import useViewModel from "./ViewModel";

export const HomeScreen = () => {
  const { email, password, onChange, login } = useViewModel();

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    try {
      const data = await login(); // Llamamos al backend
      if (data) {
        navigation.navigate("Welcome"); // ✅ Navega solo si login correcto
      }
    } catch (err) {
      Alert.alert("Error", "Credenciales inválidas o servidor no disponible");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/MiDueloFondo.png")}
        style={styles.imageBackground}
      />

      <View style={styles.form}>
        <Text style={styles.formText}> Ingresar </Text>

        <View style={styles.inputContainer}>
          <Image
            source={require("../../../../assets/email.png")}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Correo Electrónico"
            keyboardType="email-address"
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
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => onChange("password", text)}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  imageBackground: { width: "100%", height: "100%" },
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
    fontFamily: "sans-serif",
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
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  loginButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  registerText: { fontSize: 14, color: "black" },
  registerLink: { fontSize: 14, color: "#4CAF50", fontWeight: "bold" },
});
