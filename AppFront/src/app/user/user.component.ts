import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Compte, UserService } from '../user.service';
import { Router } from '@angular/router';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { combineLatest } from 'rxjs';
import { CsvExportService } from '../csv-export.service';
import { LayoutService } from '../layout.service';
import { NotificationService } from '../notification.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarFooterComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: Compte[] = [];
  services: Service[] = [];
  form: FormGroup;
  searchTerm = '';
  selectedServiceFilter: number | '' = '';
  modalOpen = false;
  selectedUserId: number | null = null;
  userPrenom = '';
  userNom = '';
  role: string | null = '';
  userId: number | null = null;
  isChargement = false;

  constructor(
    private userService: UserService,
    private serviceService: ServiceService,
    private fb: FormBuilder,
    private router: Router,
    private notification: NotificationService,
    private csvExport: CsvExportService,
    public layout: LayoutService
  ) {
    this.form = this.fb.group({
      nom: [''],
      prenom: [''],
      mail: [''],
      motdepasse: [''],
      role: ['USER'],
      serviceId: ['']
    });
  }

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    this.role = user.role;
    this.userId = user.id;
    this.userPrenom = user.prenom;
    this.userNom = user.nom;

    this.isChargement = true;

    combineLatest([this.userService.getAll(), this.serviceService.getAll()])
      .subscribe({
        next: ([users, services]) => {
          this.services = services;
          this.users = users.map(user => ({
            ...user,
            nomService: services.find(s => s.id === user.serviceId)?.nomService || '-'
          }));
          this.isChargement = false;
        },
        error: () => {
          this.notification.erreur('Erreur de chargement');
          this.isChargement = false;
        }
      });
  }

  get filteredUsers() {
    return this.users.filter(user => {
      const matchesSearch = user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            user.mail.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesService = this.selectedServiceFilter === '' || user.serviceId === this.selectedServiceFilter;
      return matchesSearch && matchesService;
    });
  }

  getServiceName(serviceId?: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.nomService : '-';
  }

  openModal() {
    this.form.reset({ role: 'USER', serviceId: '' });
    this.selectedUserId = null;
    this.modalOpen = true;
  }

  edit(user: Compte) {
    this.form.patchValue({ ...user, motdepasse: '' });
    this.selectedUserId = user.id!;
    this.modalOpen = true;
  }

  submit() {
    const userData = { ...this.form.value };

    if (this.selectedUserId) {
      // En modification, un mot de passe vide veut dire "ne pas le changer".
      // On l'enlève avant l'envoi pour ne pas risquer d'écraser l'ancien.
      if (!userData.motdepasse) {
        delete userData.motdepasse;
      }

      this.userService.update(this.selectedUserId, userData).subscribe({
        next: () => {
          this.modalOpen = false;
          this.refreshUsers();
          this.notification.succes('Utilisateur modifié');
        },
        error: (err) => {
          console.error('Erreur modification:', err);
          this.notification.erreur('Échec modification');
        }
      });
    } else {
      this.userService.add(userData).subscribe({
        next: () => {
          this.modalOpen = false;
          this.refreshUsers();
          this.notification.succes('Utilisateur ajouté');
        },
        error: (err) => {
          console.error('Erreur ajout:', err);
          this.notification.erreur('Échec ajout');
        }
      });
    }
  }

  delete(id: number) {
    if (confirm('Supprimer ce compte ?')) {
      this.userService.delete(id).subscribe(() => this.refreshUsers());
    }
  }

  activer(id: number) {
    this.userService.activer(id).subscribe(() => this.refreshUsers());
  }

  desactiver(id: number) {
    this.userService.desactiver(id).subscribe(() => this.refreshUsers());
  }

  refreshUsers() {
    combineLatest([this.userService.getAll(), this.serviceService.getAll()])
      .subscribe({
        next: ([users, services]) => {
          this.services = services;
          this.users = users.map(user => ({
            ...user,
            nomService: services.find(s => s.id === user.serviceId)?.nomService || '-'
          }));
        },
        error: () => this.notification.erreur('Erreur de chargement')
      });
  }

  navigateToCalendrier() { this.router.navigate(['/calendrier']); }
  navigateToUser() { this.router.navigate(['/compte']); }
  navigateToTache() { this.router.navigate(['/tache']); }
  navigateToService() { this.router.navigate(['/services']); }
  navigateToDashboard() { this.router.navigate(['/dashboard-manager']); }

  telechargerCSV(): void {
    const headers = ['Nom', 'Prénom', 'Email', 'Rôle', 'Statut', 'Service'];
    const rows = this.filteredUsers.map(user => [
      this.csvExport.escapeCSV(user.nom),
      this.csvExport.escapeCSV(user.prenom),
      this.csvExport.escapeCSV(user.mail),
      this.csvExport.escapeCSV(user.role),
      user.actif ? 'Actif' : 'Inactif',
      this.csvExport.escapeCSV(user.nomService || '-')
    ]);

    this.csvExport.export(headers, rows, 'utilisateurs');
  }
}
