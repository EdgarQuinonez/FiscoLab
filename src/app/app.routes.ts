import { Routes } from '@angular/router';
import { BuroFisicaComponent } from '@core/buro/buro-fisica/buro-fisica.component';
import { CurpComponent } from '@core/curp/curp.component';


export const routes: Routes = [
    { path: '', component: CurpComponent},
    { path: 'bc-pf', component: BuroFisicaComponent }
];
