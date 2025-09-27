import { useState } from "react";
import { API_Miduelo } from "../../../Data/Sources/remote/api/ApiMiduelo";
import { LoginAuthUseCase } from "../../../Domain/useCases/auth/Login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";

const HomeViewModel = () => {
  const [values, setValues] = useState({ email: "", password: "" });

  const onChange = (property: string, value: any) => {
    setValues({ ...values, [property]: value });
  };

  const login = async () => {
    try {
      const response = await LoginAuthUseCase.execute(values.email, values.password);
      console.log("RESPONSE:", JSON.stringify(response));
  
    } catch (error) {
      console.error("Login failed:", (error as AxiosError).response?.data || error);
      throw error;
    }
  };

  const isValidForm = ():boolean => {
    if (!values.email || !values.password) {
      return false;
    }
    return true;
  };

  return {
    ...values,
    onChange,
    login,
    isValidForm,
    errorMessage: values.email === "" || values.password === "" ? "Debes ingresar correo y contraseña" : "",
  };
};

export default HomeViewModel;
