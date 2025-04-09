import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TipoSujetoCode } from '@shared/types';

@Component({
  selector: 'app-client-side-bar',
  imports: [
    DividerModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
  ],
  templateUrl: './client-side-bar.component.html',
  styleUrl: './client-side-bar.component.scss',
})
export class ClientSideBarComponent {
  clients = [];
  filteredClients: {
    name: string;
    tipoSujeto: TipoSujetoCode;
  }[] = [];

  ngOnInit() {
    this.filteredClients = [...this.clients];
  }

  filterClients() {}

  selectClient() {}
}
