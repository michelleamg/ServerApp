import { AuthRepositoryImpl } from "../../../Data/repositories/AuthRepository";
import { AuthRepository } from "../../repositories/AuthRepository";
import { RegisterResponse } from "../../../Data/Sources/remote/models/responseApiMiDuelo";

const { login } = new AuthRepositoryImpl(); 


export class LoginAuthUseCase {
    static async execute(email: string, password: string) {
        return await login(email, password);
    }
}