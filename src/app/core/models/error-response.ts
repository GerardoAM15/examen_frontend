// Formato de error común del backend (sección 3.5 del contrato).
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  ruta: string;
  campos?: Record<string, string>;
}
