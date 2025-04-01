import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import estadosCatalog from '@public/estados.catalog.json';
import municipiosCatalog from '@public/municipio.catalog.json';

@Component({
  selector: 'app-query-cp-form',
  imports: [
    ButtonModule,
    DialogModule,
    AutoCompleteModule,
    ReactiveFormsModule,
  ],
  templateUrl: './query-cp-form.component.html',
  styleUrl: './query-cp-form.component.scss',
})
export class QueryCpFormComponent {
  visible = false;
  loading = false;

  estados = ['all', ...estadosCatalog];
  municipios = ['all'];
  // TODO: Figure out how to add default value option like "Todos" and how to handle its value, maybe null.

  queryCPForm = new FormGroup({
    estado: new FormControl(''),
    municipio: new FormControl(''),
  });

  showDialog() {
    this.visible = true;
  }

  onSubmit() {}
}
