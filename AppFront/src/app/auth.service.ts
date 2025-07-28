import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../environments/environment';

export interface TokenPayload {
  sub: string;
  Id: number;
  role: string;
  nom: string;
  prenom: string;
  iat: number;
  exp: number;
}

export interface CurrentUserInfo {
  id: number | null;
  role: string | null;
  prenom: string;
  nom: string;
  nomComplet: string;
}

// Seul endroit qui touche au token JWT (stockage, lecture, decodage).
// Les autres services demandent l'utilisateur courant ici plutot que de
// relire localStorage chacun de leur cote.
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.gatewayApiUrl}/api/auth/login`;

  constructor(private http: HttpClient) { }

  login(credentials: { mail: string; motdepasse: string }): Observable<any> {
    return this.http.post(this.apiUrl, credentials).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<TokenPayload>(token);
    } catch (e) {
      localStorage.removeItem('token');
      return null;
    }
  }

  getUserId(): number | null {
    const payload = this.getPayload();
    return payload ? payload.Id : null;
  }

  getUserRole(): string | null {
    const payload = this.getPayload();
    return payload ? payload.role : null;
  }

  getCurrentUser(): CurrentUserInfo {
    const payload = this.getPayload();
    if (!payload) {
      return { id: null, role: null, prenom: '', nom: '', nomComplet: 'Profil' };
    }

    const prenom = payload.prenom || 'Utilisateur';
    const nom = payload.nom || '';
    return {
      id: payload.Id,
      role: payload.role,
      prenom,
      nom,
      nomComplet: `${prenom} ${nom}`.trim()
    };
  }
}
