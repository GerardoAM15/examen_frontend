import { Routes } from '@angular/router';

export const VEHICULOS_ROUTES: Routes = [
  { path: '', title: 'Vehículos', loadComponent: () => import('./vehiculo-lista').then(m => m.VehiculoLista) },
  { path: 'nuevo', title: 'Nuevo vehículo', loadComponent: () => import('./vehiculo-form').then(m => m.VehiculoForm) },
  { path: ':id/editar', title: 'Editar vehículo', loadComponent: () => import('./vehiculo-form').then(m => m.VehiculoForm) },
];
