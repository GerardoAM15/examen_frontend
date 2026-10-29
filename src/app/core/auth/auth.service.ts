import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Sesion } from './auth.models';

const CLAVE = 'autoandes.sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Estado de la sesión como signal: el menú, el header y los botones se recalculan solos al cambiar.
  private readonly sesion = signal<Sesion | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  readonly usuario = computed(() => this.sesion());
  readonly autenticado = computed(() => this.sesion() !== null);
  readonly permisos = computed(() => new Set(this.sesion()?.permisos ?? []));

  constructor() {
    this.restaurar();
  }

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, datos).pipe(
      tap(r => this.iniciar({
        token: r.token,
        username: r.username,
        nombreCompleto: r.nombreCompleto,
        roles: r.roles,
        permisos: r.permisos,
        expiraEn: Date.now() + r.expiraEnSegundos * 1000,
      })),
    );
  }

  cerrarSesion(returnUrl?: string) {
    clearTimeout(this.temporizador);
    sessionStorage.removeItem(CLAVE);
    this.sesion.set(null);
    this.router.navigate(['/login'], { queryParams: returnUrl ? { returnUrl } : {} });
  }

  // Se lee de sessionStorage en cada petición: si alguien altera el token, el backend responde 401.
  token(): string | null {
    const guardada = this.leer();
    return guardada && guardada.expiraEn > Date.now() ? guardada.token : null;
  }

  tienePermiso(permiso?: string): boolean {
    return !permiso || this.permisos().has(permiso);
  }

  private iniciar(sesion: Sesion) {
    sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
    this.sesion.set(sesion);
    this.programarCierre(sesion.expiraEn);
  }

  private restaurar() {
    const guardada = this.leer();
    if (!guardada || guardada.expiraEn <= Date.now()) {
      sessionStorage.removeItem(CLAVE);
      return;
    }
    this.sesion.set(guardada);
    this.programarCierre(guardada.expiraEn);
  }

  // Cierre automático cuando vence el token (expiraEnSegundos = 3600).
  private programarCierre(expiraEn: number) {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.cerrarSesion(this.router.url), expiraEn - Date.now());
  }

  private leer(): Sesion | null {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null') as Sesion | null;
    } catch {
      return null;
    }
  }
}
