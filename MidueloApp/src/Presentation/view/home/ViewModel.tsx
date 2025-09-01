import { useState } from "react";
import { API_Miduelo } from "../../../Data/sources/remote/api/ApiMiduelo";

const HomeViewModel = () => {
  const [values, setValues] = useState({ email: "", password: "" });

  const onChange = (property: string, value: any) => {
    setValues({ ...values, [property]: value });
  };

  const login = async () => {
    try {
      const response = await API_Miduelo.post("/login", values);
      console.log("✅ Login successful:", response.data);
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
