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
  GenerateRfcPm,
  GenerateRfcPmBadRequestResponse,
  GenerateRfcPmServiceUnavailableResponse,
  Rfc,
  RFCWithData,
  ValidateRfcCpQueryRequest,
} from '@shared/services/rfc.service.interface';
import { LoadingState, TipoSujetoCode } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  debounceTime,
  finalize,
  map,
  Observable,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { TipoSujetoControlComponent } from '../tipo-sujeto-control/tipo-sujeto-control.component';
import {
  disableAll,
  enableAll,
  markAllAsDirty,
  updateTreeValidity,
} from '@shared/utils/forms';
import { RfcService } from '@shared/services/rfc.service';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { QueryCpFormComponent } from '../query-cp-form/query-cp-form.component';
import { QueryCPFormValue } from '../query-cp-form/query-cp-form.interface';
import {
  RfcDataFormFormGroup,
  RfcDataFormPFDataFormGroup,
  RfcDataFormPMDataFormGroup,
  RfcDataFormValue,
  RfcDataFormValueWithData,
  RfcFormFormGroup,
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

  rfcFormResponse$: Observable<LoadingState<Rfc | RFCWithData>> | null = null;
  finalResponse$: Observable<RFCWithData | Rfc | null> | null = null; // should store only the final result of the validation rfc SUCCES - INVALID, SUCCESS - VALID, BAD REQUEST AND SERVICE_ERROR
  dataStatus!: { dataIsRequired: boolean };
  responseError: string | null = null;
  tipoSujeto: TipoSujetoCode | null = null;

  generateRfcResponse$: Observable<
    | GenerateRfcPfBadRequestResponse
    | GenerateRfcPfServiceUnavailableResponse
    | GenerateRfcPmBadRequestResponse
    | GenerateRfcPmServiceUnavailableResponse
    | Observable<LoadingState<RFCWithData | Rfc>>
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
    const dataGroup: RfcFormFormGroup['data'] = this.rfcForm.get(
      'data'
    ) as FormGroup;
    const cpControl = this.rfcForm.get(['data', 'cp'] as const);

    dataGroup?.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          if (!value.cp) {
            return {
              dataIsRequired: false,
            };
          }

          return {
            dataIsRequired: true,
          };
        }),
        startWith({
          dataIsRequired: false,
        })
      )
      .subscribe((value) => {
        if (value.dataIsRequired) {
          cpControl?.addValidators(Validators.required);
        } else {
          cpControl?.removeValidators(Validators.required);
          cpControl?.markAsPristine();
        }

        updateTreeValidity(this.rfcForm, { emitEvent: false });
        this.dataStatus = value;
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
      this.tipoSujeto = value;
    });
  }

  isAutocompleteReady() {
    const pmDataGroup = this.rfcForm.get(['data', 'pmData']);
    const pfDataGroup = this.rfcForm.get(['data', 'pfData']);
    const tipoSujetoControl = this.rfcForm.get('tipoSujeto');
    return !!(
      tipoSujetoControl?.valid &&
      (pmDataGroup?.valid || pfDataGroup?.valid)
    );
  }

  // sets the CP on the field when autocomplete is successful - valid.
  autocompleteCP(eventData: QueryCPFormValue) {
    // Triggering validation errors
    if (!this.isAutocompleteReady()) {
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
    this.finalResponse$ = this.rfcFormService.getFinalResponse$(
      this.rfcFormResponse$
    );

    this.finalResponse$?.subscribe((value) => {
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

  isGenerateResponseError(
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

  onSubmit() {
    this.responseError = null;

    if (!this.rfcForm.valid) {
      markAllAsDirty(this.rfcForm);
      return;
    }

    this.loading = true;

    const formValue = this.rfcForm.value as RfcDataFormValue;

    if (!this.generateRfcResponse$) {
      if (formValue.tipoSujeto === 'PF') {
        this.generateRfcResponse$ = this.dataStatus.dataIsRequired
          ? this.rfcFormService.generateAndValidatePfRfcWithData$(
              this.rfcForm.value as RfcDataFormValueWithData
            )
          : this.rfcFormService.generateAndValidatePfRfc$(formValue);
      } else if (formValue.tipoSujeto === 'PM') {
        this.generateRfcResponse$ = this.dataStatus.dataIsRequired
          ? this.rfcFormService.generateAndValidatePmRfcWithData$(
              this.rfcForm.value as RfcDataFormValueWithData
            )
          : this.rfcFormService.generateAndValidatePmRfc$(formValue);
      }
    }

    this.generateRfcResponse$
      ?.pipe(
        // Step 1: Handle generate Rfc response
        tap((generateResponse) => {
          if (this.isGenerateResponseError(generateResponse)) {
            this.handleGenerateErrors(generateResponse);
            throw new Error('Generation failed'); // Stop the stream
          }
          this.rfcFormResponse$ = generateResponse;
        }),
        // Step 2: If generation succeeded, validate the Rfc
        switchMap(() =>
          this.rfcFormService.getFinalResponse$(this.rfcFormResponse$)
        ),
        // Step 3: Handle the final validated response
        tap((finalResponse) => {
          this.loading = false;
          if (!finalResponse) return;

          if (finalResponse.status === 'SUCCESS') {
            this.handleSuccessResponse(finalResponse);
          } else if (finalResponse.status === 'SERVICE_ERROR') {
            this.responseError =
              'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
          } else if (typeof finalResponse.status === 'number') {
            this.handleValidationErrors(finalResponse);
          }
        }),
        // Clean up after completion
        finalize(() => {
          this.generateRfcResponse$ = null;
          this.rfcFormResponse$ = null;
          this.finalResponse$ = null;
        })
      )
      .subscribe({
        error: () => {
          this.loading = false;
        },
      });
  }

  private handleGenerateErrors(response: GenerateRfcPf | GenerateRfcPm) {
    if (response.status === 'SERVICE_ERROR') {
      this.responseError =
        'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
    } else if (typeof response.status === 'number') {
      response.error.forEach((err) => {
        const field = err.field;
        const code = err.code;

        // Handle PM fields
        if (field === 'fechaConstitucion') {
          if (code === 'FORMAT_ERROR') {
            this.rfcForm
              .get(['data', 'pmData', 'fechaConstitucion'] as const)
              ?.setErrors({
                fechaConstitucion: 'La fecha debe estar en formato yyyy-MM-dd',
              });
          }
        }

        // Handle PF fields
        if (field === 'fechaNacimiento') {
          if (code === 'FORMAT_ERROR') {
            this.rfcForm
              .get(['data', 'pfData', 'fechaNacimiento'] as const)
              ?.setErrors({
                fechaNacimiento: 'Debe estar en formato yyyy-MM-dd',
              });
          }
        }

        if (field === 'nombres') {
          if (code === 'FORMAT_ERROR') {
            this.rfcForm
              .get(['data', 'pfData', 'nombres'] as const)
              ?.setErrors({
                nombres: 'No debe contener caracteres especiales',
              });
          }
        }

        if (field === 'apellidoPaterno') {
          if (code === 'FORMAT_ERROR') {
            this.rfcForm
              .get(['data', 'pfData', 'apellidoPaterno'] as const)
              ?.setErrors({
                apellidoPaterno: 'No debe contener caracteres especiales',
              });
          }
        }

        if (field === 'apellidoMaterno') {
          if (code === 'FORMAT_ERROR') {
            this.rfcForm
              .get(['data', 'pfData', 'apellidoMaterno'] as const)
              ?.setErrors({
                apellidoMaterno: 'No debe contener caracteres especiales',
              });
          }
        }
      });
    }
  }

  private handleSuccessResponse(response: Rfc | RFCWithData) {
    if (response.status === 'SUCCESS') {
      const rfcData = response.response.rfcs[0];
      this.storageService.setItem('rfc', rfcData.rfc);
      this.storageService.setItem('result', rfcData.result);
      if (this.rfcForm.value.tipoSujeto) {
        this.storageService.setItem(
          'tipoSujeto',
          this.rfcForm.value.tipoSujeto
        );
      }

      if ('cp' in rfcData && 'nombre' in rfcData) {
        this.storageService.setItem('cp', rfcData.cp);
        this.storageService.setItem('nombre', rfcData.nombre);
      }

      if (rfcData.result === 'RFC válido, y susceptible de recibir facturas') {
        this.router.navigateByUrl('/dashboard');
      } else {
        this.responseError = rfcData.result;
      }
    }
  }

  private handleValidationErrors(response: Rfc | RFCWithData) {
    if (typeof response.status === 'number') {
      const error = response.error;
      error.forEach((err) => {
        if (err.code === 'FORMAT_ERROR') {
          if (err.field.slice(0, -3) === 'cp') {
            this.rfcForm.get(['data', 'cp'] as const)?.setErrors({
              cp: 'Ingresa un código postal válido',
            });
          }
        }
      });
    }
  }
}
