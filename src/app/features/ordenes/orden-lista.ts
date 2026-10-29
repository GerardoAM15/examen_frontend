import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstadoOrden, Orden } from '../../core/models/orden';
import { OrdenService } from '../../core/services/orden.service';
import { mensajeError } from '../../core/utils/http-error';
import { SiPermiso } from '../../shared/directives/si-permiso';

@Component({
  selector: 'app-orden-lista',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe, SiPermiso],
  template: `
    <section class="page">
      <div class="page-header">
        <div><p class="eyebrow">Taller</p><h2>Órdenes de servicio</h2></div>
        <a *siPermiso="'ORDEN_REGISTRAR'" routerLink="nueva" class="btn btn-primary">+ Nueva orden</a>
      </div>

      <div class="card">
        <form class="filtros" [formGroup]="filtros" (ngSubmit)="buscar()">
          <div class="campo"><label for="placa">Placa</label><input id="placa" class="input" formControlName="placa" placeholder="AAA-111" /></div>
          <div class="campo">
            <label for="estado">Estado</label>
            <select id="estado" class="input" formControlName="estado">
              <option value="">Todos</option>
              <option value="REGISTRADA">Registrada</option>
              <option value="ANULADA">Anulada</option>
            </select>
          </div>
          <div class="campo"><label for="desde">Desde</label><input id="desde" type="date" class="input" formControlName="desde" /></div>
          <div class="campo"><label for="hasta">Hasta</label><input id="hasta" type="date" class="input" formControlName="hasta" /></div>
          <button type="submit" class="btn btn-primary">Buscar</button>
          <button type="button" class="btn" (click)="limpiar()">Limpiar</button>
        </form>

        @if (cargando()) {
          <p class="estado">Cargando órdenes...</p>
        } @else if (error()) {
          <p class="estado error">{{ error() }}</p>
        } @else if (ordenes().length === 0) {
          <p class="estado">No hay órdenes para los filtros indicados.</p>
        } @else {
          <table class="tabla">
            <thead><tr><th>Número</th><th>Fecha</th><th>Placa</th><th>Cliente</th><th class="num">Km</th><th>Estado</th><th class="num">Total</th><th></th></tr></thead>
            <tbody>
              @for (o of ordenes(); track o.id) {
                <tr>
                  <td><strong>{{ o.numero }}</strong></td>
                  <td>{{ o.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ o.placa }}</td>
                  <td>{{ o.clienteNombre }}</td>
                  <td class="num">{{ o.kilometraje | number }}</td>
                  <td><span class="badge" [class.anulada]="o.estado === 'ANULADA'">{{ o.estado }}</span></td>
                  <td class="num">S/ {{ o.total | number: '1.2-2' }}</td>
                  <td><a [routerLink]="[o.id]" class="btn btn-sm">Ver detalle</a></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </section>
  `,
})
export class OrdenLista {
  private readonly api = inject(OrdenService);

  protected readonly ordenes = signal<Orden[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly filtros = inject(FormBuilder).nonNullable.group({
    placa: [''],
    estado: ['' as EstadoOrden | ''],
    desde: [''],
    hasta: [''],
  });

  constructor() { this.buscar(); }

  buscar() {
    this.cargando.set(true);
    this.error.set('');
    this.api.listar(this.filtros.getRawValue()).subscribe({
      next: lista => { this.ordenes.set(lista); this.cargando.set(false); },
      error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }

  limpiar() {
    this.filtros.reset();
    this.buscar();
  }
}
