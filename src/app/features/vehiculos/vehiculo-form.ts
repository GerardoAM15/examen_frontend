import { Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cliente } from '../../core/models/cliente';
import { VehiculoRequest } from '../../core/models/vehiculo';
import { ClienteService } from '../../core/services/cliente.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { camposError, mensajeError } from '../../core/utils/http-error';

// Un solo formulario para /vehiculos/nuevo y /vehiculos/:id/editar.
@Component({
  selector: 'app-vehiculo-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page" style="max-width: 720px">
      <div class="page-header">
        <div><p class="eyebrow">Clientes</p><h2>{{ id() ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2></div>
      </div>

      @if (mensaje()) { <div class="alerta">{{ mensaje() }}</div> }

      <form class="card" [formGroup]="form" (ngSubmit)="guardar()">
        <div class="campo">
          <label for="clienteId">Cliente</label>
          <select id="clienteId" class="input" formControlName="clienteId">
            <option [ngValue]="null" disabled>Seleccione un cliente</option>
            @for (c of clientes(); track c.id) { <option [ngValue]="c.id">{{ c.nombres }} · {{ c.documento }}</option> }
          </select>
          @if (ver('clienteId')) { <span class="error">Seleccione el cliente propietario.</span> }
          @if (campos()['clienteId']) { <span class="error">{{ campos()['clienteId'] }}</span> }
        </div>
        <div class="grid-2">
          <div class="campo">
            <label for="placa">Placa</label>
            <input id="placa" class="input" formControlName="placa" placeholder="ABC-123" (input)="mayusculas()" />
            @if (ver('placa')) { <span class="error">La placa debe tener el formato ABC-123.</span> }
            @if (campos()['placa']) { <span class="error">{{ campos()['placa'] }}</span> }
          </div>
          <div class="campo">
            <label for="anio">Año</label>
            <input id="anio" type="number" class="input" formControlName="anio" />
            @if (ver('anio')) { <span class="error">El año debe estar entre 1990 y 2027.</span> }
            @if (campos()['anio']) { <span class="error">{{ campos()['anio'] }}</span> }
          </div>
          <div class="campo">
            <label for="marca">Marca</label>
            <input id="marca" class="input" formControlName="marca" />
            @if (ver('marca')) { <span class="error">La marca es obligatoria (máximo 40 caracteres).</span> }
            @if (campos()['marca']) { <span class="error">{{ campos()['marca'] }}</span> }
          </div>
          <div class="campo">
            <label for="modelo">Modelo</label>
            <input id="modelo" class="input" formControlName="modelo" />
            @if (ver('modelo')) { <span class="error">El modelo es obligatorio (máximo 40 caracteres).</span> }
            @if (campos()['modelo']) { <span class="error">{{ campos()['modelo'] }}</span> }
          </div>
        </div>

        <div class="acciones-form">
          <a routerLink="/vehiculos" class="btn">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="enviando()">{{ enviando() ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </form>
    </section>
  `,
})
export class VehiculoForm implements OnInit {
  private readonly api = inject(VehiculoService);
  private readonly clienteApi = inject(ClienteService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly enviando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly campos = signal<Record<string, string>>({});

  // Mismas reglas que VehiculoRequestDTO del backend; el backend vuelve a validarlas.
  protected readonly form = inject(FormBuilder).group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: [null as number | null, Validators.required],
  });

  ngOnInit() {
    this.clienteApi.listar().subscribe({
      next: lista => this.clientes.set(lista),
      error: (err: HttpErrorResponse) => this.mensaje.set(mensajeError(err)),
    });
    const id = this.id();
    if (!id) return;
    this.api.buscar(+id).subscribe({
      next: v => this.form.patchValue(v),
      error: (err: HttpErrorResponse) => this.mensaje.set(mensajeError(err)),
    });
  }

  protected ver(control: keyof typeof this.form.controls) {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  protected mayusculas() {
    const placa = this.form.controls.placa;
    placa.setValue((placa.value ?? '').toUpperCase(), { emitEvent: false });
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.enviando.set(true);
    this.mensaje.set('');
    this.campos.set({});
    const datos = this.form.getRawValue() as VehiculoRequest;
    const id = this.id();
    const peticion = id ? this.api.actualizar(+id, datos) : this.api.crear(datos);
    peticion.subscribe({
      next: () => this.router.navigate(['/vehiculos']),
      error: (err: HttpErrorResponse) => {
        // 400 por campo; 409 placa repetida y 404 cliente inexistente como mensaje general.
        this.campos.set(camposError(err));
        this.mensaje.set(mensajeError(err));
        this.enviando.set(false);
      },
    });
  }
}
