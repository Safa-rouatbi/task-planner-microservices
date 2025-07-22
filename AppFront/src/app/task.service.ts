import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tache } from './model/Tache';

export type { Tache };

export interface ParamsFiltreTaches {
  serviceId?: number;
  agentId?: string;
  priorite?: string;
  start?: string;
  end?: string;
  mesTaches?: string;
}

export interface FiltresTaches {
  agentId?: string;
  priorite?: string;
  dateDebutStart?: string;
  dateDebutEnd?: string;
  serviceId?: string;
}

export function buildParamsFiltreTaches(filtres: FiltresTaches, mesTaches = false): ParamsFiltreTaches {
  const params: ParamsFiltreTaches = {};
  if (filtres.serviceId) params.serviceId = +filtres.serviceId;
  if (filtres.agentId) params.agentId = filtres.agentId;
  if (filtres.priorite) params.priorite = filtres.priorite;
  if (filtres.dateDebutStart) params.start = new Date(filtres.dateDebutStart).toISOString();
  if (filtres.dateDebutEnd) params.end = new Date(filtres.dateDebutEnd).toISOString();
  if (mesTaches) params.mesTaches = 'true';
  return params;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
private baseUrl = 'http://localhost:8083/taches';

 constructor(private http: HttpClient) { }

 private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({ Authorization: `Bearer ${token}` });
}

  getTaches(): Observable<Tache[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Tache[]>(this.baseUrl, { headers });
  }
  getMesTaches(): Observable<Tache[]> {
  return this.http.get<Tache[]>('http://localhost:8083/taches/mes-taches', {
    headers: this.getAuthHeaders()
  });
}

  ajouterTache(tache: any): Observable<any> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.post<any>(this.baseUrl, tache, { headers });
}
updateTache(tache: Tache): Observable<any> {
  const tacheModifiee = {
    ...tache,
    dateDebut: new Date(tache.dateDebut).toISOString()
  };

  return this.http.put<any>(
    `${this.baseUrl}/${tache.id}`,
    tacheModifiee,
    { headers: this.getAuthHeaders() }
  );
}

deleteTache(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
}

getTachesFiltres(params: ParamsFiltreTaches): Observable<Tache[]> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  let queryParams = new URLSearchParams();
  if (params.serviceId) queryParams.set('serviceId', params.serviceId.toString());
  if (params.agentId) queryParams.set('agentId', params.agentId);
  if (params.priorite) queryParams.set('priorite', params.priorite);
  if (params.start) queryParams.set('start', params.start);
  if (params.end) queryParams.set('end', params.end);
  if (params.mesTaches) queryParams.set('mesTaches', params.mesTaches);
  const url = `${this.baseUrl}/filtre?${queryParams.toString()}`;

  return this.http.get<Tache[]>(url, { headers });
}

getTachesParService(serviceId: number): Observable<Tache[]> {
  return this.http.get<Tache[]>(`${this.baseUrl}/par-service`, {
    params: { serviceId },
    headers: this.getAuthHeaders()
  });
}

exporterTachesExcel(): Observable<Blob> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  return this.http.get('http://localhost:8083/export/taches.xlsx', {
    headers,
    responseType: 'blob'
  });
}

}