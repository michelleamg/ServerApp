import { productsAPI } from "../api/productsApi";
import { User } from "../interfaces/user";

export interface AuthResponse {
    id: number;
    email: string;
    username: string;
    isActive: boolean;
    token: string;
}

const returnUserToken = (data: AuthResponse) => {

  const { id, email, username, isActive, token } = data;
  const user: User = { id, email, name: username, isActive, };
  return { user, token };

};

export const  AuthLoofin = (email:string, password:string) => {
  
  email = email.toLowerCase();
  try {
  const {data}=  await.productsAPI.post<AuthResponse>("/auth/login", { email, password }); 
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}
export const Authcheck = async () => {
  try {
    const { data } = await productsAPI.get<AuthResponse>("/auth/check");
    return returnUserToken(data);
  } catch (error) {
    return null;
  }
}