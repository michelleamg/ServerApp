
   import { useState } from "react";
import { API_Miduelo } from "../../../Data/sources/remote/api/ApiMiduelo";

const RegisterViewModel = () => {
  const [values, setValues] = useState({
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  fecha_nacimiento: "",  // 👈 nuevo
  telefono: "",
  email: "",
  password: "",
  codigo_psicologo: "",  // 👈 obligatorio
});

  const onChange = (property: string, value: string) => {
    setValues({ ...values, [property]: value });
  };

  const register = async () => {
    try {
      const response = await API_Miduelo.post("/register", values);
      console.log("✅ Registro exitoso:", response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as any;
      console.error("❌ Registro fallido:", axiosError.response?.data || error);
      throw error;
    }
  };

  return {
    ...values,
    onChange,
    register,
  };
};

export default RegisterViewModel;
