// Update the import path and exported name to match your actual User model file and export.
// For example, if your model is exported as 'User' from 'User.ts', use:
import { User } from '../models/User';

export interface AuthRepository {
  //login(email: string, password: string): Promise<any>;
  register(user: User): Promise<any>;
}
