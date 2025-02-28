import { Routes } from '@angular/router';
import { BuroFisicaComponent } from '@core/buro/buro-fisica/buro-fisica.component';
import { CurpComponent } from '@core/curp/curp.component';
import { RfcFisicaComponent } from '@core/sat/rfc/rfc-fisica/rfc-fisica.component';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { LandingComponent } from '@pages/landing/landing.component';


export const routes: Routes = [
    { path: '', component: LandingComponent},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'bc-pf', component: BuroFisicaComponent },
    { path: 'sat/rfc-pf', component: RfcFisicaComponent }
];
