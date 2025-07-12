import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

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

export interface Compte {
  id?: number;
  nom: string;
  prenom: string;
  mail: string;
  motdepasse: string;
  role: string;
  actif?: boolean;
  serviceId?: number;
  nomService?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getToken(): string | null {

    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('token');
  }

  getAll(): Observable<Compte[]> {
    return this.http.get<Compte[]>(`${this.apiUrl}/all`);
  }
  add(compte: Compte): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, compte, { responseType: 'text' });
  }

  update(id: number, compte: Compte): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, compte, { responseType: 'text' });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
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
  activer(id: number) {
  return this.http.put(`${this.apiUrl}/activer/${id}`, {}, { responseType: 'text' });
}

desactiver(id: number) {
  return this.http.put(`${this.apiUrl}/desactiver/${id}`, {}, { responseType: 'text' });
}
getByServiceId(serviceId: number): Observable<Compte[]> {
  return this.http.get<Compte[]>(`${this.apiUrl}/by-service/${serviceId}`);
}

}
