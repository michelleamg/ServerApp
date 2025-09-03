import { useState } from "react";
import { API_Miduelo } from "../../../Data/sources/remote/api/ApiMiduelo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useConsentimientoViewModel = () => {
  const [aviso, setAviso] = useState(false);
  const [terminos, setTerminos] = useState(false);

  const toggleAviso = () => setAviso(!aviso);
  const toggleTerminos = () => setTerminos(!terminos);

  const submit = async () => {
    if (!aviso || !terminos) return false;

    try {
      // 👇 Recuperamos id_paciente guardado al hacer login
      const id_paciente = await AsyncStorage.getItem("id_paciente");

      if (!id_paciente) {
        throw new Error("No se encontró id_paciente en sesión");
      }

      await API_Miduelo.post("/consentimientos", {
        id_paciente,
        aviso,
        terminos,
      });

      return true;
    } catch (error) {
      console.error("❌ Error guardando consentimientos:", error);
      return false;
    }
  };

  return {
    aviso,
    terminos,
    toggleAviso,
    toggleTerminos,
    submit,
  };
};

export default useConsentimientoViewModel;

