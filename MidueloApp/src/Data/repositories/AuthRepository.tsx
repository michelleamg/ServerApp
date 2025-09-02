
import { user } from "../../Domain/entity/User";
import { AuthRepository } from "../../Domain/reporsitories/AuthRepository";


export class AuthRepositoryImpl implements AuthRepository {
  //async login(email: string, password: string): Promise<any> {
    // Implement login logic here}

  async register(user: user): Promise<any> {
    try {
      const response = await API_Miduelo.post<ResponseA>("/register", user);
      return Promise.resolve(response.data);

    } catch (error) {
      let errorMessage = (error as Error).message;
      console.error("Registration error:", errorMessage);
      return Promise.resolve({ error: errorMessage, result: undefined });
    }
  }
}
