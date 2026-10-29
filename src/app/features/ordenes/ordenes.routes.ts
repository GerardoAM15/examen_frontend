import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso.guard';

export const ORDENES_ROUTES: Routes = [
  { path: '', title: 'Órdenes de servicio', canActivate: [permisoGuard], data: { permiso: 'ORDEN_LEER' }, loadComponent: () => import('./orden-lista').then(m => m.OrdenLista) },
  // 'nueva' va antes de ':id' para que no se interprete como un identificador.
  { path: 'nueva', title: 'Nueva orden', canActivate: [permisoGuard], data: { permiso: 'ORDEN_REGISTRAR' }, loadComponent: () => import('./orden-form').then(m => m.OrdenForm) },
  { path: ':id', title: 'Detalle de orden', canActivate: [permisoGuard], data: { permiso: 'ORDEN_LEER' }, loadComponent: () => import('./orden-detalle').then(m => m.OrdenDetalle) },
];
