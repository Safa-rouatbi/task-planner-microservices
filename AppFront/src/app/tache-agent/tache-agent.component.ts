import { Component, OnInit } from '@angular/core';
import { Tache } from '../model/Tache';
import { Router } from '@angular/router';
import { Compte, UserService } from '../user.service';
import { buildParamsFiltreTaches, FiltresTaches, TaskService } from '../task.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { CsvExportService } from '../csv-export.service';
import { LayoutService } from '../layout.service';
import { NotificationService } from '../notification.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';

@Component({
  selector: 'app-tache-agent',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarFooterComponent],
  templateUrl: './tache-agent.component.html',
  styleUrl: './tache-agent.component.css'
})
export class TacheAgentComponent implements OnInit {
  taches: Tache[] = [];
  utilisateurs: Compte[] = [];
  services: Service[] = [];

  filtres: FiltresTaches = {
    agentId: '',
    priorite: '',
    dateDebutStart: '',
    dateDebutEnd: ''
  };

  userPrenom = '';
  userNom = '';
  role: string | null = '';
  userId: number | null = null;

  showModal = false;
  isEdit = false;
  selectedTache: Tache = this.initTache();

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private router: Router,
    private notification: NotificationService,
    private serviceService: ServiceService,
    private csvExport: CsvExportService,
    public layout: LayoutService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    this.role = user.role;
    this.userId = user.id;
    this.userPrenom = user.prenom;
    this.userNom = user.nom;

    this.loadTaches();
    this.userService.getAll().subscribe(users => this.utilisateurs = users);
    this.serviceService.getAll().subscribe(services => this.services = services);
  }

  initTache(): Tache {
    return {
      titre: '',
      description: '',
      dateDebut: '',
      dureeEnHeures: 1,
      priorite: 'MOYENNE',
      agentId: null,
      serviceId: null,
      etat: 'A faire'
    };
  }

  loadTaches(): void {
    const params = buildParamsFiltreTaches(this.filtres);

    this.taskService.getTachesFiltres(params).subscribe({
      next: (data) => {

        this.taches = this.role === 'ADMIN' ? data : data.filter(t => t.agentId === this.userId);
      },
      error: (err: any) => {
        console.error('Erreur API:', err);
        this.notification.erreur('Erreur de chargement des tâches.');
      }
    });
  }

  appliquerFiltres(): void {
    this.loadTaches();
  }

  reinitialiserFiltres(): void {
    this.filtres = {
      agentId: '',
      priorite: '',
      dateDebutStart: '',
      dateDebutEnd: ''
    };
    this.loadTaches();
  }

  getNomAgent(agentId: number | null): string {
    if (agentId === null) return 'Non assigné';
    const agent = this.utilisateurs.find(user => user.id === agentId);
    return agent ? `${agent.prenom} ${agent.nom}` : 'Inconnu';
  }

  openModal(tache?: Tache): void {
    this.isEdit = !!tache;
    this.selectedTache = tache ? { ...tache } : this.initTache();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTache = this.initTache();
  }

  saveTache(): void {
    const dateDebut = new Date(this.selectedTache.dateDebut);
    if (isNaN(dateDebut.getTime())) {
      this.notification.erreur('Merci de renseigner une date de début valide.', 4000);
      return;
    }

    const tacheToSend = {
      ...this.selectedTache,
      dateDebut: dateDebut.toISOString()
    };

    if (this.isEdit) {
      this.taskService.updateTache(tacheToSend).subscribe({
        next: () => {
          this.notification.succes('Tâche modifiée avec succès.');
          this.loadTaches();
          this.closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la sauvegarde :', err);

          if (err.status === 409) {
            // quelqu'un d'autre a modifie la tache entre temps, on recharge les donnees a jour
            this.notification.erreur('Cette tâche a été modifiée entre-temps, les données ont été rafraîchies.');
            this.loadTaches();
            this.closeModal();
            return;
          }

          let errorMessage = 'Erreur inconnue';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 401) {
            errorMessage = 'Non autorisé. Token invalide.';
          } else if (err.status === 400) {
            errorMessage = 'Données invalides. Vérifiez les champs.';
          }

          this.notification.erreur(errorMessage);
        }
      });
    } else {
      this.taskService.ajouterTache(tacheToSend).subscribe({
        next: () => {
          this.notification.succes('Tâche créée avec succès.');
          this.loadTaches();
          this.closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la sauvegarde :', err);
          let errorMessage = 'Erreur inconnue';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 401) {
            errorMessage = 'Non autorisé. Token invalide.';
          } else if (err.status === 400) {
            errorMessage = 'Données invalides. Vérifiez les champs.';
          }

          this.notification.erreur(errorMessage);
        }
      });
    }
  }

  deleteTache(id: number): void {
    if (!window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;

    this.taskService.deleteTache(id).subscribe({
      next: () => {
        this.notification.succes('Tâche supprimée.');
        this.loadTaches();
      },
      error: (err: any) => {
        console.error('Erreur suppression tâche :', err);
        this.notification.erreur('Échec de la suppression.');
      }
    });
  }

  navigateToTache(): void { this.router.navigate(['/tacheAgent']); }
  navigateToAgentDashboard(): void { this.router.navigate(['/agent-dashboard']); }

  telechargerCSV(): void {
    const headers = ['Titre', 'Description', 'Date de début', 'Durée (h)', 'Priorité', 'Agent', 'État'];
    const rows = this.taches.map(t => [
      this.csvExport.escapeCSV(t.titre),
      this.csvExport.escapeCSV(t.description || ''),
      this.csvExport.escapeCSV(new Date(t.dateDebut).toLocaleString('fr-FR')),
      this.csvExport.escapeCSV(t.dureeEnHeures.toString()),
      this.csvExport.escapeCSV(t.priorite),
      this.csvExport.escapeCSV(this.getNomAgent(t.agentId)),
      this.csvExport.escapeCSV(t.etat)
    ]);

    this.csvExport.export(headers, rows, 'taches_export');
  }
}
