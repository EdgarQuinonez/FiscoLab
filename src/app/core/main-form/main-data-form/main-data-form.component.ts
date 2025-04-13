import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SelectFormButtonComponent } from './select-form-button/select-form-button.component';
import { CurpDataFormComponent } from './curp-data-form/curp-data-form.component';
import { RfcDataFormComponent } from './rfc-data-form/rfc-data-form.component';

@Component({
  selector: 'app-main-data-form',
  imports: [
    ButtonModule,
    SelectFormButtonComponent,
    CurpDataFormComponent,
    RfcDataFormComponent,
  ],
  templateUrl: './main-data-form.component.html',
  styleUrl: './main-data-form.component.scss',
})
export class MainDataFormComponent {
  selectedForm: 'curp' | 'rfc' = 'curp';
}
