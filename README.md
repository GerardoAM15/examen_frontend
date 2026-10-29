# AutoAndes Web

SPA en Angular 22 (componentes standalone) para las órdenes de servicio del taller AutoAndes. Consume AutoAndes API (`autoandes-backend`).

## Ejecución

1. Levantar el backend (`autoandes-backend`); en el perfil `dev` escucha en `http://localhost:8081`.
2. Instalar dependencias y levantar la SPA:

```bash
npm install
ng serve
```

3. Abrir `http://localhost:4200`.

La URL de la API se configura en `src/environments/environment.ts` (`apiUrl`).

## Usuarios de prueba

| Usuario  | Contraseña | Rol         | Estado   |
|----------|------------|-------------|----------|
| admin    | Auto2026*  | ADMIN       | Activo   |
| asesor   | Auto2026*  | ASESOR      | Activo   |
| jefe     | Auto2026*  | JEFE_TALLER | Activo   |
| inactivo | Auto2026*  | ASESOR      | Inactivo |

## Estructura

```
src/app/
├── core/       auth/ (modelos y AuthService con signals), guards/, interceptors/,
│               config/menu.ts, models/, services/ (un servicio HTTP por recurso), utils/
├── shared/     directives/si-permiso, pages/acceso-denegado, pages/no-encontrado
├── layout/     main-layout, header, sidebar
└── features/   auth/login, inicio, servicios, vehiculos, ordenes, reportes
```

## Rutas y permisos

| Ruta                    | Guard                     | Permiso           |
|-------------------------|---------------------------|-------------------|
| /login                  | invitadoGuard             | Público           |
| /inicio                 | authGuard                 | Autenticado       |
| /servicios              | authGuard + permisoGuard  | SERVICIO_LEER     |
| /servicios/nuevo, /servicios/:id/editar | authGuard + permisoGuard | SERVICIO_ESCRIBIR |
| /vehiculos              | authGuard + permisoGuard  | VEHICULO_LEER     |
| /vehiculos/nuevo, /vehiculos/:id/editar | authGuard + permisoGuard | VEHICULO_ESCRIBIR |
| /ordenes, /ordenes/:id  | authGuard + permisoGuard  | ORDEN_LEER        |
| /ordenes/nueva          | authGuard + permisoGuard  | ORDEN_REGISTRAR   |
| /reportes               | authGuard + permisoGuard  | REPORTE_VER       |

Sin permiso se muestra «Acceso denegado» y la sesión continúa. Ocultar menú y botones es solo experiencia de usuario: el backend responde 403 de todas formas.

## Seguridad

- **Sesión**: `AuthService` guarda token, permisos y vencimiento en `sessionStorage` y en un signal; cierra la sesión automáticamente al vencer el token.
- **authInterceptor**: agrega `Authorization: Bearer` solo a las peticiones dirigidas a `apiUrl`.
- **errorInterceptor**: ante un 401 (excepto el del login) cierra la sesión y vuelve a `/login?returnUrl=...`; un 403 no cierra la sesión.

## Contrato de la API consumido (bajo /api/v1)

| Verbo            | Ruta                                              |
|------------------|---------------------------------------------------|
| POST             | /auth/login                                       |
| GET              | /clientes                                         |
| GET · POST       | /servicios                                        |
| GET · PUT · DELETE | /servicios/{id}                                 |
| PATCH            | /servicios/{id}/estado                            |
| GET · POST       | /vehiculos?clienteId                              |
| GET · PUT · DELETE | /vehiculos/{id}                                 |
| POST             | /ordenes                                          |
| GET              | /ordenes?placa&estado&desde&hasta                 |
| GET              | /ordenes/{id}                                     |
| PATCH            | /ordenes/{id}/anular                              |
| GET              | /reportes/ingresos-por-servicio?desde&hasta       |
