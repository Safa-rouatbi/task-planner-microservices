import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventClickArg, EventDropArg } from '@fullcalendar/core/index.js';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DetailsTacheAgentDialogComponent } from '../details-tache-agent-dialog/details-tache-agent-dialog.component';
import { Router } from '@angular/router';
import { buildParamsFiltreTaches, FiltresTaches, TaskService } from '../task.service';
import { Compte, UserService } from '../user.service';
import { Tache } from '../model/Tache';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { buildCalendarEvents, markConflicts, renderEventContent, renderSlotLabelContent, renderResourceLabelContent } from '../calendar-events.util';
import { NotificationService } from '../notification.service';
import { LayoutService } from '../layout.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';

interface TacheExtendedProps {
  id: number;
  description: string;
  priorite: string;
  agentId: number;
  etat: string;
  version: number;
}

@Component({
  selector: 'app-agent-dashboard',
  imports: [CommonModule, FormsModule, FullCalendarModule, MatDialogModule, SidebarFooterComponent],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.css'
})
export class AgentDashboardComponent implements OnInit {
  afficherToutesTaches = true;
  userId: number | null = null;
  modalOuvert = false;
  taches: Tache[] = [];
  users: Compte[] = [];
  isFiltrageEnCours = false;
  services: Service[] = [];

  userPrenom = '';
  userNom = '';
  role: string | null = '';

  nouvelleTache = {
    titre: '',
    description: '',
    dateDebut: '',
    dureeEnHeures: 0,
    priorite: '',
    agentId: null,
    serviceId: null,
    etat: 'A faire'
  };

  filtres: FiltresTaches = {
    agentId: '',
    priorite: '',
    dateDebutStart: '',
    dateDebutEnd: '',
    serviceId: ''
  };

