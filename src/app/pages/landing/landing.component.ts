import { Component } from '@angular/core';
import { MainFormComponent } from '@core/main-form/main-form.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-landing',
  imports: [ButtonModule, CardModule, MainFormComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {}
