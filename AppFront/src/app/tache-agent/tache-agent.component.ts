import { Component, OnInit } from '@angular/core';
import { Tache } from '../model/Tache';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Compte, UserService } from '../user.service';
import { buildParamsFiltreTaches, FiltresTaches, TaskService } from '../task.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { CsvExportService } from '../csv-export.service';
import { LayoutService } from '../layout.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';

@Component({
  selector: 'app-tache-agent',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule, SidebarFooterComponent],
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
    private snackBar: MatSnackBar,
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
        this.snackBar.open('Erreur de chargement des tâches.', 'Fermer', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
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
      this.snackBar.open('Merci de renseigner une date de début valide.', 'Fermer', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const tacheToSend = {
      ...this.selectedTache,
      dateDebut: dateDebut.toISOString()
    };

    const request = this.isEdit
      ? this.taskService.updateTache(tacheToSend)
      : this.taskService.ajouterTache(tacheToSend);

    request.subscribe({
      next: () => {
        const message = this.isEdit ? 'Tâche modifiée avec succès.' : 'Tâche créée avec succès.';
        this.snackBar.open(message, 'Fermer', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });

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

        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  deleteTache(id: number): void {
    if (!window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;

    this.taskService.deleteTache(id).subscribe({
      next: () => {
        this.snackBar.open('Tâche supprimée.', 'Fermer', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.loadTaches();
      },
      error: (err: any) => {
        console.error('Erreur suppression tâche :', err);
        this.snackBar.open('Échec de la suppression.', 'Fermer', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  navigatetotache(): void { this.router.navigate(['/tacheAgent']); }
  navigatetocalendar(): void { this.router.navigate(['/agent-dashboard']); }

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
