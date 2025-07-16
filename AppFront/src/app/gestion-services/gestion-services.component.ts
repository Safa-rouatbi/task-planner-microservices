import { Component, OnInit } from '@angular/core';
import { Service } from '../model/service.model';
import { ServiceService } from '../service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutService } from '../layout.service';
import { SidebarFooterComponent } from '../shared/sidebar-footer/sidebar-footer.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-gestion-services',
  imports: [CommonModule, FormsModule, MatSnackBarModule, SidebarFooterComponent],
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
    private snackBar: MatSnackBar,
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
        this.showMessage('Erreur lors du chargement des services.', 'error');
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.service.nomService.trim()) {
      this.showMessage('Le nom du service est obligatoire.', 'error');
      return;
    }

    if (this.editing) {
      this.serviceService.update(this.service.id!, this.service).subscribe({
        next: (updated) => {
          this.resetForm();
          this.loadServices();
          this.showMessage(`Service "${updated.nomService}" mis à jour.`, 'success');
        },
        error: () => this.showMessage("Échec de la mise à jour.", 'error')
      });
    } else {
      this.serviceService.create(this.service).subscribe({
        next: (created) => {
          this.resetForm();
          this.loadServices();
          this.showMessage(`Service "${created.nomService}" ajouté.`, 'success');
        },
        error: () => this.showMessage("Échec de l'ajout.", 'error')
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
          this.showMessage('Service supprimé.', 'success');
        },
        error: () => this.showMessage("Échec de la suppression.", 'error')
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

  showMessage(text: string, type: 'success' | 'error'): void {
    this.snackBar.open(text, 'Fermer', {
      duration: type === 'error' ? 5000 : 3000,
      verticalPosition: 'top',
      panelClass: [type === 'error' ? 'snackbar-error' : 'snackbar-success']
    });
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

  navigatetocalnder() {
    this.router.navigate(['/calendrier']);
  }

  navigatetouser() {
    this.router.navigate(['/compte']);
  }

  navigatetotache() {
    this.router.navigate(['/tache']);
  }
}
