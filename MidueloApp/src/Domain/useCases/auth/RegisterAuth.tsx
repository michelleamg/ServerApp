import { AuthRepositoryImpl } from '../../../Data/repositories/AuthRepository';
import { User } from '../../entities/User'; 

const AuthRepository = new AuthRepositoryImpl();

export const RegisterAuthUseCase = async(user: User) => {
    return await AuthRepository.register(user);
};