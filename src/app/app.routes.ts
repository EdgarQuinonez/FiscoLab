import { Routes } from '@angular/router';
import { BuroFisicaComponent } from '@core/buro/buro-fisica/buro-fisica.component';
import { CurpComponent } from '@core/curp/curp.component';
import { RfcFisicaComponent } from '@core/sat/rfc/rfc-fisica/rfc-fisica.component';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { LandingComponent } from '@pages/landing/landing.component';
import { AppLayoutComponent } from '@shared/components/app-layout/app-layout.component';


export const routes: Routes = [
  {
    path: '', component: AppLayoutComponent, children: [
      { path: '', component: LandingComponent, data: { topBar: "landing" } },
      { path: 'dashboard', component: DashboardComponent, data: { topBar: "main" } },
      { path: 'bc-pf', component: BuroFisicaComponent, data: { topBar: "main" } },
      { path: 'sat/rfc-pf', component: RfcFisicaComponent, data: { topBar: "main" } }
    ]
  },
];
