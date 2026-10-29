export interface LoginRequest {
  username: string;
  password: string;
}

// Respuesta de POST /auth/login (LoginResponseDTO del backend).
export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

// Lo que se guarda en sessionStorage: el token y el instante (ms) en que vence.
export interface Sesion {
  token: string;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
  expiraEn: number;
}
