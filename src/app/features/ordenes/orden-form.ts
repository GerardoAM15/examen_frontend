import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdenRequest } from '../../core/models/orden';
import { Servicio } from '../../core/models/servicio';
import { Vehiculo } from '../../core/models/vehiculo';
import { OrdenService } from '../../core/services/orden.service';
import { ServicioService } from '../../core/services/servicio.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { camposError, mensajeError } from '../../core/utils/http-error';

// RN-03 en la SPA (solo ayuda visual; el backend la vuelve a verificar): sin servicios repetidos.
function sinRepetidos(control: AbstractControl): ValidationErrors | null {
  const ids = (control as FormArray).controls.map(l => l.get('servicioId')?.value).filter(id => id != null);
  return new Set(ids).size !== ids.length ? { repetido: true } : null;
}

@Component({
  selector: 'app-orden-form',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  template: `
    <section class="page" style="max-width: 920px">
      <div class="page-header">
        <div><p class="eyebrow">Mostrador</p><h2>Nueva orden de servicio</h2></div>
        <a routerLink="/ordenes" class="btn">Ver órdenes</a>
      </div>

      @if (exito()) { <div class="alerta exito">{{ exito() }}</div> }
      @if (mensaje()) {
        <div class="alerta">
          {{ mensaje() }}
          @for (c of camposLista(); track c[0]) { <div><small>{{ c[0] }}: {{ c[1] }}</small></div> }
        </div>
      }

      <form class="card" [formGroup]="form" (ngSubmit)="registrar()">
        <div class="grid-2">
          <div class="campo">
            <label for="vehiculoId">Vehículo</label>
            <select id="vehiculoId" class="input" formControlName="vehiculoId">
              <option [ngValue]="null" disabled>Seleccione un vehículo</option>
              @for (v of vehiculos(); track v.id) { <option [ngValue]="v.id">{{ v.placa }} · {{ v.clienteNombre }}</option> }
            </select>
            @if (form.controls.vehiculoId.invalid && form.controls.vehiculoId.touched) { <span class="error">Seleccione el vehículo.</span> }
          </div>
          <div class="campo">
            <label for="kilometraje">Kilometraje</label>
            <input id="kilometraje" type="number" class="input" formControlName="kilometraje" />
            @if (form.controls.kilometraje.invalid && form.controls.kilometraje.touched) { <span class="error">Ingrese un kilometraje válido (0 o más).</span> }
            @if (campos()['kilometraje']) { <span class="error">{{ campos()['kilometraje'] }}</span> }
          </div>
        </div>

        <h3>Detalle</h3>
        <table class="tabla">
          <thead><tr><th>Servicio</th><th style="width: 110px">Cantidad</th><th class="num">Precio</th><th class="num">Subtotal</th><th></th></tr></thead>
          <tbody formArrayName="detalles">
            @for (linea of detalles.controls; track linea; let i = $index) {
              <tr [formGroupName]="i">
                <td>
                  <select class="input" formControlName="servicioId">
                    <option [ngValue]="null" disabled>Seleccione un servicio</option>
                    @for (s of servicios(); track s.id) {
                      <option [ngValue]="s.id" [disabled]="usadoEnOtraLinea(s.id, i)">{{ s.codigo }} · {{ s.nombre }}</option>
                    }
                  </select>
                </td>
                <td>
                  <input type="number" min="1" max="5" class="input" formControlName="cantidad" />
                  @if (linea.get('cantidad')?.invalid) { <span class="error">De 1 a 5</span> }
                </td>
                <td class="num">S/ {{ lineas()[i]?.precio ?? 0 | number: '1.2-2' }}</td>
                <td class="num">S/ {{ lineas()[i]?.subtotal ?? 0 | number: '1.2-2' }}</td>
                <td><button type="button" class="btn btn-sm btn-peligro" (click)="quitarLinea(i)" [disabled]="detalles.length === 1">Quitar</button></td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr><td colspan="3" class="num"><strong>Total estimado</strong></td><td class="num"><strong>S/ {{ total() | number: '1.2-2' }}</strong></td><td></td></tr>
          </tfoot>
        </table>
        @if (detalles.hasError('repetido')) { <p class="error">No repita el mismo servicio en dos líneas.</p> }
        <p style="color: var(--gris); font-size: 13px">El total es referencial: el backend toma los precios de la base de datos y calcula el total definitivo.</p>

        <div class="acciones-form">
          <button type="button" class="btn" (click)="agregarLinea()" [disabled]="detalles.length >= 10">+ Agregar línea</button>
          <button type="submit" class="btn btn-primary" [disabled]="enviando()">{{ enviando() ? 'Registrando...' : 'Registrar orden' }}</button>
        </div>
      </form>
    </section>
  `,
})
export class OrdenForm {
  private readonly api = inject(OrdenService);
  private readonly fb = inject(FormBuilder);

