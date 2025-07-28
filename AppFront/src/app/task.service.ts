import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tache } from './model/Tache';
import { environment } from '../environments/environment';

export type { Tache };

export interface Statistiques {
  chargeParAgent: { [agentId: string]: number };
  parPriorite: { [priorite: string]: number };
  parService: { [serviceId: string]: number };
  nombreEnRetard: number;
  totalTaches: number;
  tachesEnRetard: { titre: string; agentId: number | null; heuresRetard: number }[];
  totalActives: number;
  tachesNonAssignees: number;
  tachesSansService: number;
}

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
  private baseUrl = `${environment.taskApiUrl}/taches`;

  constructor(private http: HttpClient) { }

  // Pas besoin d'ajouter le token ici car uthInterceptor le fait deja

  getTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.baseUrl);
  }

  getMesTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.baseUrl}/mes-taches`);
  }

  ajouterTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(this.baseUrl, tache);
  }

  updateTache(tache: Tache): Observable<Tache> {
    const tacheModifiee = {
      ...tache,
      dateDebut: new Date(tache.dateDebut).toISOString()
    };

    return this.http.put<Tache>(`${this.baseUrl}/${tache.id}`, tacheModifiee);
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTachesFiltres(params: ParamsFiltreTaches): Observable<Tache[]> {
    let httpParams = new HttpParams();
    if (params.serviceId) httpParams = httpParams.set('serviceId', params.serviceId);
    if (params.agentId) httpParams = httpParams.set('agentId', params.agentId);
    if (params.priorite) httpParams = httpParams.set('priorite', params.priorite);
    if (params.start) httpParams = httpParams.set('start', params.start);
    if (params.end) httpParams = httpParams.set('end', params.end);
    if (params.mesTaches) httpParams = httpParams.set('mesTaches', params.mesTaches);

    return this.http.get<Tache[]>(`${this.baseUrl}/filtre`, { params: httpParams });
  }

  getTachesParService(serviceId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.baseUrl}/par-service`, {
      params: { serviceId }
    });
  }

  getStatistiques(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.baseUrl}/stats`);
  }

  exporterTachesExcel(): Observable<Blob> {
    return this.http.get(`${environment.taskApiUrl}/export/taches.xlsx`, {
      responseType: 'blob'
    });
  }
}
