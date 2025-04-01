import { Component, input, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
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
  visible = input(false)
  // visible = false;
  loading = false;

  estados = ['all', ...estadosCatalog];
  municipios = ['all', ...municipiosCatalog["09"]];

  queryCPForm = new FormGroup({
    estado: new FormControl(''),
    municipio: new FormControl(''),
  });


  // showDialog() {
  //   this.visible = true;
  // }

  handleClose() {

  }

  onSubmit() {
    if (this.queryCPForm.invalid) {
      return
    }

    console.log(this.queryCPForm.value)
  }
}
