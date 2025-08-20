import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';

// Connexion WebSocket au serveur pour recevoir les changements sur les taches
// et rafraichir le calendrier sans recharger
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;
  private estNavigateur: boolean;
  private tacheEvents = new Subject<any>();
  private presence = new Subject<string[]>();

  tacheEvents$ = this.tacheEvents.asObservable();
  presence$ = this.presence.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.estNavigateur = isPlatformBrowser(platformId);

    this.client = new Client({
      brokerURL: environment.wsUrl,
      reconnectDelay: 5000
    });

    this.client.onConnect = () => {
      this.client.subscribe('/topic/taches', (message) => {
        this.tacheEvents.next(JSON.parse(message.body));
      });

      this.client.subscribe('/topic/presence', (message) => {
        this.presence.next(JSON.parse(message.body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Erreur STOMP :', frame.headers['message']);
    };

    if (this.estNavigateur) {
      this.reconnecter();
    }
  }

  // A appeler apres un login (ou un logout) : le token dans localStorage a
  // change, il faut fermer l'ancienne connexion et en rouvrir une avec le
  // token a jour, sinon on reste connecte avec l'identite de l'ancien compte.
  reconnecter(): void {
    if (!this.estNavigateur) {
      return;
    }

    const token = localStorage.getItem('token');
    this.client.connectHeaders = {
      Authorization: token ? `Bearer ${token}` : ''
    };

    if (this.client.active) {
      this.client.deactivate().then(() => this.client.activate());
    } else {
      this.client.activate();
    }
  }
}
