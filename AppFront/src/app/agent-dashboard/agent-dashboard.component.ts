import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventClickArg, EventDropArg } from '@fullcalendar/core/index.js';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { catchError, EMPTY, tap } from 'rxjs';
import { DetailsTacheAgentDialogComponent } from '../details-tache-agent-dialog/details-tache-agent-dialog.component';
import { Router } from '@angular/router';
import { buildParamsFiltreTaches, FiltresTaches, TaskService } from '../task.service';
import { Compte, UserService } from '../user.service';
import { Tache } from '../model/Tache';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { buildCalendarEvents, markConflicts } from '../calendar-events.util';
import { getWeekNumber } from '../date-utils';
import { LayoutService } from '../layout.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';

interface TacheExtendedProps {
  id: number;
  description: string;
  priorite: string;
  agentId: number;
  etat: string;
}

@Component({
  selector: 'app-agent-dashboard',
  imports: [CommonModule, FormsModule, FullCalendarModule, MatDialogModule, MatSnackBarModule, SidebarFooterComponent],
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
    serviceId: null
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

    eventContent: (info) => {
      const tache = info.event.extendedProps as Tache;

      const color = tache.codeColor || '#6366f1';
      const isCadre = tache.cadre === true;
      const isConteneur = tache.conteneur === true;

      const textColor = isConteneur ? 'white' : '#1f2937';
      const backgroundColor = isConteneur ? color : '#f3f4f6';
      const borderColor = isCadre ? '#ef4444' : color;
      const border = isCadre ? '3px solid' : '1px solid';

      const opacity = info.isPast ? '0.7' : '1';

      return {
        html: `
          <div style="
            background-color: ${backgroundColor};
            color: ${textColor};
            border: ${border};
            border-color: ${borderColor};
            border-radius: 8px;
            padding: 6px 10px;
            font-size: 0.85em;
            font-weight: 600;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: all 0.2s ease;
            opacity: ${opacity};
            box-sizing: border-box;
            min-height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${info.timeText ? `<span style="font-size:0.7em; opacity:0.9;">${info.timeText}</span><br/>` : ''}
            <span>${info.event.title}</span>
          </div>
        `
      };
    },

    slotLabelContent: (arg) => {
      const date = new Date(arg.date);
      const day = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
      const weekNumber = getWeekNumber(date);

      if (date.getDay() === 1) {
        return {
          html: `
            <div style="text-align:center; padding: 4px;">
              <div style="font-weight:600; color:#1f2937;">${day}</div>
              <div style="
                background:#e0e0e0;
                color:#4b5563;
                border-radius:4px;
                padding:2px 6px;
                font-size:0.75em;
                font-weight:500;
                margin-top:4px;
                display:inline-block;">
                Semaine ${weekNumber}
              </div>
            </div>
          `
        };
      }

      return {
        html: `<div style="text-align:center; padding:4px; color:#4b5563; font-size:0.85em;">${day}</div>`
      };
    },

    resourceAreaWidth: '150px',
    resourceLabelContent: (info) => {
      return {
        html: `
          <div style="
            font-weight:600;
            color:#1f2937;
            padding:8px;
            margin-bottom: 4px;
          ">
            ${info.resource.title}
          </div>
        `
      };
    },
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
    private snackBar: MatSnackBar,
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
      this.snackBar.open('Merci de renseigner une date de début valide.', 'Fermer', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const body = {
      ...this.nouvelleTache,
      dateDebut: dateDebut.toISOString()
    };

    this.taskService.ajouterTache(body).subscribe({
      next: () => {
        this.snackBar.open('Tâche ajoutée avec succès.', 'Fermer', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
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
      serviceId: null
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

    requete
      .pipe(
        tap(data => {
          this.taches = data;

          const events = buildCalendarEvents(data);
          markConflicts(events);

          this.calendarOptions = {
            ...this.calendarOptions,
            events: events
          };
        }),
        catchError(err => {
          console.error('Erreur chargement tâches :', err);
          return EMPTY;
        })
      )
      .subscribe();
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
      etat: props.etat
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
        const message = err.status === 403
          ? "Vous n'avez pas le droit de modifier cette tâche."
          : 'Échec de la modification.';
        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
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
        const message = err.status === 403
          ? "Vous n'avez pas le droit d'accéder à ces données."
          : 'Erreur lors du filtrage. Vérifiez les paramètres.';
        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
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
      this.snackBar.open('Aucun service sélectionné.', 'Fermer', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.taskService.getTachesParService(serviceId).subscribe({
      next: (taches) => {
        this.mettreAJourEvenements(taches);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des tâches du service', err);
        this.snackBar.open('Erreur lors du chargement des tâches de ce service.', 'Fermer', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
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
      etat: props.etat
    };

    if (tache.agentId !== this.userId) {
      this.snackBar.open('Vous ne pouvez déplacer que vos propres tâches.', 'Fermer', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      info.revert();
      return;
    }

    this.updateTache(tache);
  }

  navigatetotache() {
    this.router.navigate(['/tacheAgent']);
  }

  exporterExcel() {
    this.taskService.exporterTachesExcel().subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'taches_' + new Date().toISOString().split('T')[0] + '.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Erreur export Excel', err);
        this.snackBar.open("Erreur lors de l'export des tâches.", 'Fermer', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}
