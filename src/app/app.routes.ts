import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';

export const routes: Routes = [
  { path: 'login', title: 'Iniciar sesión', canActivate: [invitadoGuard], loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', title: 'Inicio', loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio) },
      { path: 'servicios', loadChildren: () => import('./features/servicios/servicios.routes').then(m => m.SERVICIOS_ROUTES) },
      { path: 'vehiculos', loadChildren: () => import('./features/vehiculos/vehiculos.routes').then(m => m.VEHICULOS_ROUTES) },
      { path: 'acceso-denegado', title: 'Acceso denegado', loadComponent: () => import('./shared/pages/acceso-denegado/acceso-denegado').then(m => m.AccesoDenegado) },
    ],
  },
  { path: '**', title: 'Página no encontrada', loadComponent: () => import('./shared/pages/no-encontrado/no-encontrado').then(m => m.NoEncontrado) },
];
