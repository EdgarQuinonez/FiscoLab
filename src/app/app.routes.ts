import { Routes } from '@angular/router';
import { BuroFisicaComponent } from '@core/buro/buro-fisica/buro-fisica.component';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { LandingComponent } from '@pages/landing/landing.component';
import { AppLayoutComponent } from '@shared/components/app-layout/app-layout.component';

export const routes: Routes = [
  { path: 'home', component: LandingComponent, data: { topBar: 'main' } },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'bc-pf',
        component: BuroFisicaComponent,
      },
    ],
  },
];
