
import { useState } from "react";
import { RegisterAuthUseCase } from "../../../Domain/useCases/auth/RegisterAuth";

const RegisterViewModel = () => {

  const[errorMessage, setErrorMessage] = useState("");
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

  const register = async () => {
    if (isValidForm()) {
      const { result, error } = await RegisterAuthUseCase(values);
      console.log('Result:' + JSON.stringify(result));
    }
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
