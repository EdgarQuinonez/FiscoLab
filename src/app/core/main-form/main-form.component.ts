import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TipoSujetoControlComponent } from '@core/rfc-form/tipo-sujeto-control/tipo-sujeto-control.component';
import {
  LoadingState,
  ServiceUnavailableResponse,
  TipoSujetoCode,
} from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ClientSideBarComponent } from './client-side-bar/client-side-bar.component';
import { SplitterModule } from 'primeng/splitter';
import { debounceTime, Observable, tap } from 'rxjs';
import { MainFormService } from '@core/main-form/main-form.service';
import { rfcValido } from '@shared/utils/isValidRfc';
import { markAllAsDirty } from '@shared/utils/forms';
import { MainFormValue } from '@core/main-form/main-form.interface';
import {
  Curp,
  CURP_STATUS_MAP,
  ValidateCurpBadRequestResponse,
} from '@shared/services/curp.service.interface';
import {
  Rfc,
  ValidateRfcBadRequestResponse,
} from '@shared/services/rfc.service.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-main-form',
  imports: [
    MessageModule,
    ButtonModule,
    TipoSujetoControlComponent,
    ReactiveFormsModule,
    CardModule,
    ClientSideBarComponent,
    SplitterModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './main-form.component.html',
  styleUrl: './main-form.component.scss',
})
export class MainFormComponent {
  constructor(
    private mainFormService: MainFormService,
    private router: Router,
    private storageService: StorageService
  ) {}

  loading = false;
  responseError: string | null = null;
  validationResponse$: Observable<
    null | LoadingState<Curp> | LoadingState<Rfc>
  > | null = null;

  form = new FormGroup({
    clave: new FormControl('', Validators.required),
    tipoSujeto: new FormControl<TipoSujetoCode | null>(
      null,
      Validators.required
    ),
  });

  queryMethod: 'rfc' | 'curp' = 'curp'; // Enable/Disable tipoSujeto ctrl. Choose API calls to make.

  ngOnInit() {
    this.subscribeToClaveValueChanges();
  }

  subscribeToClaveValueChanges() {
    this.form
      .get('clave')
      ?.valueChanges.pipe(
        debounceTime(200),
        tap((value) => {
          // const sujetoControl = this.form.get('tipoSujeto');
          if (!value) {
            // sujetoControl?.setValue('PF');
            this.queryMethod = 'curp';
          } else {
            // RFC
            if (value.length <= 13) {
              // sujetoControl?.setValue(null);
              this.queryMethod = 'rfc';
            } else {
              // CURP
              // sujetoControl?.setValue('PF');
              this.queryMethod = 'curp';
            }
          }
        })
      )
      .subscribe();
  }

  onSubmit() {
    this.responseError = null;
    if (this.form.invalid) {
      markAllAsDirty(this.form);
      return;
    }
    this.loading = true;

    const formValue = this.form.value as MainFormValue;
    this.validationResponse$ = this.mainFormService.validateClave$(
      formValue,
      this.queryMethod
    );

    this.validationResponse$
      .pipe(
        tap((value) => {
          if (value === null) {
            this.responseError = 'No es posible validar sin un dato ingresado.';
            return;
          }

          if (value.error) {
            this.handleErrorResponse(value.error);
            return;
          }

          // if (value.data === null || value.data === undefined) {
          //   this.responseError = 'Validation returned no data';
          //   return;
          // }

          if (value.data?.status === 'SERVICE_ERROR') {
            this.responseError =
              'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
            return;
          }

          if (this.isRfcResponse(value.data)) {
            if (value.data.status === 'SUCCESS') {
              const response = value.data.response.rfcs[0];

              if (
                response.result !==
                'RFC válido, y susceptible de recibir facturas'
              ) {
                this.responseError = response.result;
                return;
              }

              this.storageService.setItem('rfc', response.rfc);
              this.storageService.setItem('result', response.result);

              this.router.navigateByUrl('/dashboard');
            }
            return;
          }

          // HANDLE CURP CASES
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
              this.responseError = `La CURP no es válida: ${
                response.statusCurp
              }: ${CURP_STATUS_MAP[response.statusCurp]}`;
              return;
            }

            if (response.status === 'NOT_FOUND') {
              this.responseError =
                'La CURP no fue encontrada en los registros de la RENAPO.';
              return;
            }
          }
        })
      )
      .subscribe((value) => {
        if (value) {
          this.loading = value.loading;
        } else {
          this.loading = false;
        }
      });
  }

  private handleErrorResponse(error: Error): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 503) {
        // just in case Service errors are thrown as http errors
        try {
          const errorData = error.error as ServiceUnavailableResponse;
          this.responseError =
            errorData.errorMessage ||
            'Service unavailable. Please try again later.';
        } catch (e) {
          this.responseError = 'Service unavailable. Please try again later.';
        }
      } else if (error.status === 400) {
        const errorData = error as
          | ValidateCurpBadRequestResponse
          | ValidateRfcBadRequestResponse;

        if (Array.isArray(errorData.error)) {
          errorData.error.forEach((err) => {
            // Handle RFC indexed fields (e.g., 'rfc[1]')
            if (err.field.startsWith('rfc[')) {
              // const fieldBase = err.field.slice(0, err.field.indexOf('[')); // gets 'rfc'
              // const fieldIndex = err.field.match(/\[(\d+)\]/)?.[1]; // gets the index

              this.form.get('clave')?.setErrors({
                clave: 'Ingresa un RFC válido con homoclave.',
              });
            }
            // Handle CURP single field
            else {
              this.form
                .get('clave')
                ?.setErrors({ clave: 'Ingresa una CURP válida.' });
            }
          });
        } else {
          this.responseError =
            error.message || 'An error occurred during validation';
        }
      } else {
        this.responseError = error.message || 'An unexpected error occurred';
      }
    }
  }

  private isRfcResponse(response: any): response is Rfc {
    return (
      response && response.response && Array.isArray(response.response.rfcs)
    );
  }
}
