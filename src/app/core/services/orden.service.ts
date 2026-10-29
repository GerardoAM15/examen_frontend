import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FiltroOrdenes, Orden, OrdenRequest } from '../models/orden';

@Injectable({ providedIn: 'root' })
export class OrdenService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ordenes`;

  // Solo se envían los filtros con valor: GET /ordenes?placa&estado&desde&hasta
  listar(filtro: FiltroOrdenes = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor) params = params.set(clave, String(valor).trim());
    }
    return this.http.get<Orden[]>(this.url, { params });
  }
  buscar(id: number) { return this.http.get<Orden>(`${this.url}/${id}`); }
  registrar(datos: OrdenRequest) { return this.http.post<Orden>(this.url, datos); }
  anular(id: number, motivo: string) { return this.http.patch<Orden>(`${this.url}/${id}/anular`, { motivo }); }
}
