import { Component } from '@angular/core';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { TopbarComponent } from '../topbar/topbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-app-layout',
  imports: [
    RouterOutlet,
    ToastModule,
    TopbarComponent,
    CommonModule,
    SidebarComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {}
