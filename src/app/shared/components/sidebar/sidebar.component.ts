import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { StorageService } from '@shared/services/storage.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    MenuModule,
    ButtonModule,
    BadgeModule,
    RippleModule,
    AvatarModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [{ label: 'Datos Generales', icon: 'pi pi-user' }];
  }
}
