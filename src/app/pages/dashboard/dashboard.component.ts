import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { CardModule } from 'primeng/card';
import { StorageService } from '@shared/services/storage.service';
import { CommonModule } from '@angular/common';
import { TipoSujetoCode } from '@shared/types';
import { DashboardPfComponent } from './dashboard-pf/dashboard-pf.component';
import { DashboardPmComponent } from './dashboard-pm/dashboard-pm.component';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardPfComponent, DashboardPmComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  tipoSujeto: TipoSujetoCode | null = null;

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit() {
    this.tipoSujeto = this.storageService.getItemValue(
      'TIPO_SUJETO'
    ) as TipoSujetoCode | null;

    if (!this.tipoSujeto) {
      this.router.navigateByUrl('home');
      throw new Error('No existe la clave tipoSujeto en el localStorage');
    }
  }
}
