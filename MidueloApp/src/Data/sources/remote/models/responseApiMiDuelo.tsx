// Para LOGIN
/*export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id_paciente: number;
    nombre: string;
    email: string;
  };
}*/

// Para REGISTRO
export interface RegisterResponse {
  message: string;
  user: {
    id_paciente: number;
    nombre: string;
    email: string;
  };
}
