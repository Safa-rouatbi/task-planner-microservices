import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService, CurrentUserInfo } from './auth.service';

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
private apiUrl = `${environment.gatewayApiUrl}/api/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

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

  // Le token appartient a AuthService
  getCurrentUser(): CurrentUserInfo {
    return this.authService.getCurrentUser();
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
