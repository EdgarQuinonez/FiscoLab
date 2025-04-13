import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RfcDataFormValue } from '@core/main-form/main-form.interface';
import { MainFormService } from '@core/main-form/main-form.service';
import { TipoSujetoControlComponent } from '@shared/components/tipo-sujeto-control/tipo-sujeto-control.component';
import {
  GenerateRfcPf,
  GenerateRfcPm,
  RFCWithData,
  Rfc,
  GenerateRfcPfBadRequestResponse,
  GenerateRfcPfServiceUnavailableResponse,
  GenerateRfcPmBadRequestResponse,
  GenerateRfcPmServiceUnavailableResponse,
} from '@shared/services/rfc.service.interface';
import { StorageService } from '@shared/services/storage.service';
import {
  LoadingState,
  ServiceUnavailableResponse,
  TipoSujetoCode,
} from '@shared/types';
import { disableAll, enableAll, markAllAsDirty } from '@shared/utils/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { tap, Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-rfc-data-form',
  imports: [
    ButtonModule,
    DatePickerModule,
    MessageModule,
    InputTextModule,
    TipoSujetoControlComponent,
    ReactiveFormsModule,
    FluidModule,
  ],
  templateUrl: './rfc-data-form.component.html',
  styleUrl: './rfc-data-form.component.scss',
})
export class RfcDataFormComponent {
  constructor(
    private mainFormService: MainFormService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscribeToTipoSujetoValueChanges();
  }

  form = new FormGroup({
    tipoSujeto: new FormControl<TipoSujetoCode | null>(
      null,
      Validators.required
    ),
    data: new FormGroup({
      pfData: new FormGroup({
        nombres: new FormControl('', Validators.required),
        apellidoPaterno: new FormControl('', Validators.required),
        apellidoMaterno: new FormControl(''),
        fechaNacimiento: new FormControl<Date | null>(
          null,
          Validators.required
        ),
      }),
      pmData: new FormGroup({
        fechaConstitucion: new FormControl<Date | null>(
          null,
          Validators.required
        ),
        razonSocial: new FormControl('', Validators.required),
      }),
    }),
  });

  subscribeToTipoSujetoValueChanges() {
    const pmDataGroup = this.form.get(['data', 'pmData']) as FormGroup;
    const pfDataGroup = this.form.get(['data', 'pfData']) as FormGroup;

    this.form.get('tipoSujeto')?.valueChanges.subscribe((value) => {
      if (value === 'PM') {
        // disable PF controls so validation doesn't apply to them
        disableAll(pfDataGroup);
        enableAll(pmDataGroup);
        pfDataGroup.reset();
      } else if (value === 'PF' || value === null) {
        disableAll(pmDataGroup);
        enableAll(pfDataGroup);
        pmDataGroup.reset();
      }
    });
  }

  onSubmit() {
    console.log('submitted.', this.form.invalid);
    this.mainFormService.responseError = null;
    if (this.form.invalid) {
      markAllAsDirty(this.form);
      return;
    }

    this.mainFormService.loading = true;
    const formValue = this.form.value as RfcDataFormValue;

    this.mainFormService
      .generateAndValidateRfc$(formValue)
      .pipe(
        // this one here expects a successful response meaning validate response is here and therefore can have multiple success cases or validate bad request or service unavailable.
        tap((value) => {
          if (!value) {
            return;
          }

          if (this.isGenerateRfcError(value)) {
            return;
          }

          // No errors were thrown in the generate rfc process.
          value
            .pipe(
              tap((value) => {
                this.mainFormService.loading = value.loading;
                // handle success
                if (value.data) {
                  this.handleSuccessResponse(value.data);
                }

                if (value.error) {
                  this.handleValidateRfcErrors(value.error);
                }
              })
            )
            .subscribe();
        }),
        catchError((err) => {
          this.mainFormService.loading = false;
          this.handleGenerateRfcErrors(err);
          return of(null);
        })
      )
      .subscribe();
  }

  getTipoSujeto() {
    return this.form.value.tipoSujeto;
  }

  private isGenerateRfcError(
    generateResponse:
      | GenerateRfcPf
      | GenerateRfcPm
      | Observable<LoadingState<RFCWithData | Rfc>>
      | null
  ): generateResponse is
    | GenerateRfcPfBadRequestResponse
    | GenerateRfcPfServiceUnavailableResponse
    | GenerateRfcPmBadRequestResponse
    | GenerateRfcPmServiceUnavailableResponse {
    if (!generateResponse || generateResponse instanceof Observable) {
      return false;
    }

    return true;
  }

  private handleGenerateRfcErrors(error: Error) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 503) {
        const errorData = error.error as ServiceUnavailableResponse;
        this.mainFormService.responseError =
          errorData.errorMessage ||
          'Service unavailable. Please try again later.';
      } else if (error.status === 400) {
        const errorData = error.error as
          | GenerateRfcPfBadRequestResponse['error']
          | GenerateRfcPmBadRequestResponse['error'];
        errorData.forEach((err) => {
          const field = err.field;
          const code = err.code;

          // Handle PM fields
          if (field === 'fechaConstitucion') {
            if (code === 'FORMAT_ERROR') {
              this.form
                .get(['data', 'pmData', 'fechaConstitucion'] as const)
                ?.setErrors({
                  fechaConstitucion:
                    'La fecha debe estar en formato yyyy-MM-dd',
                });
            }
          }

          // Handle PF fields
          if (field === 'fechaNacimiento') {
            if (code === 'FORMAT_ERROR') {
              this.form
                .get(['data', 'pfData', 'fechaNacimiento'] as const)
                ?.setErrors({
                  fechaNacimiento: 'Debe estar en formato yyyy-MM-dd',
                });
            }
          }

          if (field === 'nombres') {
            if (code === 'FORMAT_ERROR') {
              this.form.get(['data', 'pfData', 'nombres'] as const)?.setErrors({
                nombres: 'No debe contener caracteres especiales',
              });
            }
          }

          if (field === 'apellidoPaterno') {
            if (code === 'FORMAT_ERROR') {
              this.form
                .get(['data', 'pfData', 'apellidoPaterno'] as const)
                ?.setErrors({
                  apellidoPaterno: 'No debe contener caracteres especiales',
                });
            }
          }

          if (field === 'apellidoMaterno') {
            if (code === 'FORMAT_ERROR') {
              this.form
                .get(['data', 'pfData', 'apellidoMaterno'] as const)
                ?.setErrors({
                  apellidoMaterno: 'No debe contener caracteres especiales',
                });
            }
          }
        });
      }
    }
  }

  private handleValidateRfcErrors(error: Error) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 503) {
        const errorData = error.error as ServiceUnavailableResponse;
        this.mainFormService.responseError =
          errorData.errorMessage ||
          'Service unavailable. Please try again later.';
      }
    }
  }

  private handleSuccessResponse(response: Rfc | RFCWithData) {
    if (response.status === 'SUCCESS') {
      const rfcData = response.response.rfcs[0];
      this.storageService.setItem('rfc', rfcData.rfc);
      this.storageService.setItem('result', rfcData.result);
      if (this.form.value.tipoSujeto) {
        this.storageService.setItem('tipoSujeto', this.form.value.tipoSujeto);
      }

      if (rfcData.result === 'RFC válido, y susceptible de recibir facturas') {
        this.router.navigateByUrl('/dashboard');
      } else {
        this.mainFormService.responseError = rfcData.result;
      }
    }
  }
}