  protected readonly vehiculos = signal<Vehiculo[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly enviando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly exito = signal('');
  protected readonly campos = signal<Record<string, string>>({});
  protected readonly camposLista = computed(() => Object.entries(this.campos()));

  protected readonly form = this.fb.group({
    vehiculoId: [null as number | null, Validators.required],
    kilometraje: [null as number | null, [Validators.required, Validators.min(0), Validators.max(9999999)]],
    detalles: this.fb.array([this.nuevaLinea()], { validators: [Validators.minLength(1), Validators.maxLength(10), sinRepetidos] }),
  });

  // Los valores del formulario como signal: subtotales y total se recalculan al instante.
  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly lineas = computed(() => {
    const precios = new Map(this.servicios().map(s => [s.id, Number(s.precio)]));
    return (this.valores().detalles ?? []).map(d => {
      const precio = precios.get(d?.servicioId ?? -1) ?? 0;
      return { precio, subtotal: precio * (d?.cantidad ?? 0) };
    });
  });
  protected readonly total = computed(() => this.lineas().reduce((suma, l) => suma + l.subtotal, 0));

  constructor() {
    inject(VehiculoService).listar().subscribe({
      next: lista => this.vehiculos.set(lista),
      error: (err: HttpErrorResponse) => this.mensaje.set(mensajeError(err)),
    });
    // Solo se ofrecen servicios activos; si alguno se da de baja entre tanto, el backend responde 409.
    inject(ServicioService).listar().subscribe({
      next: lista => this.servicios.set(lista.filter(s => s.activo)),
      error: (err: HttpErrorResponse) => this.mensaje.set(mensajeError(err)),
    });
  }

  get detalles() { return this.form.controls.detalles; }

  private nuevaLinea() {
    return this.fb.group({
      servicioId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }

  agregarLinea() { this.detalles.push(this.nuevaLinea()); }
  quitarLinea(i: number) { this.detalles.removeAt(i); }

  protected usadoEnOtraLinea(servicioId: number, indice: number) {
    return this.detalles.controls.some((l, i) => i !== indice && l.value.servicioId === servicioId);
  }

  registrar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.enviando.set(true);
    this.mensaje.set('');
    this.exito.set('');
    this.campos.set({});
    const v = this.form.getRawValue();
    // Solo se envía servicioId y cantidad; precio, subtotal y total los calcula el backend.
    const datos: OrdenRequest = {
      vehiculoId: v.vehiculoId!,
      kilometraje: v.kilometraje!,
      detalles: v.detalles.map(d => ({ servicioId: d.servicioId!, cantidad: d.cantidad! })),
    };
    this.api.registrar(datos).subscribe({
      next: orden => {
        this.exito.set(`Orden ${orden.numero} registrada. Total: S/ ${Number(orden.total).toFixed(2)}`);
        this.detalles.clear();
        this.detalles.push(this.nuevaLinea());
        this.form.reset();
        this.enviando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // Las líneas no se tocan: el usuario corrige y reintenta (p. ej. 409 de kilometraje, RN-04).
        this.mensaje.set(mensajeError(err));
        this.campos.set(camposError(err));
        this.enviando.set(false);
      },
    });
  }
}
