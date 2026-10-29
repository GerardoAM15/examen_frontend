import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IngresoPorServicio } from '../../core/models/reporte';
import { ReporteService } from '../../core/services/reporte.service';
import { mensajeError } from '../../core/utils/http-error';

// Los importes vienen agregados por el backend (JPQL con GROUP BY, sin órdenes ANULADAS).
@Component({
  selector: 'app-reporte-ingresos',
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <section class="page">
      <div class="page-header">
        <div><p class="eyebrow">Gerencia</p><h2>Ingresos por servicio</h2></div>
      </div>

      <div class="card">
        <form class="filtros" [formGroup]="filtros" (ngSubmit)="consultar()">
          <div class="campo"><label for="desde">Desde</label><input id="desde" type="date" class="input" formControlName="desde" /></div>
          <div class="campo"><label for="hasta">Hasta</label><input id="hasta" type="date" class="input" formControlName="hasta" /></div>
          <button type="submit" class="btn btn-primary">Consultar</button>
        </form>

        @if (cargando()) {
          <p class="estado">Cargando reporte...</p>
        } @else if (error()) {
          <p class="estado error">{{ error() }}</p>
        } @else if (filas().length === 0) {
          <p class="estado">No hay ingresos en el periodo indicado.</p>
        } @else {
          <table class="tabla">
            <thead><tr><th>Código</th><th>Servicio</th><th class="num">Cantidad total</th><th class="num">Importe total</th></tr></thead>
            <tbody>
              @for (f of filas(); track f.codigo) {
                <tr>
                  <td>{{ f.codigo }}</td>
                  <td>{{ f.servicio }}</td>
                  <td class="num">{{ f.cantidadTotal }}</td>
                  <td class="num">S/ {{ f.importeTotal | number: '1.2-2' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </section>
  `,
})
export class ReporteIngresos {
  private readonly api = inject(ReporteService);

  protected readonly filas = signal<IngresoPorServicio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly filtros = inject(FormBuilder).nonNullable.group({ desde: [''], hasta: [''] });

  constructor() { this.consultar(); }

  consultar() {
    const { desde, hasta } = this.filtros.getRawValue();
    this.cargando.set(true);
    this.error.set('');
    this.api.ingresosPorServicio(desde, hasta).subscribe({
      next: filas => { this.filas.set(filas); this.cargando.set(false); },
      error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }
}
