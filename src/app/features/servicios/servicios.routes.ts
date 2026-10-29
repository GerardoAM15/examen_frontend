import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso.guard';

export const SERVICIOS_ROUTES: Routes = [
  { path: '', title: 'Servicios', canActivate: [permisoGuard], data: { permiso: 'SERVICIO_LEER' }, loadComponent: () => import('./servicio-lista').then(m => m.ServicioLista) },
  { path: 'nuevo', title: 'Nuevo servicio', canActivate: [permisoGuard], data: { permiso: 'SERVICIO_ESCRIBIR' }, loadComponent: () => import('./servicio-form').then(m => m.ServicioForm) },
  { path: ':id/editar', title: 'Editar servicio', canActivate: [permisoGuard], data: { permiso: 'SERVICIO_ESCRIBIR' }, loadComponent: () => import('./servicio-form').then(m => m.ServicioForm) },
];
