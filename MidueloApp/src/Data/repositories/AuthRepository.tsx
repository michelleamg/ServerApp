import axios, { Axios, AxiosError } from 'axios';
import { AuthRepository } from '../../Domain/repositories/AuthRepository';
import { User } from '../../Domain/entities/User';
import { API_Miduelo } from '../sources/remote/api/ApiMiduelo';
import { RegisterResponse, LoginResponse } from '../sources/remote/models/responseApiMiDuelo';

export class AuthRepositoryImpl implements AuthRepository {
  
  async register(user: User): Promise<RegisterResponse> {
    try {
      const response = await API_Miduelo.post<RegisterResponse>('/register', user);
      return response.data;
    } catch (error) {
       let e = (error as AxiosError);
       console.log(JSON.stringify(e.response?.data || e.message));
       const apiError: RegisterResponse = JSON.parse(JSON.stringify(e.response?.data || e.message));
       return Promise.resolve(apiError);
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await API_Miduelo.post<LoginResponse>('/login', { email, password });
      return response.data;
    } catch (error) {
       let e = (error as AxiosError);
       console.log(JSON.stringify(e.response?.data || e.message));
       const apiError: LoginResponse = JSON.parse(JSON.stringify(e.response?.data || e.message));
       return Promise.resolve(apiError);
    }
  }
}