export type EstadoOrden = 'REGISTRADA' | 'ANULADA';

export interface DetalleOrden {
  id: number;
  servicioId: number;
  codigo: string;
  servicio: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Orden {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  placa: string;
  clienteNombre: string;
  kilometraje: number;
  estado: EstadoOrden;
  total: number;
  usuarioRegistro: string;
  motivoAnulacion: string | null;
  detalles: DetalleOrden[];
}

// La SPA solo envía qué servicio y cuántos: precios, subtotales y total los calcula el backend.
export interface OrdenRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: { servicioId: number; cantidad: number }[];
}

export interface FiltroOrdenes {
  placa?: string;
  estado?: EstadoOrden | '';
  desde?: string;
  hasta?: string;
}
