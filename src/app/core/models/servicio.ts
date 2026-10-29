export interface Servicio {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
}

export type ServicioRequest = Omit<Servicio, 'id'>;
