// Presentation/view/home/ViewModel.tsx
import { useState } from "react";
import { loginUseCase } from "../../../Domain/useCases/auth/Login";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeViewModel = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (property: string, value: string) => {
    setValues({ ...values, [property]: value });
    setError("");
  };

  const login = async () => {
    if (!isValidForm()) {
      setError("Debes ingresar correo y contraseña");
      return null;
    }

    try {
      console.log("🔐 Intentando login con:", values.email);
      const response = await loginUseCase(values.email, values.password);
      console.log("✅ Respuesta login:", JSON.stringify(response));
      
      // 🔥 GUARDAR EL ID_PACIENTE Y TOKEN
      if (response.token && response.user) {
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('id_paciente', response.user.id_paciente.toString());
        console.log("💾 Token e ID guardados:", response.user.id_paciente);
      }
      
      return response;
    } catch (error) {
      console.error("❌ Login failed:", error);
      setError("Error de conexión. Verifica tu conexión a internet.");
      throw error;
    }
  };

  const isValidForm = (): boolean => {
    return !!(values.email && values.password);
  };

  return {
    ...values,
    onChange,
    login,
    error,
    isValidForm,
  };
};

export default HomeViewModel;