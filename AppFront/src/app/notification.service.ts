import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Evite de repeter le meme bloc snackBar.open(...) partout : la config
// (position, bouton, classe css) etait dupliquee dans presque chaque methode.
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  succes(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  erreur(message: string, duration = 5000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}
