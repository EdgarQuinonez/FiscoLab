import { Component } from '@angular/core';
import { CurpComponent } from '@core/curp/curp.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-landing',
  imports: [ButtonModule, CurpComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

}
