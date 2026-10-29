import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Vehiculo, VehiculoRequest } from '../models/vehiculo';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/vehiculos`;

  listar(clienteId?: number | null) {
    const params = clienteId ? new HttpParams().set('clienteId', clienteId) : undefined;
    return this.http.get<Vehiculo[]>(this.url, { params });
  }
  buscar(id: number) { return this.http.get<Vehiculo>(`${this.url}/${id}`); }
  crear(datos: VehiculoRequest) { return this.http.post<Vehiculo>(this.url, datos); }
  actualizar(id: number, datos: VehiculoRequest) { return this.http.put<Vehiculo>(`${this.url}/${id}`, datos); }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
