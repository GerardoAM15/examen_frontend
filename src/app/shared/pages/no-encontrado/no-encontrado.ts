import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: `
    <section class="page card" style="max-width: 560px; margin-top: 60px">
      <p class="eyebrow">AutoAndes Web</p>
      <h2>404 · Página no encontrada</h2>
      <p>La dirección solicitada no existe.</p>
      <a routerLink="/inicio" class="btn btn-primary">Volver al inicio</a>
    </section>
  `,
})
export class NoEncontrado {}
