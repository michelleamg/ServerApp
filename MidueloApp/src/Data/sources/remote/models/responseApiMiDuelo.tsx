// Para REGISTRO
export interface RegisterResponse {
  message: string;
  user: {
    id_paciente: number;
    nombre: string;
    email: string;
    session_token?: string;
  };
  token?: string; // Añade esta propiedad
  error?: string;
}

// Para LOGIN
export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id_paciente: number;
    nombre: string;
    email: string;
    aviso_privacidad: number;
    terminos_condiciones: number;
    session_token?: string;
  };
  error?: string;
}

// Interface unificada si las usas igual
export interface AuthResponse {
  message: string;
  token?: string;
  user: {
    id_paciente: number;
    nombre: string;
    email: string;
    aviso_privacidad?: number;
    terminos_condiciones?: number;
    session_token?: string;
  };
  error?: string;
}