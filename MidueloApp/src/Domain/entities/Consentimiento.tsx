// Domain/entities/Consentimiento.ts
export interface Consentimiento {
  id_paciente: number;
  aviso_privacidad: boolean;
  terminos_condiciones: boolean;
}

export interface ConsentimientoResponse {
  message: string;
  consentimientos: {
    aviso_privacidad: number;
    terminos_condiciones: number;
  };
}