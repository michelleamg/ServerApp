// Data/repositories/ConsentimientoRepositoryImpl.ts
import { ConsentimientoRepository } from '../../Domain/repositories/ConsentimientoRepository';
import { Consentimiento, ConsentimientoResponse } from '../../Domain/entities/Consentimiento';
import { API_Miduelo } from '../sources/remote/api/ApiMiduelo';
import { AxiosError } from 'axios';

export class ConsentimientoRepositoryImpl implements ConsentimientoRepository {
  
  async saveConsentimientos(consentimiento: Consentimiento): Promise<ConsentimientoResponse> {
    try {
      const response = await API_Miduelo.post<ConsentimientoResponse>('/consentimientos', consentimiento);
      return response.data;
    } catch (error) {
      const e = (error as AxiosError);
      console.log("❌ Error en saveConsentimientos:", e.response?.data || e.message);
      const apiError: ConsentimientoResponse = JSON.parse(JSON.stringify(e.response?.data || e.message));
      return Promise.resolve(apiError);
    }
  }

  async getConsentimientos(id_paciente: number): Promise<ConsentimientoResponse> {
    try {
      const response = await API_Miduelo.get<ConsentimientoResponse>(`/consentimientos/${id_paciente}`);
      return response.data;
    } catch (error) {
      const e = (error as AxiosError);
      console.log("❌ Error en getConsentimientos:", e.response?.data || e.message);
      const apiError: ConsentimientoResponse = JSON.parse(JSON.stringify(e.response?.data || e.message));
      return Promise.resolve(apiError);
    }
  }
}