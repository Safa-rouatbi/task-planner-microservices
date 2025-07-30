import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventDropArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { buildParamsFiltreTaches, FiltresTaches, Tache, TaskService } from '../task.service';
import { FormsModule } from '@angular/forms';
import { Compte, UserService } from '../user.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetailsTacheDialogComponent } from '../details-tache-dialog/details-tache-dialog.component';
import { NotificationService } from '../notification.service';
import { catchError, EMPTY, Observable, tap } from 'rxjs';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { buildCalendarEvents, markConflicts, renderEventContent, renderSlotLabelContent, renderResourceLabelContent } from '../calendar-events.util';
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
  selector: 'app-calendrier',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, FormsModule, MatDialogModule, SidebarFooterComponent],
  templateUrl: './calendrier.component.html',
  styleUrls: ['./calendrier.component.css']
})
export class CalendrierComponent implements OnInit {
  modalOuvert = false;
  taches: Tache[] = [];
  services: Service[] = [];

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

  userPrenom = '';
  userNom = '';
  role: string | null = '';
  userId: number | null = null;

  users: Compte[] = [];

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
    private taskService: TaskService,
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private serviceService: ServiceService,
    private notification: NotificationService,
    public layout: LayoutService
  ) {}

  ngOnInit(): void {
    this.chargerTaches().subscribe();
    this.loadUsers();
    this.loadServices();
    this.refreshCalendar();

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
    this.chargerTaches().subscribe(() => this.refreshCalendar());
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

  onEventClick(info: EventClickArg): void {
    const props = info.event.extendedProps as TacheExtendedProps;
    const debut = info.event.start;
    const fin = info.event.end;

    const tache: Tache = {
      id: props.id,
      titre: info.event.title,
      description: props.description,
      dateDebut: debut ? debut.toISOString() : '',
      dureeEnHeures: debut && fin ? this.getDurationInHours(debut, fin) : 0,
      priorite: props.priorite,
      agentId: props.agentId,
      etat: props.etat
    };

    this.openDetails(tache);
  }

  getDurationInHours(start: Date, end: Date): number {
    const duration = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    return Math.round(duration);
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
        this.refreshCalendar();
      },
      error: (err: any) => {
        console.error('Erreur ajout tâche:', err);
        this.notification.erreur("Erreur lors de l'ajout de la tâche.");
      }
    });
  }

  openDetails(tache: Tache) {
    const dialogRef = this.dialog.open(DetailsTacheDialogComponent, {
      width: '400px',
      data: {
        tache,
        users: this.users,
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

  updateTache(tache: Tache) {
    this.taskService.updateTache(tache).subscribe({
      next: () => {
        this.chargerTaches().subscribe(() => this.refreshCalendar());
      },
      error: (err: any) => {
        console.error('Erreur modification tâche :', err);
        this.notification.erreur('Échec de la modification.');
      }
    });
  }

  deleteTache(id: number) {
    this.taskService.deleteTache(id).subscribe({
      next: () => {
        this.chargerTaches().subscribe(() => this.refreshCalendar());
      },
      error: (err: any) => {
        console.error('Erreur suppression tâche :', err);
        this.notification.erreur('Échec de la suppression.');
      }
    });
  }

  chargerTaches(): Observable<Tache[]> {
    return this.taskService.getTaches().pipe(
      tap(data => this.taches = data),
      catchError(err => {
        console.error('Erreur chargement tâches :', err);
        return EMPTY;
      })
    );
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
        this.notification.erreur(message);
      }
    });
  }

  mettreAJourEvenements(taches: Tache[]) {

    this.calendarOptions = {
      ...this.calendarOptions,
      events: buildCalendarEvents(taches)
    };
  }

  refreshCalendar() {
    this.taskService.getTaches().subscribe({
      next: (taches: Tache[]) => {
        const events = buildCalendarEvents(taches);
        markConflicts(events);

        this.calendarOptions = {
          ...this.calendarOptions,
          events: events
        };
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tâches', err);
      }
    });
  }

  onEventDrop(info: EventDropArg) {
    const props = info.event.extendedProps as TacheExtendedProps;
    const debut = info.event.start;
    const fin = info.event.end;

    const updatedTache: Tache = {
      id: props.id,
      titre: info.event.title,
      description: props.description,
      dateDebut: debut ? debut.toISOString() : '',
      dureeEnHeures: debut && fin ? this.getDurationInHours(debut, fin) : 0,
      priorite: props.priorite,
      etat: props.etat,
      agentId: info.event.getResources()[0]?.id ? parseInt(info.event.getResources()[0].id) : null
    };

    this.taskService.updateTache(updatedTache).subscribe({
      next: () => {
        this.refreshCalendar();
      },
      error: (err: any) => {
        const message = err.status === 403
          ? "Vous n'avez pas le droit de déplacer cette tâche."
          : 'Une erreur est survenue lors du déplacement de la tâche.';
        this.notification.erreur(message);
        this.refreshCalendar();
      }
    });
  }

  navigateToUser() {
    this.router.navigate(['/compte']);
  }

  navigateToTache() {
    this.router.navigate(['/tache']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard-manager']);
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
        this.notification.erreur("Erreur lors de l'export des tâches.");
      }
    });
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
}
