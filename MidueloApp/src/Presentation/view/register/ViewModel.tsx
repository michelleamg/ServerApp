import { useState } from "react";
import { RegisterAuthUseCase } from "../../../Domain/useCases/auth/RegisterAuth";
import { RegisterResponse } from "../../../Data/sources/remote/models/responseApiMiDuelo";

const RegisterViewModel = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [values, setValues] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "", 
    telefono: "",
    email: "",
    password: "",
    codigo_psicologo: "",  
  });

  const onChange = (property: string, value: string) => {
    setValues({ ...values, [property]: value });
  };

  const register = async (): Promise<{success: boolean, token?: string}> => {
    if (isValidForm()) {
      const { result, error } = await RegisterAuthUseCase(values);
      
      if (error) {
        setErrorMessage(error);
        return { success: false };
      }
      
      if (result) {
        console.log('Result:' + JSON.stringify(result));
        
        if (result.token) {
          // Token disponible para usar
          console.log('Token registrado:', result.token);
          return { success: true, token: result.token };
        }
        
        return { success: true };
      }
    }
    return { success: false };
  };

  const isValidForm = (): boolean => {
    if (values.nombre === "" || values.apellido_paterno === "" || values.apellido_materno === "" || values.fecha_nacimiento === "" || values.telefono === "" || values.email === "" || values.password === "") {
      setErrorMessage("Por favor, complete todos los campos obligatorios.");
      return false;
    }
    return true;
  };

  return {
    ...values,
    onChange,
    register,
    errorMessage
  };
};

export default RegisterViewModel;