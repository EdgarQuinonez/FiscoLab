import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  GenerateRfcPf,
  GenerateRfcPfBadRequestResponse,
  GenerateRfcPfServiceUnavailableResponse,
  GenerateRfcPfSuccessResponse,
  GenerateRfcPm,
  GenerateRfcPmSuccessReponse,
  RFC,
  RFCWithData,
  ValidateRfcCpQueryRequest,
  ValidateRFCSuccessResponse,
  ValidateRFCWithDataBadRequestResponse,
  ValidateRFCWithDataServiceUnavailableResponse,
} from '@shared/services/rfc.service.interface';
import { LoadingState, TipoSujetoCode } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  catchError,
  debounceTime,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { TipoSujetoControlComponent } from '../tipo-sujeto-control/tipo-sujeto-control.component';
import { markAllAsDirty, updateTreeValidity } from '@shared/utils/forms';
import { RfcService } from '@shared/services/rfc.service';
import { RfcFormValue } from './rfc-data-form.interface';
import { format } from 'date-fns';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { QueryCpFormComponent } from '../query-cp-form/query-cp-form.component';
import { QueryCPFormValue } from '../query-cp-form/query-cp-form.interface';
import { RfcFormValueWithCP } from '../rfc-form.interface';
import { RfcFormService } from '../rfc-form.service';

@Component({
  selector: 'app-rfc-data-form',
  imports: [
    ButtonModule,
    DatePickerModule,
    MessageModule,
    InputTextModule,
    TipoSujetoControlComponent,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    QueryCpFormComponent,
  ],
  templateUrl: './rfc-data-form.component.html',
  styleUrl: './rfc-data-form.component.scss',
})
export class RfcDataFormComponent {
  rfcForm = new FormGroup({
    tipoSujeto: new FormControl('', Validators.required),
    data: new FormGroup({
      pfDataForm: new FormGroup({
        nombres: new FormControl('', Validators.required),
        apellidoPaterno: new FormControl('', Validators.required),
        apellidoMaterno: new FormControl(''),
        fechaNacimiento: new FormControl({}, Validators.required),
      }),
      pmDataForm: new FormGroup({
        fechaConstitucion: new FormControl({}, Validators.required),
        razonSocial: new FormControl('', Validators.required),
      }),
      cp: new FormControl(''),
    }),
  });

  loading = false;

  rfcFormResponse$: Observable<LoadingState<RFC | RFCWithData>> | null = null;
  finalResponse$: Observable<RFCWithData | RFC | null> | null = null; // should store only the final result of the validation rfc SUCCES - INVALID, SUCCESS - VALID, BAD REQUEST AND SERVICE_ERROR

  dataStatus: { dataIsRequired: boolean } = { dataIsRequired: false };
  responseError: string | null = null;
  tipoSujeto: TipoSujetoCode | null = null;

