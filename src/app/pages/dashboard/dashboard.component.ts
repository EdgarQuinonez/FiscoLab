import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { CardModule } from 'primeng/card';


@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, ButtonModule, ImageModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  imagePath = {
    satLogo: "assets/SAT.png"
  }
}
