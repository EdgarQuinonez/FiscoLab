import { Component } from '@angular/core';
import { CurpComponent } from '@core/curp/curp.component';
import { RfcFormComponent } from '@core/rfc-form/rfc-form.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { TopbarComponent } from '@shared/components/topbar/topbar.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-landing',
  imports: [
    ButtonModule,
    CurpComponent,
    HeaderComponent,
    CardModule,
    RfcFormComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  queryMethod: 'curp' | 'rfc' = 'curp';

  changeQueryMethod(method: 'curp' | 'rfc') {
    this.queryMethod = method;
  }
}
