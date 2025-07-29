import { Component, OnInit } from '@angular/core';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../layout.service';
import { NotificationService } from '../notification.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-gestion-services',
  imports: [CommonModule, FormsModule, SidebarFooterComponent],
  templateUrl: './gestion-services.component.html',
  styleUrl: './gestion-services.component.css'
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  service: Service = { nomService: '' };
  editing = false;
  loading = false;
  searchTerm = '';
  modalOpen = false;

  userPrenom = '';
  userNom = '';

  constructor(
    private serviceService: ServiceService,
    private router: Router,
    private notification: NotificationService,
    private userService: UserService,
    public layout: LayoutService
  ) { }

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    this.userPrenom = user.prenom;
    this.userNom = user.nom;
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getAll().subscribe({
      next: (data) => {
        this.services = data;
        this.loading = false;
      },
      error: () => {
        this.notification.erreur('Erreur lors du chargement des services.');
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.service.nomService.trim()) {
      this.notification.erreur('Le nom du service est obligatoire.');
      return;
    }

    if (this.editing) {
      this.serviceService.update(this.service.id!, this.service).subscribe({
        next: (updated) => {
          this.resetForm();
          this.loadServices();
          this.notification.succes(`Service "${updated.nomService}" mis à jour.`);
        },
        error: () => this.notification.erreur("Échec de la mise à jour.")
      });
    } else {
      this.serviceService.create(this.service).subscribe({
        next: (created) => {
          this.resetForm();
          this.loadServices();
          this.notification.succes(`Service "${created.nomService}" ajouté.`);
        },
        error: () => this.notification.erreur("Échec de l'ajout.")
      });
    }
  }

  edit(service: Service): void {
    this.service = { ...service };
    this.editing = true;
    window.scrollTo(0, 0);
  }

  delete(id: number, nom: string): void {
    if (confirm(`Voulez-vous vraiment supprimer le service "${nom}" ?`)) {
      this.serviceService.delete(id).subscribe({
        next: () => {
          this.loadServices();
          this.notification.succes('Service supprimé.');
        },
        error: () => this.notification.erreur("Échec de la suppression.")
      });
    }
  }

  cancel(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.service = { nomService: '' };
    this.editing = false;
  }

  retour() {
    this.router.navigate(['/compte']);
  }

  get filteredServices() {
    return this.services.filter(s =>
      s.nomService.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openModal() {
    this.service = { nomService: '' };
    this.editing = false;
    this.modalOpen = true;
  }

  navigateToCalendrier() {
    this.router.navigate(['/calendrier']);
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
}
