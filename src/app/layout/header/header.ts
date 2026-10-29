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
    .header { display: flex; align-items: center; gap: 16px; height: 62px; padding: 0 22px; color: #fff; background: var(--primario); border-bottom: 2px solid var(--acento); }
    .btn-menu { width: 36px; height: 36px; border: 1px solid rgb(255 255 255 / 18%); border-radius: 8px; color: #fff; background: transparent; font-size: 19px; cursor: pointer; }
    .btn-menu:hover { background: rgb(255 255 255 / 8%); }
    .marca { display: flex; align-items: center; gap: 10px; color: #fff; font-size: 19px; font-weight: 600; letter-spacing: .02em; text-decoration: none; }
    .marca-icono { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 7px; color: var(--primario); background: var(--acento); font-weight: 800; }
    .usuario { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .nombre { display: grid; text-align: right; font-size: 14px; }
    .nombre small { color: var(--acento); font-size: 11px; letter-spacing: .06em; }
    .btn-salir { padding: 6px 12px; border: 1px solid rgb(184 147 90 / 60%); border-radius: 6px; color: #fff; background: transparent; cursor: pointer; }
    .btn-salir:hover { color: var(--primario); background: var(--acento); }
    @media (max-width: 700px) { .nombre { display: none; } .header { padding: 0 12px; } }
  `,
})
export class Header {
  protected readonly auth = inject(AuthService);
  readonly alternarMenu = output<void>();
}
