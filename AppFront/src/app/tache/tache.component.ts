import { Component, OnInit } from '@angular/core';
import { buildParamsFiltreTaches, FiltresTaches, Tache, TaskService } from '../task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Compte, UserService } from '../user.service';
import { Router } from '@angular/router';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { CsvExportService } from '../csv-export.service';
import { LayoutService } from '../layout.service';
import { NotificationService } from '../notification.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';

@Component({
  selector: 'app-tache',
  imports: [CommonModule, FormsModule, SidebarFooterComponent],
  templateUrl: './tache.component.html',
  styleUrl: './tache.component.css'
})
export class TacheComponent implements OnInit {
  taches: Tache[] = [];
  utilisateurs: Compte[] = [];
  services: Service[] = [];

  filtres: FiltresTaches = {
    agentId: '',
    priorite: '',
    dateDebutStart: '',
    dateDebutEnd: '',
    serviceId: ''
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
    this.loadServices();

    const user = this.userService.getCurrentUser();
    this.role = user.role;
    this.userId = user.id;
    this.userPrenom = user.prenom;
    this.userNom = user.nom;

    this.loadUsers();
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

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.utilisateurs = users.filter(u => u.role === 'USER');
        this.loadTaches();
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
        this.notification.erreur('Impossible de charger les agents.');
        this.loadTaches();
      }
    });
  }

  loadTaches(): void {
    const params = buildParamsFiltreTaches(this.filtres, this.role !== 'ADMIN');

    this.taskService.getTachesFiltres(params).subscribe({
      next: (data) => {
        this.taches = data;
      },
      error: (err: any) => {
        console.error('Erreur chargement tâches', err);
        this.notification.erreur('Erreur de chargement des tâches.');
      }
    });
  }

  loadServices() {
    this.serviceService.getAll().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des services', err);
      }
    });
  }

  appliquerFiltres() {
    const params = buildParamsFiltreTaches(this.filtres, this.role !== 'ADMIN');

    this.taskService.getTachesFiltres(params).subscribe({
      next: (data) => {
        this.taches = data;
      },
      error: (err: any) => {
        console.error('Erreur filtrage', err);
        this.notification.erreur('Erreur lors du filtrage.');
      }
    });
  }

  chargerTachesParService() {
    const serviceId = +(this.filtres.serviceId || '');
    if (!serviceId) return;

    this.taskService.getTachesParService(serviceId).subscribe({
      next: (data) => {
        this.taches = data;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des tâches du service', err);
        this.notification.erreur('Erreur lors du chargement.');
      }
    });
  }

  reinitialiserFiltres(): void {
    this.filtres = {
      agentId: '',
      priorite: '',
      dateDebutStart: '',
      dateDebutEnd: '',
      serviceId: ''
    };
    this.loadTaches();
  }

  getNomAgent(agentId: number | null): string {
    if (agentId === null) return 'Non assigné';
    const agent = this.utilisateurs.find(u => u.id === agentId);
    return agent ? `${agent.prenom} ${agent.nom}` : 'Inconnu';
  }

  getNomService(serviceId: number | null | undefined): string {
    if (!serviceId) return '-';
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.nomService : 'Inconnu';
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
          this.notification.succes('Tâche modifiée.');
          this.loadTaches();
          this.closeModal();
        },
        error: (err) => {
          if (err.status === 409) {
            // quelqu'un d'autre a modifie la tache entre temps, on recharge les donnees a jour
            this.notification.erreur('Cette tâche a été modifiée entre-temps, les données ont été rafraîchies.');
            this.loadTaches();
            this.closeModal();
            return;
          }

          let message = 'Données invalides.';
          if (err.status === 401) message = 'Non autorisé.';
          else if (err.status === 403) message = 'Accès refusé.';

          this.notification.erreur(message);
        }
      });
    } else {
      this.taskService.ajouterTache(tacheToSend).subscribe({
        next: () => {
          this.notification.succes('Tâche créée.');
          this.loadTaches();
          this.closeModal();
        },
        error: (err) => {
          let message = 'Données invalides.';
          if (err.status === 401) message = 'Non autorisé.';
          else if (err.status === 403) message = 'Accès refusé.';

          this.notification.erreur(message);
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
        console.error('Erreur suppression tâche:', err);
        this.notification.erreur('Échec de la suppression.');
      }
    });
  }

  navigateToUser(): void {
    this.router.navigate(['/compte']);
  }

  navigateToTache(): void {
    this.router.navigate(['/tache']);
  }

  navigateToCalendrier(): void {
    this.router.navigate(['/calendrier']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard-manager']);
  }

  telechargerCSV(): void {
    const headers = ['Titre', 'Description', 'Date de début', 'Durée (h)', 'Priorité', 'Agent', 'Service', 'État'];
    const rows = this.taches.map(t => [
      this.csvExport.escapeCSV(t.titre),
      this.csvExport.escapeCSV(t.description || ''),
      this.csvExport.escapeCSV(new Date(t.dateDebut).toLocaleString('fr-FR')),
      this.csvExport.escapeCSV(t.dureeEnHeures.toString()),
      this.csvExport.escapeCSV(t.priorite),
      this.csvExport.escapeCSV(this.getNomAgent(t.agentId)),
      this.csvExport.escapeCSV(this.getNomService(t.serviceId)),
      this.csvExport.escapeCSV(t.etat)
    ]);

    this.csvExport.export(headers, rows, 'taches_export');
  }
}
