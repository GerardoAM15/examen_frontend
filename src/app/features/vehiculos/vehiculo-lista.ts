import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Cliente } from '../../core/models/cliente';
import { Vehiculo } from '../../core/models/vehiculo';
import { ClienteService } from '../../core/services/cliente.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { mensajeError } from '../../core/utils/http-error';

@Component({
  selector: 'app-vehiculo-lista',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="page-header">
        <div><p class="eyebrow">Clientes</p><h2>Vehículos</h2></div>
        <a routerLink="nuevo" class="btn btn-primary">+ Nuevo vehículo</a>
      </div>

      @if (mensaje()) { <div class="alerta" [class.exito]="exito()">{{ mensaje() }}</div> }

      <div class="card">
        <div class="filtros">
          <div class="campo">
            <label for="cliente">Filtrar por cliente</label>
            <!-- El filtro se envía al backend como GET /vehiculos?clienteId= -->
            <select id="cliente" class="input" (change)="filtrar($any($event.target).value)">
              <option value="">Todos los clientes</option>
              @for (c of clientes(); track c.id) { <option [value]="c.id">{{ c.nombres }}</option> }
            </select>
          </div>
        </div>

        @if (cargando()) {
          <p class="estado">Cargando vehículos...</p>
        } @else if (errorCarga()) {
          <p class="estado error">{{ errorCarga() }} <button class="btn btn-sm" (click)="cargar()">Reintentar</button></p>
        } @else if (vehiculos().length === 0) {
          <p class="estado">No hay vehículos registrados para este filtro.</p>
        } @else {
          <table class="tabla">
            <thead><tr><th>Placa</th><th>Marca</th><th>Modelo</th><th class="num">Año</th><th>Cliente</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (v of vehiculos(); track v.id) {
                <tr>
                  <td><strong>{{ v.placa }}</strong></td>
                  <td>{{ v.marca }}</td>
                  <td>{{ v.modelo }}</td>
                  <td class="num">{{ v.anio }}</td>
                  <td>{{ v.clienteNombre }}</td>
                  <td>
                    <div class="acciones">
                      <a [routerLink]="[v.id, 'editar']" class="btn btn-sm">Editar</a>
                      <button class="btn btn-sm btn-peligro" (click)="eliminar(v)">Eliminar</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </section>
  `,
})
export class VehiculoLista {
  private readonly api = inject(VehiculoService);

  protected readonly vehiculos = signal<Vehiculo[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly clienteId = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal('');
  protected readonly mensaje = signal('');
  protected readonly exito = signal(false);

  constructor() {
    inject(ClienteService).listar().subscribe({
      next: lista => this.clientes.set(lista),
      error: (err: HttpErrorResponse) => this.avisar(mensajeError(err), false),
    });
    this.cargar();
  }

  filtrar(valor: string) {
    this.clienteId.set(valor ? +valor : null);
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.api.listar(this.clienteId()).subscribe({
      next: lista => { this.vehiculos.set(lista); this.cargando.set(false); },
      error: (err: HttpErrorResponse) => { this.errorCarga.set(mensajeError(err)); this.cargando.set(false); },
    });
  }

  eliminar(v: Vehiculo) {
    if (!confirm(`¿Eliminar el vehículo ${v.placa} de ${v.clienteNombre}?`)) return;
    this.api.eliminar(v.id).subscribe({
      next: () => {
        this.vehiculos.update(lista => lista.filter(x => x.id !== v.id));
        this.avisar(`Vehículo ${v.placa} eliminado.`, true);
      },
      // RN-02: un vehículo con órdenes registradas no se elimina (409).
      error: (err: HttpErrorResponse) => this.avisar(mensajeError(err), false),
    });
  }

  private avisar(texto: string, ok: boolean) {
    this.mensaje.set(texto);
    this.exito.set(ok);
  }
}
