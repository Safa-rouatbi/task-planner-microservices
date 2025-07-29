import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin } from 'rxjs';
import { TaskService, Statistiques } from '../task.service';
import { UserService, Compte } from '../user.service';
import { ServiceService } from '../service.service';
import { Service } from '../model/service.model';
import { buildCalendarEvents, checkForConflicts, computeEndDate } from '../calendar-events.util';
import { LayoutService } from '../layout.service';
import { NotificationService } from '../notification.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-manager',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, SidebarFooterComponent],
  templateUrl: './dashboard-manager.component.html',
  styleUrl: './dashboard-manager.component.css'
})
export class DashboardManagerComponent implements OnInit {
  userPrenom = '';
  userNom = '';

  totalTaches = 0;
  totalActives = 0;
  nombreEnRetard = 0;
  pourcentageEnRetard = 0;
  tachesNonAssignees = 0;
  moyenneHeures = 0;

  chargeParAgentData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Heures' }] };
  parPrioriteData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  parServiceData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Tâches' }] };

  tachesEnRetardData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Jours de retard' }] };

  // Barres horizontales : les titres de taches sont trop longs pour tenir en abscisse.
  tachesEnRetardOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { title: { display: true, text: 'Jours de retard' } } }
  };

  agentsEnConflit: string[] = [];

  users: Compte[] = [];
  services: Service[] = [];

  // Chart.js a besoin d'un vrai canvas cote serveur SSR il n'existe pas on n'affiche les graphiques que dans le navigateur.
  estNavigateur = false;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private serviceService: ServiceService,
    private router: Router,
    private notification: NotificationService,
    public layout: LayoutService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.estNavigateur = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    this.userPrenom = user.prenom;
    this.userNom = user.nom;

    if (user.role !== 'ADMIN') {
      this.router.navigate(['/agent-dashboard']);
      return;
    }

    forkJoin({
      users: this.userService.getAll(),
      services: this.serviceService.getAll()
    }).subscribe({
      next: ({ users, services }) => {
        this.users = users;
        this.services = services;
        this.chargerStatistiques();
        this.chargerConflits();
      },
      error: (err) => {
        console.error('Erreur chargement agents/services', err);
        this.notification.erreur('Erreur lors du chargement du tableau de bord.');
      }
    });
  }

  chargerStatistiques(): void {
    this.taskService.getStatistiques().subscribe({
      next: (stats) => this.appliquerStatistiques(stats),
      error: (err) => {
        console.error('Erreur chargement statistiques', err);
        this.notification.erreur('Erreur lors du chargement des statistiques.');
      }
    });
  }

  chargerConflits(): void {
    this.taskService.getTaches().subscribe({
      next: (taches) => {
        const maintenant = new Date();
        const dans14Jours = new Date(maintenant.getTime() + 14 * 24 * 60 * 60 * 1000);

       
        const tachesActives = taches.filter(t => {
          if (t.etat === 'Terminée') return false;
          const debut = new Date(t.dateDebut);
          const fin = new Date(computeEndDate(t.dateDebut, t.dureeEnHeures));
          return fin >= maintenant && debut <= dans14Jours;
        });

        const events = buildCalendarEvents(tachesActives);
        const conflits = checkForConflicts(events);
        this.agentsEnConflit = Object.keys(conflits).map(id => this.getNomAgent(+id));
      },
      error: (err) => {
        console.error('Erreur chargement conflits', err);
        this.notification.erreur('Erreur lors de la détection des chevauchements.');
      }
    });
  }

  getNomAgent(agentId: number): string {
    const agent = this.users.find(u => u.id === agentId);
    return agent ? `${agent.prenom} ${agent.nom}` : 'Agent ' + agentId;
  }

  appliquerStatistiques(stats: Statistiques): void {
    this.totalTaches = stats.totalTaches;
    this.totalActives = stats.totalActives;
    this.nombreEnRetard = stats.nombreEnRetard;
    this.tachesNonAssignees = stats.tachesNonAssignees;

   
    this.pourcentageEnRetard = stats.totalActives > 0
      ? Math.round((stats.nombreEnRetard / stats.totalActives) * 100)
      : 0;

    const agents = this.users.filter(u => u.role === 'USER' && u.actif);
    const heuresParAgent = agents.map(a => stats.chargeParAgent[a.id!] || 0);
    this.moyenneHeures = heuresParAgent.length > 0
      ? Math.round((heuresParAgent.reduce((total, h) => total + h, 0) / heuresParAgent.length) * 10) / 10
      : 0;

    this.chargeParAgentData = {
      labels: agents.map(a => `${a.prenom} ${a.nom}`),
      datasets: [{
        data: heuresParAgent,
        label: 'Heures de travail en cours',
        backgroundColor: heuresParAgent.map(h => h > this.moyenneHeures ? '#7c4730' : '#a15c3e')
      }]
    };

    this.parPrioriteData = {
      labels: Object.keys(stats.parPriorite),
      datasets: [{ data: Object.values(stats.parPriorite), backgroundColor: ['#a15c3e', '#7c4730', '#ddd5c4'] }]
    };

   
    const labelsService = Object.keys(stats.parService).map(id => this.getNomService(+id));
    const valeursService = Object.values(stats.parService);
    if (stats.tachesSansService > 0) {
      labelsService.push('Sans service');
      valeursService.push(stats.tachesSansService);
    }

    this.parServiceData = {
      labels: labelsService,
      datasets: [{ data: valeursService, label: 'Tâches', backgroundColor: '#221f1a' }]
    };


    this.tachesEnRetardData = {
      labels: stats.tachesEnRetard.map(
        t => `${t.titre} (${this.getNomAgentCourt(t.agentId)}) — ${this.formatRetard(t.heuresRetard)}`
      ),
      datasets: [{
        data: stats.tachesEnRetard.map(t => Math.round((t.heuresRetard / 24) * 10) / 10),
        label: 'Jours de retard',
        backgroundColor: '#a15c3e'
      }]
    };
  }

  formatRetard(heures: number): string {
    if (heures < 24) {
      return heures + ' h';
    }
    return Math.floor(heures / 24) + ' j';
  }

  getNomAgentCourt(agentId: number | null): string {
    if (agentId === null) {
      return 'non assignée';
    }
    const agent = this.users.find(u => u.id === agentId);
    return agent ? `${agent.prenom.charAt(0)}. ${agent.nom}` : 'Agent ' + agentId;
  }

  getNomService(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.nomService : 'Service ' + serviceId;
  }

  navigateToCalendrier(): void {
    this.router.navigate(['/calendrier']);
  }
}
