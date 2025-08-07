export interface Tache {
  id?: number;
  titre: string;
  description: string;
  dateDebut: string;
  dureeEnHeures: number;
  priorite: string;
  agentId: number | null;
  serviceId?: number | null;
  etat: string;
  version?: number;

  codeColor?: string;
  cadre?: boolean;
  conteneur?: boolean;
}