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
  private tacheEvents = new Subject<any>();

  tacheEvents$ = this.tacheEvents.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    const token = isPlatformBrowser(platformId) ? localStorage.getItem('token') : null;

    this.client = new Client({
      brokerURL: environment.wsUrl,
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      reconnectDelay: 5000
    });

    this.client.onConnect = () => {
      this.client.subscribe('/topic/taches', (message) => {
        this.tacheEvents.next(JSON.parse(message.body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Erreur STOMP :', frame.headers['message']);
    };

    // pas de WebSocket cote serveur
    if (isPlatformBrowser(platformId)) {
      this.client.activate();
    }
  }
}
