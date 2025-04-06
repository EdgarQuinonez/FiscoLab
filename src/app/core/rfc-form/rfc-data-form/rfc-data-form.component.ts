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
import {
  addTreeValidators,
  checkAllValuesNull,
  disableAll,
  enableAll,
  markAllAsDirty,
  markAllAsPristine,
  removeTreeValidators,
  updateTreeValidity,
} from '@shared/utils/forms';
import { RfcService } from '@shared/services/rfc.service';
import { format } from 'date-fns';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { QueryCpFormComponent } from '../query-cp-form/query-cp-form.component';
import { QueryCPFormValue } from '../query-cp-form/query-cp-form.interface';
import {
  RfcDataFormFormGroup,
  RfcDataFormPFDataFormGroup,
  RfcDataFormPfDataValue,
  RfcDataFormPMDataFormGroup,
  RfcDataFormValue,
  RfcDataFormValueWithData,
  RfcFormDataValue,
  RfcFormFormGroup,
  RfcFormPFDataFormGroup,
  RfcFormPMDataFormGroup,
  RfcFormValueWithCP,
} from '../rfc-form.interface';
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
  rfcForm = new FormGroup<RfcDataFormFormGroup>({
    tipoSujeto: new FormControl<TipoSujetoCode | null>(
      null,
      Validators.required
    ),
    data: new FormGroup({
      pfData: new FormGroup<RfcDataFormPFDataFormGroup>({
        nombres: new FormControl<string | null>('', Validators.required),
        apellidoPaterno: new FormControl<string | null>(
          '',
          Validators.required
        ),
        apellidoMaterno: new FormControl<string | null>(''),
        fechaNacimiento: new FormControl<Date | null>(
          null,
          Validators.required
        ),
      }),
      pmData: new FormGroup<RfcDataFormPMDataFormGroup>({
        fechaConstitucion: new FormControl<Date | null>(
          null,
          Validators.required
        ),
        razonSocial: new FormControl<string | null>('', Validators.required),
      }),
      cp: new FormControl<string | null>(''),
    }),
  });

  generateRfcResponse$: Observable<
    GenerateRfcPf | GenerateRfcPm | Observable<LoadingState<RFCWithData | RFC>>
  > | null = null;

  loading = false;

  constructor(
    private rfcService: RfcService,
    private rfcFormService: RfcFormService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.rfcForm.reset();

    this.subscribeToDataGroupValueChanges();
    this.subscribeToTipoSujetoValueChanges();
  }

  subscribeToDataGroupValueChanges() {
    const dataGroup: RfcDataFormFormGroup['data'] = this.rfcForm.get(
      'data'
    ) as FormGroup;

    dataGroup?.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          if (checkAllValuesNull(value)) {
            return { dataIsRequired: false };
          }

          return { dataIsRequired: true };
        }),
        startWith({ dataIsRequired: false })
      )
      .subscribe((value) => {
        this.rfcFormService.dataStatus = value;
        if (this.rfcFormService.dataStatus.dataIsRequired) {
          addTreeValidators(dataGroup, Validators.required);
        } else {
          removeTreeValidators(dataGroup, Validators.required);
          markAllAsPristine(dataGroup);
        }

        updateTreeValidity(this.rfcForm, { emitEvent: false });
      });
  }

  subscribeToTipoSujetoValueChanges() {
    const pmDataGroup: FormGroup<RfcDataFormPFDataFormGroup> | null =
      this.rfcForm.get(['data', 'pmData']) as FormGroup;
    const pfDataGroup: FormGroup<RfcDataFormPMDataFormGroup> | null =
      this.rfcForm.get(['data', 'pfData']) as FormGroup;

    this.rfcForm.get('tipoSujeto')?.valueChanges.subscribe((value) => {
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
      this.rfcFormService.tipoSujeto = value;
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

    this.rfcFormService.rfcFormResponse$ =
      this.rfcFormService.cpQuery$(requestBody);
    this.rfcFormService.finalResponse$ =
      this.rfcFormService.getFinalResponse$();

    this.rfcFormService.finalResponse$.subscribe((value) => {
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
            this.rfcFormService.responseError = response.result;
          }
        }
      } else if (value.status === 'SERVICE_ERROR') {
        this.rfcFormService.responseError =
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

  getTipoSujeto() {
    return this.rfcFormService.tipoSujeto;
  }

  isDataRequired() {
    return this.rfcFormService.dataStatus.dataIsRequired;
  }

  getResponseError() {
    return this.rfcFormService.responseError;
  }

  onSubmit() {
    this.rfcFormService.responseError = null;
    if (this.rfcForm.invalid) {
      markAllAsDirty(this.rfcForm);
      return;
    }

    this.loading = true;

    // Get form value with proper typing (non-nullable)
    const formValue = this.rfcForm.value as RfcDataFormValue;

    if (formValue.tipoSujeto === 'PF') {
      if (this.rfcFormService.dataStatus.dataIsRequired) {
        const requestBody = this.rfcForm.value as RfcDataFormValueWithData;
        this.generateRfcResponse$ =
          this.rfcFormService.generateAndValidatePfRfcWithData$(requestBody);
      } else {
        const requestBody = this.rfcForm.value as RfcDataFormValue;

        this.generateRfcResponse$ =
          this.rfcFormService.generateAndValidatePfRfc$(requestBody);
      }
    } else if (formValue.tipoSujeto === 'PM') {
      if (this.rfcFormService.dataStatus.dataIsRequired) {
        const requestBody = this.rfcForm.value as RfcDataFormValueWithData;

        this.generateRfcResponse$ =
          this.rfcFormService.generateAndValidatePmRfcWithData$(requestBody);
      } else {
        const requestBody = this.rfcForm.value as RfcDataFormValue;

        this.generateRfcResponse$ =
          this.rfcFormService.generateAndValidatePmRfc$(requestBody);
      }
    }

    // TODO: generateRfcResponse must have either a generateRFCBadREquest or service error, or LoadingState<RFCs>
    // So first of all check if

    this.generateRfcResponse$?.pipe();

    // if (rfcFormValue.tipoSujeto === 'PF') {
    //   this.rfcFormService;
    //   this.rfcService
    //     .generateRfcPF$({
    //       nombres: rfcFormValue.pfDataForm.nombres,
    //       apellidoPaterno: rfcFormValue.pfDataForm.apellidoPaterno,
    //       apellidoMaterno: rfcFormValue.pfDataForm.apellidoMaterno,
    //       fechaNacimiento: format(
    //         rfcFormValue.pfDataForm.fechaNacimiento,
    //         'yyyy-MM-dd'
    //       ),
    //     })
    //     .pipe(
    //       switchMapWithLoading<RFC | RFCWithData>(
    //         (value: GenerateRfcPfSuccessResponse) => {
    //           if (this.isDataRequired()) {
    //             // VALIDATE WITH DATA

    //             return this.rfcService.validateRFCWithData$([
    //               {
    //                 rfc: value.response.rfc,
    //                 cp: rfcFormValue.data.cp,
    //                 nombre: `${rfcFormValue.pfDataForm.nombres} ${rfcFormValue.pfDataForm.apellidoPaterno} ${rfcFormValue.pfDataForm.apellidoMaterno}`,
    //               },
    //             ]);
    //           } else {
    //             return this.rfcService.validateRFC$({
    //               rfcs: [{ rfc: value.response.rfc }],
    //             });
    //           }
    //         }
    //       ),
    //       tap((value) => {
    //         this.loading = value.loading;
    //         if (this.rfcFormService.dataStatus.dataIsRequired) {
    //           // HANDLE WITH DATA RESPONSE
    //           if (value.data) {
    //             const data = value.data as RFCWithData;
    //             if (data.status === 'SUCCESS') {
    //               const rfcResult = data.response.rfcs[0].result;
    //               // RFC not valid.
    //               if (
    //                 rfcResult != 'RFC válido, y susceptible de recibir facturas'
    //               ) {
    //                 this.rfcFormService.responseError = rfcResult + '.';
    //               } else {
    //                 const response = data.response.rfcs[0];
    //                 this.storageService.setItem('rfc', response.rfc);
    //                 this.storageService.setItem('rfcResult', response.result);
    //                 this.storageService.setItem(
    //                   'tipoSujeto',
    //                   rfcFormValue.tipoSujeto
    //                 );
    //                 this.storageService.setItem('cp', response.cp);
    //                 this.storageService.setItem('nombre', response.nombre);

    //                 this.router.navigateByUrl('/dashboard');
    //               }
    //             }
    //           }

    //           if (value.error) {
    //             const error = value.error as
    //               | ValidateRFCWithDataBadRequestResponse
    //               | ValidateRFCWithDataServiceUnavailableResponse;

    //             if (error.status === 'SERVICE_ERROR') {
    //               this.rfcFormService.responseError =
    //                 'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
    //               return;
    //             }

    //             // BAD REQUEST
    //             error.error.forEach((err) => {
    //               const field = err.field.slice(0, -3); // strip down index from field
    //               const code = err.code;

    //               // if (field === 'rfc') {
    //               //   if (code === 'FORMAT_ERROR') {
    //               //     this.rfcForm.get('rfc')?.setErrors({
    //               //       rfc: 'Ingresa un RFC válido con homoclave.',
    //               //     });
    //               //   }
    //               // }

    //               if (field === 'cp') {
    //                 if (code === 'FORMAT_ERROR') {
    //                   this.rfcForm.get(['data', 'cp'] as const)?.setErrors({
    //                     cp: 'Ingresa un código postal válido.',
    //                   });
    //                 }
    //               }
    //             });
    //           }
    //         } else {
    //           if (value.data) {
    //             const response = (value.data as ValidateRFCSuccessResponse)
    //               .response;
    //             if (
    //               response.rfcs[0].result ===
    //               'RFC válido, y susceptible de recibir facturas'
    //             ) {
    //               this.storageService.setItem(
    //                 'tipoSujeto',
    //                 rfcFormValue.tipoSujeto
    //               );
    //               this.storageService.setItem('rfc', response.rfcs[0].rfc);
    //               this.storageService.setItem(
    //                 'rfcResult',
    //                 response.rfcs[0].result
    //               );

    //               this.router.navigateByUrl('/dashboard');
    //             }
    //           }
    //         }
    //       }),
    //       catchError(
    //         (
    //           err:
    //             | GenerateRfcPfBadRequestResponse
    //             | GenerateRfcPfServiceUnavailableResponse
    //         ) => {
    //           if (err.status === 'SERVICE_ERROR') {
    //             this.rfcFormService.responseError =
    //               'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
    //           }

    //           if (err.status === 400) {
    //             // HANDLE BAD REQUEST

    //             err.error.forEach((err) => {
    //               const control = this.rfcForm.get(['pfDataForm', err.field]);
    //               if (err.code === 'FORMAT_ERROR') {
    //                 control?.setErrors({
    //                   [err.field]: 'No uses caracteres especiales.',
    //                 });
    //               }
    //             });

    //             this.loading = false;
    //           }

    //           return of(err);
    //         }
    //       )
    //     )
    //     .subscribe();
    // }

    // if (rfcFormValue.tipoSujeto === 'PM') {
    //   this.rfcService
    //     .generateRfcPM$({
    //       razonSocial: rfcFormValue.pmDataForm.razonSocial,
    //       fechaConstitucion: format(
    //         rfcFormValue.pmDataForm.fechaConstitucion,
    //         'yyyy-MM-dd'
    //       ),
    //     })
    //     .pipe(
    //       switchMapWithLoading<RFC | RFCWithData>(
    //         (value: GenerateRfcPmSuccessReponse) => {
    //           if (this.isDataRequired()) {
    //             // VALIDATE WITH DATA

    //             return this.rfcService.validateRFCWithData$([
    //               {
    //                 rfc: value.response.rfc,
    //                 cp: rfcFormValue.data.cp,
    //                 nombre: rfcFormValue.pmDataForm.razonSocial,
    //               },
    //             ]);
    //           } else {
    //             return this.rfcService.validateRFC$({
    //               rfcs: [{ rfc: value.response.rfc }],
    //             });
    //           }
    //         }
    //       ),
    //       tap((value) => {
    //         this.loading = value.loading;
    //         if (this.rfcFormService.dataStatus.dataIsRequired) {
    //           // HANDLE WITH DATA RESPONSE
    //           if (value.data) {
    //             const data = value.data as RFCWithData;
    //             if (data.status === 'SUCCESS') {
    //               const rfcResult = data.response.rfcs[0].result;
    //               // RFC not valid.
    //               if (
    //                 rfcResult != 'RFC válido, y susceptible de recibir facturas'
    //               ) {
    //                 this.rfcFormService.responseError = rfcResult + '.';
    //               } else {
    //                 const response = data.response.rfcs[0];
    //                 this.storageService.setItem('rfc', response.rfc);
    //                 this.storageService.setItem('rfcResult', response.result);
    //                 this.storageService.setItem(
    //                   'tipoSujeto',
    //                   rfcFormValue.tipoSujeto
    //                 );
    //                 this.storageService.setItem('cp', response.cp);
    //                 this.storageService.setItem('nombre', response.nombre);

    //                 this.router.navigateByUrl('/dashboard');
    //               }
    //             }
    //           }

    //           if (value.error) {
    //             const error = value.error as
    //               | ValidateRFCWithDataBadRequestResponse
    //               | ValidateRFCWithDataServiceUnavailableResponse;

    //             if (error.status === 'SERVICE_ERROR') {
    //               this.rfcFormService.responseError =
    //                 'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
    //               return;
    //             }

    //             // BAD REQUEST
    //             error.error.forEach((err) => {
    //               const field = err.field.slice(0, -3); // strip down index from field
    //               const code = err.code;

    //               // if (field === 'rfc') {
    //               //   if (code === 'FORMAT_ERROR') {
    //               //     this.rfcForm.get('rfc')?.setErrors({
    //               //       rfc: 'Ingresa un RFC válido con homoclave.',
    //               //     });
    //               //   }
    //               // }

    //               if (field === 'cp') {
    //                 if (code === 'FORMAT_ERROR') {
    //                   this.rfcForm.get(['data', 'cp'] as const)?.setErrors({
    //                     cp: 'Ingresa un código postal válido.',
    //                   });
    //                 }
    //               }
    //             });
    //           }
    //         } else {
    //           if (value.data) {
    //             const response = (value.data as ValidateRFCSuccessResponse)
    //               .response;
    //             if (
    //               response.rfcs[0].result ===
    //               'RFC válido, y susceptible de recibir facturas'
    //             ) {
    //               this.storageService.setItem(
    //                 'tipoSujeto',
    //                 rfcFormValue.tipoSujeto
    //               );
    //               this.storageService.setItem('rfc', response.rfcs[0].rfc);
    //               this.storageService.setItem(
    //                 'rfcResult',
    //                 response.rfcs[0].result
    //               );

    //               this.router.navigateByUrl('/dashboard');
    //             }
    //           }
    //         }
    //       }),
    //       catchError(
    //         (
    //           err:
    //             | GenerateRfcPfBadRequestResponse
    //             | GenerateRfcPfServiceUnavailableResponse
    //         ) => {
    //           if (err.status === 'SERVICE_ERROR') {
    //             this.rfcFormService.responseError =
    //               'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
    //           }

    //           return of(err);
    //         }
    //       )
    //     )
    //     .subscribe();
    // }
  }
}
