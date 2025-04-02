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
import { ClavesEstados, ClavesMunicipios } from '@shared/types';
import { debounceTime } from 'rxjs';
import { RfcService } from '@shared/services/rfc.service';
import { QueryCPFormValue } from './query-cp-form.interface';

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
  queryCPSubmitted = output<QueryCPFormValue>();

  visible = false;
  // loading = false;

  estados = [...estadosCatalog];
  // clave y nombre
  estadosSuggestions: { c_estado: ClavesEstados; d_estado: string }[] = [];
  municipios: { c_mnpio: ClavesMunicipios; D_mnpio: string }[] = [];
  // clave y nombre
  municipiosSuggestions: { c_mnpio: ClavesMunicipios; D_mnpio: string }[] = [];

  queryCPForm = new FormGroup({
    estado: new FormControl<{
      c_estado: ClavesEstados;
      d_estado: string;
    } | null>(null),
    municipio: new FormControl<{
      c_mnpio: ClavesMunicipios;
      D_mnpio: string;
    } | null>(null),
  });

  constructor(private rfcService: RfcService) {}

  ngOnInit() {
    this.setMunicipios();
  }

  showPanel() {
    this.visible = true;
  }

  closePanel() {
    this.visible = false;
  }

  completeEstados(e: AutoCompleteCompleteEvent) {
    const query = e.query.toLowerCase();

    this.estadosSuggestions = (
      this.estados as { c_estado: ClavesEstados; d_estado: string }[]
    ).filter((state) => state['d_estado'].toLowerCase().indexOf(query) === 0);
  }

  completeMunicipios(e: AutoCompleteCompleteEvent) {
    const query = e.query.toLowerCase();

    this.municipiosSuggestions = (
      this.municipios as { c_mnpio: ClavesMunicipios; D_mnpio: string }[]
    ).filter((state) => state['D_mnpio'].toLowerCase().indexOf(query) === 0);
  }

  setMunicipios() {
    this.queryCPForm
      .get('estado')
      ?.valueChanges.pipe(debounceTime(200))
      .subscribe((value) => {
        this.queryCPForm.get('municipio')?.reset();
        if (value) {
          this.municipios = [
            ...(municipiosCatalog[value.c_estado] as {
              c_mnpio: ClavesMunicipios;
              D_mnpio: string;
            }[]),
          ];
        }
      });
  }

  onSubmit() {
    if (this.queryCPForm.invalid) {
      return;
    }

    const queryCPFormValues = this.queryCPForm.value;

    if (this.queryCPForm.value) {
      this.queryCPSubmitted.emit(queryCPFormValues);
    }
  }
}
