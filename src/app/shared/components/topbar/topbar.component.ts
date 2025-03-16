import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-topbar',
  imports: [ButtonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  constructor(private storageService: StorageService, private router: Router) {}
  // TODO: Use service method instead when backend exists
  logout() {
    this.storageService.clear();
    this.router.navigateByUrl('/');
  }
}
