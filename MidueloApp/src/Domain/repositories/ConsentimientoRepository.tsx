// Domain/repositories/ConsentimientoRepository.ts
import { Consentimiento, ConsentimientoResponse } from '../entities/Consentimiento';

export interface ConsentimientoRepository {
  saveConsentimientos(consentimiento: Consentimiento): Promise<ConsentimientoResponse>;
  getConsentimientos(id_paciente: number): Promise<ConsentimientoResponse>;
}