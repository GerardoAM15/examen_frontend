import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Servicio } from '../../core/models/servicio';
import { ServicioService } from '../../core/services/servicio.service';
import { SiPermiso } from '../../shared/directives/si-permiso';
import { mensajeError } from '../../core/utils/http-error';

@Component({
  selector: 'app-servicio-lista',
  imports: [SiPermiso, RouterLink, DecimalPipe],
  template: `
    <section class="page">
      <div class="page-header">
        <div><p class="eyebrow">Catálogo</p><h2>Servicios</h2></div>
        <a *siPermiso="'SERVICIO_ESCRIBIR'" routerLink="nuevo" class="btn btn-primary">+ Nuevo servicio</a>
      </div>

      @if (mensaje()) { <div class="alerta" [class.exito]="exito()">{{ mensaje() }}</div> }

      <div class="card">
        <div class="filtros">
          <div class="campo">
            <label for="buscar">Buscar por código o nombre</label>
            <input id="buscar" class="input" [value]="texto()" (input)="texto.set($any($event.target).value)" placeholder="SRV-001, aceite..." />
          </div>
        </div>

        @if (cargando()) {
          <p class="estado">Cargando servicios...</p>
        } @else if (errorCarga()) {
          <p class="estado error">{{ errorCarga() }} <button class="btn btn-sm" (click)="cargar()">Reintentar</button></p>
        } @else if (filtrados().length === 0) {
          <p class="estado">No hay servicios que coincidan con la búsqueda.</p>
        } @else {
          <table class="tabla">
            <thead><tr><th>Código</th><th>Nombre</th><th class="num">Precio</th><th class="num">Duración</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (s of filtrados(); track s.id) {
                <tr>
                  <td>{{ s.codigo }}</td>
                  <td>{{ s.nombre }}</td>
                  <td class="num">S/ {{ s.precio | number: '1.2-2' }}</td>
                  <td class="num">{{ s.duracionMin }} min</td>
                  <td><span class="badge" [class.apagado]="!s.activo">{{ s.activo ? 'Activo' : 'De baja' }}</span></td>
                  <td>
                    <div class="acciones" *siPermiso="'SERVICIO_ESCRIBIR'">
                      <a [routerLink]="[s.id, 'editar']" class="btn btn-sm">Editar</a>
                      <button class="btn btn-sm" (click)="cambiarEstado(s)">{{ s.activo ? 'Dar de baja' : 'Activar' }}</button>
                      <button class="btn btn-sm btn-peligro" (click)="eliminar(s)">Eliminar</button>
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
export class ServicioLista {
  private readonly api = inject(ServicioService);

  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal('');
  protected readonly mensaje = signal('');
  protected readonly exito = signal(false);
  protected readonly texto = signal('');

  protected readonly filtrados = computed(() => {
    const t = this.texto().trim().toLowerCase();
    return this.servicios().filter(s => !t || s.codigo.toLowerCase().includes(t) || s.nombre.toLowerCase().includes(t));
  });

  constructor() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.api.listar().subscribe({
      next: lista => { this.servicios.set(lista); this.cargando.set(false); },
      error: (err: HttpErrorResponse) => { this.errorCarga.set(mensajeError(err)); this.cargando.set(false); },
    });
  }

  cambiarEstado(s: Servicio) {
    const accion = s.activo ? 'dar de baja' : 'activar';
    if (!confirm(`¿Desea ${accion} el servicio ${s.codigo} - ${s.nombre}?`)) return;
    this.api.cambiarEstado(s.id, !s.activo).subscribe({
      next: actualizado => {
        this.servicios.update(lista => lista.map(x => (x.id === actualizado.id ? actualizado : x)));
        this.avisar(`Servicio ${actualizado.codigo} ${actualizado.activo ? 'activado' : 'dado de baja'}.`, true);
      },
      error: (err: HttpErrorResponse) => this.avisar(mensajeError(err), false),
    });
  }

  eliminar(s: Servicio) {
    if (!confirm(`¿Eliminar definitivamente el servicio ${s.codigo} - ${s.nombre}?`)) return;
    this.api.eliminar(s.id).subscribe({
      next: () => {
        this.servicios.update(lista => lista.filter(x => x.id !== s.id));
        this.avisar(`Servicio ${s.codigo} eliminado.`, true);
      },
      // RN-01: si el servicio ya se usó en una orden el backend responde 409 y se muestra su mensaje.
      error: (err: HttpErrorResponse) => this.avisar(mensajeError(err), false),
    });
  }

  private avisar(texto: string, ok: boolean) {
    this.mensaje.set(texto);
    this.exito.set(ok);
  }
}
