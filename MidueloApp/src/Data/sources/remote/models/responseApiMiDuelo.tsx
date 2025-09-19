// Para REGISTRO
export interface RegisterResponse {
  message: string;
  user: {
    id_paciente: number;
    nombre: string;
    email: string;
  };
  error?: string;
}
