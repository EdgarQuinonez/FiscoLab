import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { CardModule } from 'primeng/card';
import { StorageService } from '@shared/services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule, ButtonModule, ImageModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  imagePath = {
    satLogo: 'assets/SAT.png',
  };

  tipoSujeto: string = ''

  constructor(private storageService: StorageService) { }

  ngOnInit() {
    this.tipoSujeto = (this.storageService.getItem("tipoSujeto")) as string
  }
}
