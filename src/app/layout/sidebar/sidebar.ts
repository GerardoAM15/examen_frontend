import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU } from '../../core/config/menu';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar" aria-label="Módulos">
      <p class="titulo">Módulos</p>
      @for (item of menu; track item.ruta) {
        <a [routerLink]="item.ruta" routerLinkActive="activo"><span aria-hidden="true">{{ item.icono }}</span> {{ item.etiqueta }}</a>
      }
    </nav>
  `,
  styles: `
    :host { display: block; }
    .sidebar { height: 100%; min-width: 230px; padding: 16px 12px; background: #fff; border-right: 1px solid #d5dde6; }
    .titulo { margin: 0 8px 10px; color: #64748b; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    a { display: block; margin-bottom: 2px; padding: 9px 12px; border-radius: 6px; color: #1f2933; text-decoration: none; }
    a:hover { background: #e8eef6; }
    a.activo { color: #fff; background: #1d3557; }
  `,
})
export class Sidebar {
  protected readonly menu = MENU;
}
