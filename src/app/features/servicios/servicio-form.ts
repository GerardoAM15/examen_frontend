import { Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServicioRequest } from '../../core/models/servicio';
import { ServicioService } from '../../core/services/servicio.service';
import { camposError, mensajeError } from '../../core/utils/http-error';

// Un solo formulario para /servicios/nuevo y /servicios/:id/editar.
@Component({
  selector: 'app-servicio-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page" style="max-width: 720px">
      <div class="page-header">
        <div><p class="eyebrow">Catálogo</p><h2>{{ id() ? 'Editar servicio' : 'Nuevo servicio' }}</h2></div>
      </div>

      @if (mensaje()) { <div class="alerta">{{ mensaje() }}</div> }

      <form class="card" [formGroup]="form" (ngSubmit)="guardar()">
        <div class="grid-2">
          <div class="campo">
            <label for="codigo">Código</label>
            <input id="codigo" class="input" formControlName="codigo" placeholder="SRV-000" />
            @if (ver('codigo')) { <span class="error">El código es obligatorio y debe tener el formato SRV-000.</span> }
            @if (campos()['codigo']) { <span class="error">{{ campos()['codigo'] }}</span> }
          </div>
          <div class="campo">
            <label for="nombre">Nombre</label>
            <input id="nombre" class="input" formControlName="nombre" />
            @if (ver('nombre')) { <span class="error">El nombre debe tener entre 3 y 80 caracteres.</span> }
            @if (campos()['nombre']) { <span class="error">{{ campos()['nombre'] }}</span> }
          </div>
          <div class="campo">
            <label for="precio">Precio (S/)</label>
            <input id="precio" type="number" step="0.01" class="input" formControlName="precio" />
            @if (ver('precio')) { <span class="error">El precio debe ser mayor que cero.</span> }
            @if (campos()['precio']) { <span class="error">{{ campos()['precio'] }}</span> }
          </div>
          <div class="campo">
            <label for="duracionMin">Duración (minutos)</label>
            <input id="duracionMin" type="number" class="input" formControlName="duracionMin" />
            @if (ver('duracionMin')) { <span class="error">La duración debe estar entre 15 y 480 minutos.</span> }
            @if (campos()['duracionMin']) { <span class="error">{{ campos()['duracionMin'] }}</span> }
          </div>
        </div>
        <label class="check"><input type="checkbox" formControlName="activo" /> Activo</label>

        <div class="acciones-form">
          <a routerLink="/servicios" class="btn">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="enviando()">{{ enviando() ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </form>
    </section>
  `,
})
export class ServicioForm implements OnInit {
  private readonly api = inject(ServicioService);
  private readonly router = inject(Router);

  // Parámetro :id de la ruta (withComponentInputBinding); vacío al registrar.
  readonly id = input<string>();

  protected readonly enviando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly campos = signal<Record<string, string>>({});

  protected readonly form = inject(FormBuilder).nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-\d{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    duracionMin: [30, [Validators.required, Validators.min(15), Validators.max(480)]],
    activo: [true],
  });

  ngOnInit() {
    const id = this.id();
    if (!id) return;
    this.api.buscar(+id).subscribe({
      next: s => this.form.patchValue(s),
      error: (err: HttpErrorResponse) => this.mensaje.set(mensajeError(err)),
    });
  }

  protected ver(control: keyof typeof this.form.controls) {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.enviando.set(true);
    this.mensaje.set('');
    this.campos.set({});
    const datos: ServicioRequest = this.form.getRawValue();
    const id = this.id();
    const peticion = id ? this.api.actualizar(+id, datos) : this.api.crear(datos);
    peticion.subscribe({
      next: () => this.router.navigate(['/servicios']),
      error: (err: HttpErrorResponse) => {
        // 400: mensajes por campo bajo cada control; 404/409: mensaje general del backend.
        this.campos.set(camposError(err));
        this.mensaje.set(mensajeError(err));
        this.enviando.set(false);
      },
    });
  }
}
