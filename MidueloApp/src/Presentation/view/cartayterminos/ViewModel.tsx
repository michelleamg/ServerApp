// Presentation/view/cartayterminos/ViewModel.tsx
import { useState } from "react";
import { API_Miduelo } from "../../../Data/sources/remote/api/ApiMiduelo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useConsentimientoViewModel = () => {
  const [aviso, setAviso] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleAviso = () => {
    setAviso(!aviso);
    setError("");
  };

  const toggleTerminos = () => {
    setTerminos(!terminos);
    setError("");
  };

  const submit = async (): Promise<boolean> => {
    if (!aviso || !terminos) {
      setError("Debes aceptar ambos consentimientos para continuar");
      return false;
    }

    setLoading(true);
    setError("");

    try {
      // Obtener id_paciente del storage
      let id_paciente = await AsyncStorage.getItem("id_paciente");
      
      // 🔥 SI NO EXISTE, USAR UNO TEMPORAL PARA PRUEBAS
      if (!id_paciente) {
        console.log("⚠️ No se encontró id_paciente, usando temporal");
        id_paciente = "1"; // Cambia este número por un ID que exista en tu BD
      }

      console.log("🚀 Enviando consentimientos para paciente:", id_paciente);

      // Hacer la petición directamente
      const response = await API_Miduelo.post("/consentimientos", {
        id_paciente: parseInt(id_paciente),
        aviso: aviso,
        terminos: terminos
      });

      console.log("✅ Respuesta del servidor:", response.data);

      if (response.data.message && response.data.message.includes("exitosamente")) {
        return true;
      } else {
        setError(response.data.message || "Error desconocido");
        return false;
      }

    } catch (err: any) {
      console.error("❌ Error al guardar consentimientos:", err);
      
      // Mostrar error específico
      if (err.response?.data) {
        setError(err.response.data.message || "Error del servidor");
      } else {
        setError("Error de conexión. Verifica tu internet.");
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    aviso,
    terminos,
    loading,
    error,
    toggleAviso,
    toggleTerminos,
    submit,
  };
};

export default useConsentimientoViewModel;