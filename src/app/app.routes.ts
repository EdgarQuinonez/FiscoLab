import { Routes } from '@angular/router';
import { BuroFisicaComponent } from '@core/buro/buro-fisica/buro-fisica.component';
import { CurpComponent } from '@core/curp/curp.component';
import { RfcComponent } from '@core/sat/rfc/rfc.component';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';


export const routes: Routes = [
    { path: '', component: CurpComponent},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'bc-pf', component: BuroFisicaComponent },
    { path: 'sat/rfc', component: RfcComponent  }
];
