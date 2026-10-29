import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response';

export function mensajeError(err: HttpErrorResponse): string {
  if (err.status === 0) return 'No se pudo conectar con AutoAndes API. Verifique que el backend esté en ejecución.';
  const cuerpo = err.error as ErrorResponse | null;
  return cuerpo?.mensaje ?? `Error ${err.status}: ${err.statusText}`;
}

export function camposError(err: HttpErrorResponse): Record<string, string> {
  const cuerpo = err.error as ErrorResponse | null;
  return cuerpo?.campos ?? {};
}
