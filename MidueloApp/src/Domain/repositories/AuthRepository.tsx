import { User } from '../entities/User';
import { RegisterResponse} from '../../Data/Sources/remote/models/responseApiMiDuelo';

export interface AuthRepository {

  register(user: User): Promise<RegisterResponse>;
}
