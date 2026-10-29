import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Servicio, ServicioRequest } from '../models/servicio';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/servicios`;

  listar() { return this.http.get<Servicio[]>(this.url); }
  buscar(id: number) { return this.http.get<Servicio>(`${this.url}/${id}`); }
  crear(datos: ServicioRequest) { return this.http.post<Servicio>(this.url, datos); }
  actualizar(id: number, datos: ServicioRequest) { return this.http.put<Servicio>(`${this.url}/${id}`, datos); }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
  cambiarEstado(id: number, activo: boolean) { return this.http.patch<Servicio>(`${this.url}/${id}/estado`, { activo }); }
}
