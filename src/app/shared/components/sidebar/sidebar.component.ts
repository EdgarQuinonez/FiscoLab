import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, MenuModule, BadgeModule, RippleModule, AvatarModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        separator: true
      },
      {
        label: 'Buro',
        items: [
          {
            label: 'Buro de credito',
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
          }
        ]
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
            shortcut: '⌘+O'
          },
          {
            label: 'Validacion de CEP',
            icon: 'pi pi-inbox',
          }
        ]
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
            shortcut: '⌘+O'
          },
          {
            label: 'Validacion de CEP',
            icon: 'pi pi-inbox',
          }
        ]
      },
      {
        separator: true
      }
    ];
  }
}
