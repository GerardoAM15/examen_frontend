import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="header">
      <button type="button" class="btn-menu" aria-label="Mostrar u ocultar menú" (click)="alternarMenu.emit()">☰</button>
      <a routerLink="/inicio" class="marca"><span class="marca-icono">A</span>AutoAndes</a>
      @if (auth.usuario(); as u) {
        <div class="usuario">
          <span class="nombre">{{ u.nombreCompleto }} <small>{{ u.roles.join(', ') }}</small></span>
          <button type="button" class="btn-salir" (click)="auth.cerrarSesion()">Cerrar sesión</button>
        </div>
      }
    </header>
  `,
  styles: `
    :host { display: block; }
    .header { display: flex; align-items: center; gap: 16px; height: 62px; padding: 0 22px; color: #fff; background: #1d3557; }
    .btn-menu { width: 36px; height: 36px; border: 1px solid rgb(255 255 255 / 25%); border-radius: 8px; color: #fff; background: transparent; font-size: 19px; cursor: pointer; }
    .marca { display: flex; align-items: center; gap: 8px; color: #fff; font-size: 19px; font-weight: 700; text-decoration: none; }
    .marca-icono { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 7px; background: #e76f24; }
    .usuario { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .nombre { display: grid; text-align: right; font-size: 14px; }
    .nombre small { color: #c9d6e6; font-size: 11px; }
    .btn-salir { padding: 6px 12px; border: 1px solid rgb(255 255 255 / 35%); border-radius: 5px; color: #fff; background: transparent; cursor: pointer; }
    @media (max-width: 700px) { .nombre { display: none; } .header { padding: 0 12px; } }
  `,
})
export class Header {
  protected readonly auth = inject(AuthService);
  readonly alternarMenu = output<void>();
}
