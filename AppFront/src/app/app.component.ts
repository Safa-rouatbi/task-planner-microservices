import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebSocketService } from './websocket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AppFront';

  // injecte juste pour que le service se cree et se connecte au demarrage de l'app
  constructor(private webSocketService: WebSocketService) {}
}
