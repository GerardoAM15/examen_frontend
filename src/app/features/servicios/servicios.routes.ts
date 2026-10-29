import { Routes } from '@angular/router';

export const SERVICIOS_ROUTES: Routes = [
  { path: '', title: 'Servicios', loadComponent: () => import('./servicio-lista').then(m => m.ServicioLista) },
  { path: 'nuevo', title: 'Nuevo servicio', loadComponent: () => import('./servicio-form').then(m => m.ServicioForm) },
  { path: ':id/editar', title: 'Editar servicio', loadComponent: () => import('./servicio-form').then(m => m.ServicioForm) },
];
