import { Component } from '@angular/core';
import { CurpComponent } from '@core/curp/curp.component';
import { MainFormComponent } from '@core/main-form/main-form.component';
import { RfcFormComponent } from '@core/rfc-form/rfc-form.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-landing',
  imports: [ButtonModule, CardModule, MainFormComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  queryMethod: 'curp' | 'rfc' = 'curp';

  changeQueryMethod(method: 'curp' | 'rfc') {
    this.queryMethod = method;
  }
}