  constructor(
    private rfcService: RfcService,
    private rfcFormService: RfcFormService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.rfcForm.reset();

    const dataGroup = this.rfcForm.get('data') as FormGroup;
    dataGroup?.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          for (let fieldValue of Object.values(value)) {
            if (fieldValue) {
              // dataGroup.addValidators(Validators.required);
              return { dataIsRequired: true };
            }
          }
          // dataGroup.removeValidators(Validators.required);
          return { dataIsRequired: false };
        }),
        startWith({ dataIsRequired: false })
      )
      .subscribe((value) => {
        // const dataGroup = this.rfcForm.get('data') as FormGroup;
        this.dataStatus = value;
        if (this.dataStatus.dataIsRequired) {
          Object.keys(dataGroup.controls).forEach((name) => {
            dataGroup.get(name)?.addValidators(Validators.required);
          });
        } else {
          Object.keys(dataGroup.controls).forEach((name) => {
            dataGroup.get(name)?.removeValidators(Validators.required);
            dataGroup.get(name)?.markAsPristine();
          });
        }

        updateTreeValidity(this.rfcForm, { emitEvent: false });
      });

    this.rfcForm.get('tipoSujeto')?.valueChanges.subscribe((value) => {
      const pmForm = this.rfcForm.get([
        'data',
        'pmDataForm',
      ] as const) as FormGroup;
      const pfForm = this.rfcForm.get(['data', 'pfDataForm']) as FormGroup;

      if (value === 'PM') {
        pfForm.reset();
        Object.keys(pmForm.controls).forEach((name) => {
          pmForm.get(name)?.enable();
        });
        Object.keys(pfForm.controls).forEach((name) => {
          pfForm.get(name)?.disable();
        });
      } else if (value === 'PF' || value === null) {
        pmForm.reset();
        Object.keys(pmForm.controls).forEach((name) => {
          pmForm.get(name)?.disable();
        });
        Object.keys(pfForm.controls).forEach((name) => {
          pfForm.get(name)?.enable();
        });
      }
      this.tipoSujeto = value as TipoSujetoCode | null;
    });
  }

  // sets the CP on the field when autocomplete is successful - valid.
  autocompleteCP(eventData: QueryCPFormValue) {
    // Triggering validation errors
    if (
      this.rfcForm.get('tipoSujeto')?.invalid ||
      // this.rfcForm.get(['data', 'cp'])?.invalid ||
      this.rfcForm.get(['rfc'])?.invalid
    ) {
      markAllAsDirty(this.rfcForm);
      return;
    }

    if (
      this.rfcForm.get('tipoSujeto')?.value === 'PF' ||
      this.rfcForm.get('tipoSujeto')?.value === null
    ) {
      if (this.rfcForm.get(['data', 'pfData'])?.invalid) {
        markAllAsDirty(this.rfcForm);
        return;
      }
    } else if (this.rfcForm.get('tipoSujeto')?.value === 'PM') {
      if (this.rfcForm.get(['data', 'pmData'])?.invalid) {
        markAllAsDirty(this.rfcForm);

        return;
      }
    }
    this.loading = true;
    const formValues = this.rfcForm.value as RfcFormValueWithCP;

    const requestBody: ValidateRfcCpQueryRequest = {
      rfc: formValues.rfc,
      nombre:
        formValues.tipoSujeto === 'PF'
          ? `${formValues.data.pfData.nombre} ${formValues.data.pfData.apellido}`
          : formValues.data.pmData.razonSocial,
      estado: eventData.estado?.c_estado,
      municipio: eventData.municipio?.c_mnpio,
    };

    this.rfcFormResponse$ = this.rfcFormService.cpQuery$(requestBody);
    this.finalResponse$ = this.rfcFormService.getFinalResponse$();

    this.finalResponse$.subscribe((value) => {
      if (!value) {
        return;
      }
      if (value.status === 'SUCCESS') {
        if (this.rfcFormService.isRFCWithDataSuccess(value)) {
          const response = value.response.rfcs[0];
          if (
            response.result === 'RFC válido, y susceptible de recibir facturas'
          ) {
            this.rfcForm.get(['data', 'cp'] as const)?.setValue(response.cp);
          } else {
            this.responseError = response.result;
          }
        }
      } else if (value.status === 'SERVICE_ERROR') {
        this.responseError =
          'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
      }

      // BAD REQUEST
      if (typeof value.status === 'number') {
        const error = value.error;

        error.forEach((err) => {
          const field = err.field.slice(0, -3); // strip down index from field
          const code = err.code;

          if (field === 'rfc') {
            if (code === 'FORMAT_ERROR') {
              this.rfcForm.get('rfc')?.setErrors({
                rfc: 'Ingresa un RFC válido con homoclave.',
              });
            }
          }

          if (field === 'cp') {
            if (code === 'FORMAT_ERROR') {
              this.rfcForm.get(['data', 'cp'] as const)?.setErrors({
                cp: 'Ingresa un código postal válido.',
              });
            }
          }
        });
      }
      this.loading = false;
    });
  }

  onSubmit() {
    this.responseError = null;
    if (this.rfcForm.invalid) {
      markAllAsDirty(this.rfcForm);
      return;
    }

    this.loading = true;
    const rfcFormValue = this.rfcForm.value as RfcFormValue;

    if (rfcFormValue.tipoSujeto === 'PF') {
      this.rfcService
        .generateRfcPF$({
          nombres: rfcFormValue.pfDataForm.nombres,
          apellidoPaterno: rfcFormValue.pfDataForm.apellidoPaterno,
          apellidoMaterno: rfcFormValue.pfDataForm.apellidoMaterno,
          fechaNacimiento: format(
            rfcFormValue.pfDataForm.fechaNacimiento,
            'yyyy-MM-dd'
          ),
        })
        .pipe(
          switchMapWithLoading<RFC | RFCWithData>(
            (value: GenerateRfcPfSuccessResponse) => {
              if (this.dataStatus.dataIsRequired) {
                // VALIDATE WITH DATA

                return this.rfcService.validateRFCWithData$([
                  {
                    rfc: value.response.rfc,
                    cp: rfcFormValue.data.cp,
                    nombre: `${rfcFormValue.pfDataForm.nombres} ${rfcFormValue.pfDataForm.apellidoPaterno} ${rfcFormValue.pfDataForm.apellidoMaterno}`,
                  },
                ]);
              } else {
                return this.rfcService.validateRFC$({
                  rfcs: [{ rfc: value.response.rfc }],
                });
              }
            }
          ),
          tap((value) => {
            this.loading = value.loading;
            if (this.dataStatus.dataIsRequired) {
              // HANDLE WITH DATA RESPONSE
              if (value.data) {
                const data = value.data as RFCWithData;
                if (data.status === 'SUCCESS') {
                  const rfcResult = data.response.rfcs[0].result;
                  // RFC not valid.
                  if (
                    rfcResult != 'RFC válido, y susceptible de recibir facturas'
                  ) {
                    this.responseError = rfcResult + '.';
                  } else {
                    const response = data.response.rfcs[0];
                    this.storageService.setItem('rfc', response.rfc);
                    this.storageService.setItem('rfcResult', response.result);
                    this.storageService.setItem(
                      'tipoSujeto',
                      rfcFormValue.tipoSujeto
                    );
                    this.storageService.setItem('cp', response.cp);
                    this.storageService.setItem('nombre', response.nombre);

                    this.router.navigateByUrl('/dashboard');
                  }
                }
              }

              if (value.error) {
                const error = value.error as
                  | ValidateRFCWithDataBadRequestResponse
                  | ValidateRFCWithDataServiceUnavailableResponse;

                if (error.status === 'SERVICE_ERROR') {
                  this.responseError =
                    'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
                  return;
                }

                // BAD REQUEST
                error.error.forEach((err) => {
                  const field = err.field.slice(0, -3); // strip down index from field
                  const code = err.code;

                  // if (field === 'rfc') {
                  //   if (code === 'FORMAT_ERROR') {
                  //     this.rfcForm.get('rfc')?.setErrors({
                  //       rfc: 'Ingresa un RFC válido con homoclave.',
                  //     });
                  //   }
                  // }

                  if (field === 'cp') {
                    if (code === 'FORMAT_ERROR') {
                      this.rfcForm.get(['data', 'cp'] as const)?.setErrors({
                        cp: 'Ingresa un código postal válido.',
                      });
                    }
                  }
                });
              }
            } else {
              if (value.data) {
                const response = (value.data as ValidateRFCSuccessResponse)
                  .response;
                if (
                  response.rfcs[0].result ===
                  'RFC válido, y susceptible de recibir facturas'
                ) {
                  this.storageService.setItem(
                    'tipoSujeto',
                    rfcFormValue.tipoSujeto
                  );
                  this.storageService.setItem('rfc', response.rfcs[0].rfc);
                  this.storageService.setItem(
                    'rfcResult',
                    response.rfcs[0].result
                  );

                  this.router.navigateByUrl('/dashboard');
                }
              }
            }
          }),
          catchError(
            (
              err:
                | GenerateRfcPfBadRequestResponse
                | GenerateRfcPfServiceUnavailableResponse
            ) => {
              if (err.status === 'SERVICE_ERROR') {
                this.responseError =
                  'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
              }

              if (err.status === 400) {
                // HANDLE BAD REQUEST

                err.error.forEach((err) => {
                  const control = this.rfcForm.get(['pfDataForm', err.field]);
                  if (err.code === 'FORMAT_ERROR') {
                    control?.setErrors({
                      [err.field]: 'No uses caracteres especiales.',
                    });
                  }
                });

                this.loading = false;
              }

              return of(err);
            }
          )
        )
        .subscribe();
    }

    if (rfcFormValue.tipoSujeto === 'PM') {
      this.rfcService
        .generateRfcPM$({
          razonSocial: rfcFormValue.pmDataForm.razonSocial,
          fechaConstitucion: format(
            rfcFormValue.pmDataForm.fechaConstitucion,
            'yyyy-MM-dd'
          ),
        })
        .pipe(
          switchMapWithLoading<RFC | RFCWithData>(
            (value: GenerateRfcPmSuccessReponse) => {
              if (this.dataStatus.dataIsRequired) {
                // VALIDATE WITH DATA

                return this.rfcService.validateRFCWithData$([
                  {
                    rfc: value.response.rfc,
                    cp: rfcFormValue.data.cp,
                    nombre: rfcFormValue.pmDataForm.razonSocial,
                  },
                ]);
              } else {
                return this.rfcService.validateRFC$({
                  rfcs: [{ rfc: value.response.rfc }],
                });
              }
            }
          ),
          tap((value) => {
            this.loading = value.loading;
            if (this.dataStatus.dataIsRequired) {
              // HANDLE WITH DATA RESPONSE
              if (value.data) {
                const data = value.data as RFCWithData;
                if (data.status === 'SUCCESS') {
                  const rfcResult = data.response.rfcs[0].result;
                  // RFC not valid.
                  if (
                    rfcResult != 'RFC válido, y susceptible de recibir facturas'
                  ) {
                    this.responseError = rfcResult + '.';
                  } else {
                    const response = data.response.rfcs[0];
                    this.storageService.setItem('rfc', response.rfc);
                    this.storageService.setItem('rfcResult', response.result);
                    this.storageService.setItem(
                      'tipoSujeto',
                      rfcFormValue.tipoSujeto
                    );
                    this.storageService.setItem('cp', response.cp);
                    this.storageService.setItem('nombre', response.nombre);

                    this.router.navigateByUrl('/dashboard');
                  }
                }
              }

              if (value.error) {
                const error = value.error as
                  | ValidateRFCWithDataBadRequestResponse
                  | ValidateRFCWithDataServiceUnavailableResponse;

                if (error.status === 'SERVICE_ERROR') {
                  this.responseError =
                    'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
                  return;
                }

                // BAD REQUEST
                error.error.forEach((err) => {
                  const field = err.field.slice(0, -3); // strip down index from field
                  const code = err.code;

                  // if (field === 'rfc') {
                  //   if (code === 'FORMAT_ERROR') {
                  //     this.rfcForm.get('rfc')?.setErrors({
                  //       rfc: 'Ingresa un RFC válido con homoclave.',
                  //     });
                  //   }
                  // }

                  if (field === 'cp') {
                    if (code === 'FORMAT_ERROR') {
                      this.rfcForm.get(['data', 'cp'] as const)?.setErrors({
                        cp: 'Ingresa un código postal válido.',
                      });
                    }
                  }
                });
              }
            } else {
              if (value.data) {
                const response = (value.data as ValidateRFCSuccessResponse)
                  .response;
                if (
                  response.rfcs[0].result ===
                  'RFC válido, y susceptible de recibir facturas'
                ) {
                  this.storageService.setItem(
                    'tipoSujeto',
                    rfcFormValue.tipoSujeto
                  );
                  this.storageService.setItem('rfc', response.rfcs[0].rfc);
                  this.storageService.setItem(
                    'rfcResult',
                    response.rfcs[0].result
                  );

                  this.router.navigateByUrl('/dashboard');
                }
              }
            }
          }),
          catchError(
            (
              err:
                | GenerateRfcPfBadRequestResponse
                | GenerateRfcPfServiceUnavailableResponse
            ) => {
              if (err.status === 'SERVICE_ERROR') {
                this.responseError =
                  'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
              }

              return of(err);
            }
          )
        )
        .subscribe();
    }
  }
}
