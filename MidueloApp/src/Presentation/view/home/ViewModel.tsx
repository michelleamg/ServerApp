import { useState } from "react";
import { API_Miduelo } from "../../../Data/Sources/remote/api/ApiMiduelo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeViewModel = () => {
  const [values, setValues] = useState({ email: "", password: "" });

  const onChange = (property: string, value: any) => {
    setValues({ ...values, [property]: value });
  };

  const login = async () => {
    try {
      const response = await API_Miduelo.post("/login", values);
      console.log("✅ Login successful:", response.data);
      const user= response.data.user;
      await AsyncStorage.setItem("id_paciente", user.id_paciente.toString());

      return response.data;
    } catch (error) {
      console.error("❌ Login failed:", (error as any).response?.data || error);
      throw error;
    }
  };

  return {
    ...values,
    onChange,
    login,
  };
};

export default HomeViewModel;
