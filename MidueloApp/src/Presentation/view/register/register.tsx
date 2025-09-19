import React, { useState } from "react";
import { 
  StyleSheet, Text, View, Image, TextInput, 
  TouchableOpacity, ScrollView, Alert 
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../../App";
import RegisterViewModel from "./ViewModel";

export default function Register() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { 
    nombre, apellido_paterno, apellido_materno, 
    fecha_nacimiento, telefono, email, password, codigo_psicologo,
    onChange, register, isValidForm, errorMessage
  } = RegisterViewModel();

  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !apellido_paterno || !apellido_materno || !fecha_nacimiento || !telefono || !email || !password || !codigo_psicologo) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      await register();
      Alert.alert(" Registro exitoso", "Ya puedes iniciar sesión");
      navigation.navigate("Home");
    } catch (err) {
      console.error("Error en registro:", err);
      Alert.alert("Error", "No se pudo registrar. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require("../../../../assets/duelofondo.png")}  
        style={styles.imageBackground}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Image source={require("../../../../assets/duelingo.png")} style={styles.logoIcon} />
          <Text style={styles.welcomeText}>¡Bienvenido a MiDuelo!</Text>
          <Text style={styles.formText}>Regístrate</Text>

          {/* Nombre */}
          <View style={styles.inputContainer}>
            <Image source={require("../../../../assets/duelingo.png")} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="Nombre"
              value={nombre} 
              onChangeText={(t) => onChange("nombre", t)} 
            />
          </View>

          {/* Apellido Paterno */}
          <View style={styles.inputContainer}>
            <Image source={require("../../../../assets/duelingo.png")} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="Apellido Paterno"
              value={apellido_paterno} 
              onChangeText={(t) => onChange("apellido_paterno", t)} 
            />
          </View>

          {/* Apellido Materno */}
          <View style={styles.inputContainer}>
            <Image source={require("../../../../assets/duelingo.png")} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="Apellido Materno"
              value={apellido_materno} 
              onChangeText={(t) => onChange("apellido_materno", t)} 
            />
          </View>

          {/* Fecha de Nacimiento */}
          <View style={styles.inputContainer}>
            <Image source={require("../../../../assets/duelingo.png")} style={styles.inputIcon} />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, paddingLeft: 10, color: fecha_nacimiento ? "black" : "gray" }}>
                {fecha_nacimiento || "Selecciona tu fecha de nacimiento"}
              </Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={fecha_nacimiento ? new Date(fecha_nacimiento) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const iso = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
                  onChange("fecha_nacimiento", iso);
                }
              }}
            />
          )}

          {/* Teléfono */}
          <View style={styles.inputContainer}>
            <Image source={require("../../../../assets/duelingo.png")} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="Teléfono"
              keyboardType="phone-pad"
              value={telefono} 
              onChangeText={(t) => onChange("telefono", t)} 
            />
          </View>

          {/* Correo */}
          <View style={styles.inputContainer}>
            <Image source={require("../../../../assets/duelingo.png")} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email} 
              onChangeText={(t) => onChange("email", t)} 
            />
          </View>

          {/* Contraseña con toggle 👁️ */}
          <View style={styles.inputContainer}>
            <Image source={require("../../../../assets/duelingo.png")} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="Contraseña"
              secureTextEntry={!showPassword}
              value={password} 
              onChangeText={(t) => onChange("password", t)} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ color: "#4CAF50", fontWeight: "bold", marginLeft: 10 }}>
                {showPassword ? "Ocultar" : "Ver"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Código Psicólogo */}
          <View style={styles.inputContainer}>
            <Image source={require("../../../../assets/duelingo.png")} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="Código del Psicólogo"
              value={codigo_psicologo} 
              onChangeText={(t) => onChange("codigo_psicologo", t)} 
            />
          </View>

          {/* Botón registro */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>

          {/* Link login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Text style={styles.loginLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  imageBackground: { width: "100%", height: "100%", position: "absolute" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", paddingVertical: 40 },
  form: {
    width: "90%",
    maxWidth: 350,
    backgroundColor: "#ffffffee",
    alignSelf: "center",
    padding: 20,
    borderRadius: 40,
  },
  logoIcon: { width: 130, height: 130, alignSelf: "center", marginBottom: 10 },
  welcomeText: {
    fontSize: 22, fontWeight: "bold", fontFamily: "serif",
    color: "#2E7D32", textAlign: "center", marginBottom: 10,
  },
  formText: {
    fontSize: 18, fontWeight: "600", color: "#333",
    marginBottom: 20, textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    paddingBottom: 5,
  },
  inputIcon: { width: 25, height: 25, tintColor: "#4CAF50" },
  textInput: { flex: 1, fontSize: 16, paddingLeft: 10 },
  registerButton: {
    backgroundColor: "#4CAF50", alignItems: "center",
    justifyContent: "center", padding: 12, marginTop: 20,
    borderRadius: 8,
  },
  registerButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  loginContainer: { marginTop: 25, flexDirection: "row", justifyContent: "center" },
  loginText: { fontSize: 14, color: "black" },
  loginLink: {
    fontSize: 14, textDecorationLine: "underline",
    color: "#4CAF50", fontWeight: "bold",
  },
});
// --- IGNORE ---
