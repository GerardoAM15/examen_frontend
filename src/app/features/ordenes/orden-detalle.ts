import { Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Orden } from '../../core/models/orden';
import { OrdenService } from '../../core/services/orden.service';
import { camposError, mensajeError } from '../../core/utils/http-error';
import { SiPermiso } from '../../shared/directives/si-permiso';

@Component({
  selector: 'app-orden-detalle',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe, SiPermiso],
  template: `
    <section class="page" style="max-width: 920px">
      <div class="page-header">
        <div><p class="eyebrow">Taller</p><h2>Orden {{ orden()?.numero }}</h2></div>
        <a routerLink="/ordenes" class="btn">Volver</a>
      </div>

      @if (exito()) { <div class="alerta exito">{{ exito() }}</div> }
      @if (mensaje()) { <div class="alerta">{{ mensaje() }}</div> }

      @if (orden(); as o) {
        <div class="card">
          <div class="grid-2">
            <p><strong>Fecha:</strong> {{ o.fecha | date: 'dd/MM/yyyy HH:mm' }}</p>
            <p><strong>Estado:</strong> <span class="badge" [class.anulada]="o.estado === 'ANULADA'">{{ o.estado }}</span></p>
            <p><strong>Vehículo:</strong> {{ o.placa }}</p>
            <p><strong>Cliente:</strong> {{ o.clienteNombre }}</p>
            <p><strong>Kilometraje:</strong> {{ o.kilometraje | number }}</p>
            <p><strong>Registrada por:</strong> {{ o.usuarioRegistro }}</p>
          </div>
          @if (o.motivoAnulacion) { <p><strong>Motivo de anulación:</strong> {{ o.motivoAnulacion }}</p> }

          <table class="tabla">
            <thead><tr><th>Código</th><th>Servicio</th><th class="num">Cantidad</th><th class="num">Precio unitario</th><th class="num">Subtotal</th></tr></thead>
            <tbody>
              @for (d of o.detalles; track d.id) {
                <tr>
                  <td>{{ d.codigo }}</td>
                  <td>{{ d.servicio }}</td>
                  <td class="num">{{ d.cantidad }}</td>
                  <td class="num">S/ {{ d.precioUnitario | number: '1.2-2' }}</td>
                  <td class="num">S/ {{ d.subtotal | number: '1.2-2' }}</td>
                </tr>
              }
            </tbody>
            <tfoot><tr><td colspan="4" class="num"><strong>Total</strong></td><td class="num"><strong>S/ {{ o.total | number: '1.2-2' }}</strong></td></tr></tfoot>
          </table>
        </div>

        @if (o.estado === 'REGISTRADA') {
          <div class="card" style="margin-top: 16px" *siPermiso="'ORDEN_ANULAR'">
            <h3 style="margin-top: 0">Anular orden</h3>
            <div class="campo">
              <label for="motivo">Motivo (10 a 200 caracteres)</label>
              <textarea id="motivo" class="input" rows="3" [formControl]="motivo"></textarea>
              @if (motivo.invalid && motivo.touched) { <span class="error">El motivo debe tener entre 10 y 200 caracteres.</span> }
              @if (campos()['motivo']) { <span class="error">{{ campos()['motivo'] }}</span> }
            </div>
            <div class="acciones-form">
              <button type="button" class="btn btn-peligro" (click)="anular(o)" [disabled]="enviando()">{{ enviando() ? 'Anulando...' : 'Anular' }}</button>
            </div>
          </div>
        }
      } @else if (!mensaje()) {
        <p class="estado">Cargando orden...</p>
      }
    </section>
  `,
})
export class OrdenDetalle implements OnInit {
  private readonly api = inject(OrdenService);

  readonly id = input.required<string>();

  protected readonly orden = signal<Orden | null>(null);
  protected readonly enviando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly exito = signal('');
  protected readonly campos = signal<Record<string, string>>({});
  protected readonly motivo = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(200)] });

  ngOnInit() {
    this.api.buscar(+this.id()).subscribe({
      next: o => this.orden.set(o),
      error: (err: HttpErrorResponse) => this.mensaje.set(mensajeError(err)),
    });
  }

  anular(o: Orden) {
    if (this.motivo.invalid) { this.motivo.markAsTouched(); return; }
    if (!confirm(`¿Anular la orden ${o.numero}? Esta acción no se puede deshacer.`)) return;
    this.enviando.set(true);
    this.mensaje.set('');
    this.campos.set({});
    this.api.anular(o.id, this.motivo.value.trim()).subscribe({
      next: anulada => {
        this.orden.set(anulada);
        this.exito.set(`Orden ${anulada.numero} anulada.`);
        this.enviando.set(false);
      },
      // RN-05: 409 si no es del mismo día o ya está anulada; 403 si el usuario no tiene ORDEN_ANULAR.
      error: (err: HttpErrorResponse) => {
        this.mensaje.set(mensajeError(err));
        this.campos.set(camposError(err));
        this.enviando.set(false);
      },
    });
  }
}
