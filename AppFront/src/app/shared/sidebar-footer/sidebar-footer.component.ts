import { Component, Input } from '@angular/core';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'app-sidebar-footer',
  standalone: true,
  imports: [],
  templateUrl: './sidebar-footer.component.html'
})
export class SidebarFooterComponent {
  @Input() userPrenom = '';
  @Input() userNom = '';

  constructor(private layout: LayoutService) {}

  deconnexion(): void {
    this.layout.deconnexion();
  }
}
