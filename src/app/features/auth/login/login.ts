import { Component, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/http-error';

// Fuera del layout: no muestra header ni menú.
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <main class="fondo">
      <form class="card login" [formGroup]="form" (ngSubmit)="ingresar()">
        <p class="eyebrow">AutoAndes Web</p>
        <h2>Iniciar sesión</h2>
        <p class="sub">Órdenes de servicio del taller</p>

        @if (error()) { <div class="alerta">{{ error() }}</div> }

        <div class="campo">
          <label for="username">Usuario</label>
          <input id="username" class="input" formControlName="username" autocomplete="username" />
          @if (form.controls.username.invalid && form.controls.username.touched) { <span class="error">Ingrese el usuario.</span> }
        </div>
        <div class="campo">
          <label for="password">Contraseña</label>
          <div class="clave">
            <input id="password" [type]="verClave() ? 'text' : 'password'" class="input" formControlName="password" autocomplete="current-password" />
            <button type="button" class="ojo" (click)="verClave.set(!verClave())"
                    [attr.aria-label]="verClave() ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="verClave()">
              @if (verClave()) {
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /><path d="M3 3l18 18" /></svg>
              } @else {
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
              }
            </button>
          </div>
          @if (form.controls.password.invalid && form.controls.password.touched) { <span class="error">Ingrese la contraseña.</span> }
        </div>
        <button type="submit" class="btn btn-primary ancho" [disabled]="enviando()">{{ enviando() ? 'Ingresando...' : 'Ingresar' }}</button>
      </form>
    </main>
  `,
  styles: `
    .fondo { display: grid; min-height: 100vh; padding: 16px; place-items: center; background: linear-gradient(135deg, #1d3557, #2b4c7e); }
    .login { width: 100%; max-width: 380px; }
    .sub { margin: 4px 0 18px; color: var(--gris); }
    .ancho { width: 100%; padding: 10px; }
    .clave { position: relative; }
    .clave .input { padding-right: 42px; }
    .ojo { position: absolute; top: 50%; right: 6px; display: grid; width: 32px; height: 32px; place-items: center; padding: 0; border: 0; border-radius: 5px; color: var(--gris); background: transparent; cursor: pointer; transform: translateY(-50%); }
    .ojo:hover { color: var(--azul); background: var(--azul-claro); }
    .ojo svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // ?returnUrl= que dejan el authGuard o el interceptor de 401.
  readonly returnUrl = input<string>();

  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly verClave = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  ingresar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.enviando.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl() || '/inicio'),
      error: (err: HttpErrorResponse) => {
        // El backend devuelve el mismo 401 para usuario inexistente, clave errada o cuenta inactiva.
        this.error.set(mensajeError(err));
        this.enviando.set(false);
      },
    });
  }
}
