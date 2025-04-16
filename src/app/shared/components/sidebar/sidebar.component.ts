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
  tipoPersona: 'PF' | 'PM' | null = null;

  constructor(private storageService: StorageService) {
    this.tipoPersona = this.storageService.getItem('tipoPersona') as
      | 'PF'
      | 'PM';
  }

  ngOnInit() {
    this.items = [
      {
        separator: true,
      },
      {
        label: 'Buro',
        items: [
          {
            label: 'Buro de credito',
            routerLink: '/bc-pf',
            icon: 'pi pi-plus',
          },
          {
            label: 'Circulo de credito',
            icon: 'pi pi-plus',
          },
          {
            label: 'Reporte de cretido especial',
            icon: 'pi pi-plus',
          },
          {
            label: 'NIP Buros',
            icon: 'pi pi-plus',
          },
        ],
      },
      {
        label: 'Validacion de documentos',
        items: [
          {
            label: 'Validacion de CURP',
            icon: 'pi pi-cog',
          },
          {
            label: 'Validacion RFC ante el SAT',
            icon: 'pi pi-cog',
          },
          {
            label: 'Validacion de INE',
            icon: 'pi pi-cog',
          },
          {
            label: 'Validacion de CFID',
            icon: 'pi pi-cog',
            shortcut: '⌘+O',
          },
          {
            label: 'Validacion de CEP',
            icon: 'pi pi-inbox',
          },
        ],
      },
      {
        label: 'Obtencion de informacion',
        items: [
          {
            label: 'Calculo de RFC',
            icon: 'pi pi-cog',
          },
          {
            label: 'Historial laboral ISSSTE',
            icon: 'pi pi-cog',
          },
          {
            label: 'Constancia de situacion fiscal',
            icon: 'pi pi-cog',
          },
          {
            label: 'Obtencin de NSS',
            icon: 'pi pi-cog',
            shortcut: '⌘+O',
          },
          {
            label: 'Validacion de CEP',
            icon: 'pi pi-inbox',
          },
        ],
      },
    ];
  }
}
