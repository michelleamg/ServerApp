import { User } from '../entities/User';
import { RegisterResponse} from '../../Data/sources/remote/models/responseApiMiDuelo';

export interface AuthRepository {

  login(email: string, password: string): Promise<RegisterResponse>; // Retorna un token
  register(user: User): Promise<RegisterResponse>;
}
