import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar],
  template: `
    <div class="shell" [class.colapsado]="menuColapsado()">
      <app-header class="area-header" (alternarMenu)="menuColapsado.set(!menuColapsado())" />
      <app-sidebar class="area-sidebar" />
      <main class="area-main"><router-outlet /></main>
    </div>
  `,
  styles: `
    .shell {
      display: grid;
      grid-template-columns: 230px 1fr;
      grid-template-rows: 62px 1fr;
      grid-template-areas: 'header header' 'sidebar main';
      min-height: 100vh;
    }
    .shell.colapsado { grid-template-columns: 0 1fr; }
    .area-header { grid-area: header; }
    .area-sidebar { grid-area: sidebar; overflow: hidden; }
    .area-main { grid-area: main; min-width: 0; padding: 26px; }
    @media (max-width: 700px) { .area-main { padding: 16px; } }
  `,
})
export class MainLayout {
  protected readonly menuColapsado = signal(false);
}
