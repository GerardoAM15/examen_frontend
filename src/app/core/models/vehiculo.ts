// El backend devuelve clienteId y clienteNombre, nunca la entidad Cliente anidada.
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
  clienteNombre: string;
}

export type VehiculoRequest = Omit<Vehiculo, 'id' | 'clienteNombre'>;