  calendarOptions: CalendarOptions = {
    plugins: [resourceTimelinePlugin, interactionPlugin, dayGridPlugin],
    initialView: 'resourceTimelineThreeWeek',
    editable: true,
    droppable: true,
    resources: [],
    views: {
      resourceTimelineThreeWeek: {
        type: 'resourceTimeline',
        duration: { days: 21 },
        slotLabelFormat: [
          {
            week: 'numeric',
            omitCommas: true
          }
        ],
        buttonText: '3 semaines'
      }
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'resourceTimelineThreeWeek,dayGridMonth'
    },
    resourceAreaHeaderContent: 'Agents',
    events: [],
    themeSystem: 'standard',

    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',

    eventContent: renderEventContent,
    slotLabelContent: renderSlotLabelContent,
    resourceAreaWidth: '150px',
    resourceLabelContent: renderResourceLabelContent,
    eventClick: this.onEventClick.bind(this),
    eventDrop: this.onEventDrop.bind(this),

    dayHeaderFormat: { weekday: 'long' },
    height: 'auto',
    expandRows: true,
    nowIndicator: true
  };

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private taskService: TaskService,
    private userService: UserService,
    private serviceService: ServiceService,
    private notification: NotificationService,
    public layout: LayoutService
  ) {}

  ngOnInit(): void {
    this.chargerTaches();
    this.loadServices();
    this.loadUsers();

    const user = this.userService.getCurrentUser();
    this.role = user.role;
    this.userId = user.id;
    this.userPrenom = user.prenom;
    this.userNom = user.nom;
  }

  reinitialiserFiltres(): void {
    this.filtres = {
      agentId: '',
      priorite: '',
      dateDebutStart: '',
      dateDebutEnd: '',
      serviceId: ''
    };
    this.chargerTaches();
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

  loadUsers() {
    this.userService.getAll().subscribe(data => {
      this.users = data;

      this.calendarOptions.resources = this.users
        .filter(agent => agent.id !== undefined && agent.role === 'USER')
        .map(agent => ({
          id: agent.id!.toString(),
          title: agent.nom
        }));
    });
  }

  ajouterTache() {
    const dateDebut = new Date(this.nouvelleTache.dateDebut);
    if (isNaN(dateDebut.getTime())) {
      this.notification.erreur('Merci de renseigner une date de début valide.', 4000);
      return;
    }

    const body = {
      ...this.nouvelleTache,
      dateDebut: dateDebut.toISOString()
    };

    this.taskService.ajouterTache(body).subscribe({
      next: () => {
        this.notification.succes('Tâche ajoutée avec succès.');
        this.fermerModal();
        this.chargerTaches();
      },
      error: (err: unknown) => console.error('Erreur ajout tâche:', err)
    });
  }

  ouvrirModal() {
    this.modalOuvert = true;
  }

  fermerModal() {
    this.modalOuvert = false;
    this.nouvelleTache = {
      titre: '',
      description: '',
      dateDebut: '',
      dureeEnHeures: 0,
      priorite: '',
      agentId: null,
      serviceId: null,
      etat: 'A faire'
    };
  }

  toggleAfficher(): void {
    this.afficherToutesTaches = !this.afficherToutesTaches;
    this.chargerTaches();
  }

  chargerTaches(): void {
    const requete = this.afficherToutesTaches
      ? this.taskService.getTaches()
      : this.taskService.getMesTaches();

    requete.subscribe({
      next: (data) => {
        this.taches = data;

        const events = buildCalendarEvents(data);
        markConflicts(events);

        this.calendarOptions = {
          ...this.calendarOptions,
          events: events
        };
      },
      error: (err) => {
        console.error('Erreur chargement tâches :', err);
      }
    });
  }

  onEventClick(info: EventClickArg): void {
    const props = info.event.extendedProps as TacheExtendedProps;
    const debut = info.event.start;
    const fin = info.event.end;

    const tache: Tache = {
      id: props.id,
      titre: info.event.title,
      description: props.description,
      dateDebut: debut ? debut.toISOString() : '',
      dureeEnHeures: debut && fin ? (fin.getTime() - debut.getTime()) / (1000 * 60 * 60) : 0,
      priorite: props.priorite,
      agentId: props.agentId,
      etat: props.etat,
      version: props.version
    };

    this.openDetails(tache);
  }

  openDetails(tache: Tache): void {
    const dialogRef = this.dialog.open(DetailsTacheAgentDialogComponent, {
      width: '400px',
      data: {
        tache,
        estProprietaire: tache.agentId === this.userId,
        services: this.services
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'save') {
        this.updateTache(result.tache);
      } else if (result.action === 'delete') {
        this.deleteTache(result.tache.id);
      }
    });
  }

  updateTache(tache: Tache): void {
    this.taskService.updateTache(tache).subscribe({
      next: () => this.chargerTaches(),
      error: (err: any) => {
        console.error('Erreur modification tâche :', err);
        if (err.status === 403) {
          this.notification.erreur("Vous n'avez pas le droit de modifier cette tâche.");
        } else if (err.status === 409) {
          // quelqu'un d'autre a modifie la tache entre temps, on recharge les donnees a jour
          this.notification.erreur('Cette tâche a été modifiée entre-temps, les données ont été rafraîchies.');
          this.chargerTaches();
        } else {
          this.notification.erreur('Échec de la modification.');
        }
      }
    });
  }

  deleteTache(id: number): void {
    this.taskService.deleteTache(id).subscribe({
      next: () => {
        this.chargerTaches();
      },
      error: (err: any) => console.error('Erreur suppression tâche :', err)
    });
  }

  appliquerFiltres() {
    const params = buildParamsFiltreTaches(this.filtres);

    this.taskService.getTachesFiltres(params).subscribe({
      next: (data) => {
        this.mettreAJourEvenements(data);
      },
      error: (err: any) => {
        console.error('Erreur lors du filtrage des tâches', err);
        if (err.status === 403) {
          this.notification.erreur("Vous n'avez pas le droit d'accéder à ces données.");
        } else {
          this.notification.erreur('Erreur lors du filtrage. Vérifiez les paramètres.');
        }
      }
    });
  }

  mettreAJourEvenements(taches: Tache[]) {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: buildCalendarEvents(taches)
    };
  }

  chargerTachesParService() {
    const serviceId = +(this.filtres.serviceId || '');

    if (!serviceId) {
      this.notification.erreur('Aucun service sélectionné.', 4000);
      return;
    }

    this.taskService.getTachesParService(serviceId).subscribe({
      next: (taches) => {
        this.mettreAJourEvenements(taches);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des tâches du service', err);
        this.notification.erreur('Erreur lors du chargement des tâches de ce service.');
      }
    });
  }

  onEventDrop(info: EventDropArg): void {
    const event = info.event;
    const props = event.extendedProps as TacheExtendedProps;
    const debut = event.start;
    const fin = event.end;

    const tache: Tache = {
      id: props.id,
      titre: event.title,
      description: props.description,
      dateDebut: debut ? debut.toISOString() : '',
      dureeEnHeures: debut && fin ? (fin.getTime() - debut.getTime()) / (1000 * 60 * 60) : 0,
      priorite: props.priorite,
      agentId: props.agentId,
      etat: props.etat,
      version: props.version
    };

    if (tache.agentId !== this.userId) {
      this.notification.erreur('Vous ne pouvez déplacer que vos propres tâches.', 4000);
      info.revert();
      return;
    }

    this.updateTache(tache);
  }

  navigateToTache() {
    this.router.navigate(['/tacheAgent']);
  }

  exporterExcel() {
    this.taskService.exporterTachesExcel().subscribe({
      next: (data) => {
        const blob = new Blob([data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'taches.xlsx';
        link.click();
      },
      error: (err: any) => {
        console.error('Erreur export Excel', err);
        this.notification.erreur("Erreur lors de l'export des tâches.");
      }
    });
  }
}
