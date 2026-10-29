import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso.guard';

export const VEHICULOS_ROUTES: Routes = [
  { path: '', title: 'Vehículos', canActivate: [permisoGuard], data: { permiso: 'VEHICULO_LEER' }, loadComponent: () => import('./vehiculo-lista').then(m => m.VehiculoLista) },
  { path: 'nuevo', title: 'Nuevo vehículo', canActivate: [permisoGuard], data: { permiso: 'VEHICULO_ESCRIBIR' }, loadComponent: () => import('./vehiculo-form').then(m => m.VehiculoForm) },
  { path: ':id/editar', title: 'Editar vehículo', canActivate: [permisoGuard], data: { permiso: 'VEHICULO_ESCRIBIR' }, loadComponent: () => import('./vehiculo-form').then(m => m.VehiculoForm) },
];
