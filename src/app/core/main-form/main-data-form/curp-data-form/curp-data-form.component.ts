import { Component, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GenderCode } from '@shared/services/curp.service.interface';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import curpCatalog from '@public/curp.catalog.json';
import { ClavesEntidades, ServiceUnavailableResponse } from '@shared/types';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { markAllAsDirty } from '@shared/utils/forms';
import { CurpDataFormValue } from '@core/main-form/main-form.interface';
import { tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  CURP_STATUS_MAP,
  ValidateCurpDataBadRequestResponse,
} from '@shared/services/curp.service.interface';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { MainFormService } from '@core/main-form/main-form.service';
@Component({
  selector: 'app-curp-data-form',
  imports: [
    ReactiveFormsModule,
    MessageModule,
    DatePickerModule,
    SelectModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    FluidModule,
  ],
  templateUrl: './curp-data-form.component.html',
  styleUrl: './curp-data-form.component.scss',
})
export class CurpDataFormComponent {
  form = new FormGroup({
    nombres: new FormControl('', Validators.required),
    primerApellido: new FormControl('', Validators.required),
    segundoApellido: new FormControl(''),
    fechaNacimiento: new FormControl<Date | null>(null, Validators.required),
    claveEntidad: new FormControl<{
      name: string;
      code: string;
    } | null>(null, Validators.required),
    sexo: new FormControl<{ name: string; code: string } | null>(
      null,
      Validators.required
    ),
  });

  gender: {
    name: string;
    code: string;
  }[] = [];

  states: {
    name: string;
    code: string;
  }[] = [];

  statesSuggestions: {
    name: string;
    code: string;
  }[] = [];

  constructor(
    private mainFormService: MainFormService,
    private router: Router,
    private storageService: StorageService
  ) {}

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

  searchEntidad(e: AutoCompleteCompleteEvent) {
    const query = e.query.toLowerCase();

    this.statesSuggestions = this.states.filter(
      (state) => state.name.toLowerCase().indexOf(query) === 0
    );
  }

  onSubmit() {
    if (this.form.invalid) {
      markAllAsDirty(this.form);
      return;
    }

    this.mainFormService.loading = true;
    this.mainFormService.responseError = null;

    const formValue = this.form.value as CurpDataFormValue;

    this.mainFormService
      .validateCurpData$(formValue)
      .pipe(
        tap((value) => {
          {
            if (value === null) {
              this.mainFormService.responseError =
                'No es posible validar sin un dato ingresado.';

              return;
            }

            if (value.error) {
              this.handleErrorResponse(value.error);
              return;
            }

            // HANDLE SUCCESS CASES
            if (value.data?.status === 'SUCCESS') {
              const response = value.data.response;

              if (response.status === 'FOUND') {
                this.router.navigateByUrl('dashboard');

                this.storageService.setItem('tipoSujeto', 'PF'); // Only PF have curps.
                this.storageService.setItem('curp', response.curp);
                this.storageService.setItem(
                  'personalData',
                  JSON.stringify(response)
                );
              }

              if (response.status === 'NOT_VALID') {
                this.mainFormService.responseError = `La CURP no es válida: ${
                  response.statusCurp
                }: ${CURP_STATUS_MAP[response.statusCurp]}`;

                return;
              }

              if (response.status === 'NOT_FOUND') {
                this.mainFormService.responseError =
                  'La CURP no fue encontrada en los registros de la RENAPO.';

                return;
              }
            }
          }
        })
      )
      .subscribe((value) => {
        this.mainFormService.loading = value.loading;
      });
  }

  private handleErrorResponse(error: Error): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 503) {
        const errorData = error.error as ServiceUnavailableResponse;
        this.mainFormService.responseError =
          errorData.errorMessage ||
          'Service unavailable. Please try again later.';
      } else if (error.status === 400) {
        const errorData = error as ValidateCurpDataBadRequestResponse;

        if (Array.isArray(errorData.error)) {
          errorData.error.forEach((err) => {
            let errMsg;

            switch (err.field) {
              case 'claveEntidad':
                errMsg = 'Ingresa una clave de entidad válida.';
                break;
              case 'fechaNacimiento':
                errMsg =
                  'Ingresa una fecha de nacimiento válida en formato yyyy-MM-dd.';
                break;
              case 'nombres':
                errMsg = 'No incluyas caracteres especiales.';
                break;
              case 'primerApellido':
                errMsg = 'No incluyas caracteres especiales.';
                break;
              case 'segundoApellido':
                errMsg = 'No incluyas caracteres especiales.';
                break;
              case 'sexo':
                errMsg = 'Ingresa un valor de sexo válido (H, M o X).';
                break;
              default:
                // Default message for unknown fields
                errMsg = 'El valor ingresado no es válido.';
            }

            this.form.get(err.field)?.setErrors({
              [err.field]: errMsg,
            });
          });
        } else {
          this.mainFormService.responseError =
            error.message || 'An error occurred during validation';
        }
      } else {
        this.mainFormService.responseError =
          error.message || 'An unexpected error occurred';
      }
    }
  }
}
