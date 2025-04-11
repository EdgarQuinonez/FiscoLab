import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SelectFormButtonComponent } from './select-form-button/select-form-button.component';

@Component({
  selector: 'app-main-data-form',
  imports: [ButtonModule, SelectFormButtonComponent],
  templateUrl: './main-data-form.component.html',
  styleUrl: './main-data-form.component.scss',
})
export class MainDataFormComponent {}
