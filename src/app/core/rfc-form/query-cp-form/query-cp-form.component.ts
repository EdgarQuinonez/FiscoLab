import { Component, input, computed, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import estadosCatalog from '@public/estados.catalog.json';
import municipiosCatalog from '@public/municipio.catalog.json';
import { ClavesEstados } from '@shared/types';

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

  estados = [...estadosCatalog];
  // clave y nombre
  estadosSuggestions: { c_estado: number; d_estado: string }[] = [];
  municipios = [...municipiosCatalog['09']];
  // clave y nombre
  municipiosSuggestions: { c_mnpio: string; D_mnpio: string }[] = [];

  queryCPForm = new FormGroup({
    estado: new FormControl(''),
    municipio: new FormControl(''),
  });

  showPanel() {
    this.visible = true;
  }

  closePanel() {
    this.visible = false;
  }

  completeEstados(e: AutoCompleteCompleteEvent) {
    const query = e.query.toLowerCase();

    this.estadosSuggestions = this.estados.filter(
      (state) => state['d_estado'].toLowerCase().indexOf(query) === 0
    );
  }

  completeMunicipios(e: AutoCompleteCompleteEvent) {
    const query = e.query.toLowerCase();

    this.municipiosSuggestions = this.municipios.filter(
      (state) => state['D_mnpio'].toLowerCase().indexOf(query) === 0
    );
  }

  onSubmit() {
    if (this.queryCPForm.invalid) {
      return;
    }

    console.log(this.queryCPForm.value);
  }
}
