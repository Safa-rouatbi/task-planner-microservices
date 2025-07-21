import { Component, Inject } from '@angular/core';
import { Tache } from '../task.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Compte } from '../user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-tache-dialog',
  imports: [FormsModule, CommonModule],
  templateUrl: './details-tache-dialog.component.html',
  styleUrl: './details-tache-dialog.component.css'
})
export class DetailsTacheDialogComponent {
   tache: Tache;
    users: Compte[];
    services: any[];

  constructor(
    public dialogRef: MatDialogRef<DetailsTacheDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tache = data.tache;
    this.users = data.users;
    this.services = data.services || [];
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({ action: 'save', tache: this.tache });
  }

  onDelete(): void {
    this.dialogRef.close({ action: 'delete', tache: this.tache });
  }

    cycleEtat(): void {
  const etats = ["A faire", "En cours", "Terminée"];
  const index = etats.indexOf(this.tache.etat);
  this.tache.etat = etats[(index + 1) % etats.length];
}

setEtat(etat: string): void {
  this.tache.etat = etat;
}

}
