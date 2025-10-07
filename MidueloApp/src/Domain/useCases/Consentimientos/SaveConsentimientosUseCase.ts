// Domain/useCases/consentimiento/SaveConsentimientosUseCase.ts
import { ConsentimientoRepository } from '../../repositories/ConsentimientoRepository';
import { Consentimiento, ConsentimientoResponse } from '../../entities/Consentimiento';

export class SaveConsentimientosUseCase {
  constructor(private repository: ConsentimientoRepository) {}

  async execute(consentimiento: Consentimiento): Promise<ConsentimientoResponse> {
    return await this.repository.saveConsentimientos(consentimiento);
  }
}