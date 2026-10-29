import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `
    <section class="page card" style="max-width: 560px; margin-top: 40px">
      <p class="eyebrow">AutoAndes Web</p>
      <h2>Acceso denegado</h2>
      <p>Su usuario no tiene permiso para esta opción. Su sesión sigue activa.</p>
      <a routerLink="/inicio" class="btn btn-primary">Volver al inicio</a>
    </section>
  `,
})
export class AccesoDenegado {}
