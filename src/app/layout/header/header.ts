import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="header">
      <button type="button" class="btn-menu" aria-label="Mostrar u ocultar menú" (click)="alternarMenu.emit()">☰</button>
      <a routerLink="/inicio" class="marca"><span class="marca-icono">A</span>AutoAndes</a>
    </header>
  `,
  styles: `
    :host { display: block; }
    .header { display: flex; align-items: center; gap: 16px; height: 62px; padding: 0 22px; color: #fff; background: #1d3557; }
    .btn-menu { width: 36px; height: 36px; border: 1px solid rgb(255 255 255 / 25%); border-radius: 8px; color: #fff; background: transparent; font-size: 19px; cursor: pointer; }
    .marca { display: flex; align-items: center; gap: 8px; color: #fff; font-size: 19px; font-weight: 700; text-decoration: none; }
    .marca-icono { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 7px; background: #e76f24; }
  `,
})
export class Header {
  readonly alternarMenu = output<void>();
}
