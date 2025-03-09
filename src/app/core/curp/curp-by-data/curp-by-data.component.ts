import { Component } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import curpCatalog from '@core/curp/curp.catalog.json';
import { format } from 'date-fns';

import {
  CurpByData,
  CurpValidateByDataRequest,
  Gender,
  GenderCode,
} from '@core/curp/curp.interface';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CurpService } from '@core/curp/curp.service';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@shared/types';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-curp-by-data',
  imports: [
    InputText,
    DatePickerModule,
    AutoCompleteModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './curp-by-data.component.html',
  styleUrl: './curp-by-data.component.scss',
})
export class CurpByDataComponent {
  constructor(
    private curpService: CurpService,
    private router: Router,
    private storageService: StorageService
  ) {}

  validateCurpResponse$: Observable<LoadingState<CurpByData>> | null = null;

  gender: {
    name: string;
    code: string;
  }[] = [];

  states: {
    name: string;
    code: string;
  }[] = [];

  // TODO: 'Complete' method for gender and states items

  dataForm = new FormGroup({
    primerApellido: new FormControl('', Validators.required),
    segundoApellido: new FormControl(''),
    nombres: new FormControl('', Validators.required),
    fechaNacimiento: new FormControl(new Date(), Validators.required),
    sexo: new FormControl({}, Validators.required),
    claveEntidad: new FormControl({}, Validators.required),
  });

  ngOnInit() {
    // init gender
    for (const [code, name] of Object.entries(curpCatalog.GENDER)) {
      this.gender.push({
        name,
        code,
      });
    }

    // init states
    for (const [code, name] of Object.entries(curpCatalog.STATES)) {
      this.states.push({
        name,
        code,
      });
    }
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      return;
    }

    const data = this.dataForm.value;

    const requestBody: CurpValidateByDataRequest = {
      primerApellido: data.primerApellido as string,
      segundoApellido: data.segundoApellido,
      nombres: data.nombres as string,
      fechaNacimiento: format(data.fechaNacimiento as Date, 'yyyy-MM-dd'),
      claveEntidad: (data.claveEntidad as { name: string; code: string }).code,
      sexo: (data.sexo as { name: string; code: string }).code,
    };

    this.validateCurpResponse$ = new Observable((subscriber) =>
      subscriber.next()
    ).pipe(
      switchMapWithLoading<CurpByData>(() =>
        this.curpService.validateCurpByData$(requestBody)
      )
    );

    this.validateCurpResponse$.subscribe((value) => {
      if (value.data) {
        if (value.data.status === 'SUCCESS') {
          const response = value.data.response;
          if (response.status === 'FOUND') {
            this.router.navigateByUrl('dashboard');

            this.storageService.setItem('curp', response.curp);
            this.storageService.setItem(
              'personalData',
              JSON.stringify(response)
            );
          }
        }
      }

      if (value.error) {
        // TODO: Handle NOT_VALID, NOT_FOUND
        // Handle: SERVICE_UNAVAILABLE and BAD REQUESTS.
      }
    });
  }
}
