import { AuthRepositoryImpl } from '../../../Data/repositories/AuthRepository';
import { User } from '../../entities/User'; 
import { RegisterResponse } from '../../../Data/sources/remote/models/responseApiMiDuelo';

const AuthRepository = new AuthRepositoryImpl();

export const RegisterAuthUseCase = async(user: User): Promise<{result: RegisterResponse | null, error: string | null}> => {
    try {
        const response = await AuthRepository.register(user);
        
        // Si el registro fue exitoso, guarda el token localmente
        if (response.token) {
            // Aquí puedes guardar el token en AsyncStorage o tu método preferido
            console.log('Token recibido:', response.token);
            // Ejemplo: await AsyncStorage.setItem('userToken', response.token);
        }
        
        return { result: response, error: null };
    } catch (error) {
        return { result: null, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
};