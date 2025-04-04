import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RfcService } from '@shared/services/rfc.service';
import { LoadingState, TipoSujetoCode } from '@shared/types';
import { debounceTime, map, Observable, startWith, tap } from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { MessageModule } from 'primeng/message';
import { TipoSujetoControlComponent } from './tipo-sujeto-control/tipo-sujeto-control.component';
import {
  RfcFormFormGroup,
  RfcFormPFDataFormGroup,
  RfcFormPMDataFormGroup,
  RfcFormValue,
  RfcFormDataValue,
  RfcFormValueWithCP,
} from './rfc-form.interface';
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
import { RfcDataFormComponent } from './rfc-data-form/rfc-data-form.component';
import {
  RFC,
  RFCWithData,
  ValidateRFCSuccessResponse,
  ValidateRFCBadRequestResponse,
  ValidateRFCWithDataBadRequestResponse,
  ValidateRFCWithDataServiceUnavailableResponse,
  ValidateRFCWithDataRequest,
  ValidateRfcCpQueryRequest,
  ValidateRFCServiceUnavailableResponse,
} from '@shared/services/rfc.service.interface';
import { RfcFormService } from './rfc-form.service';
import { QueryCpFormComponent } from './query-cp-form/query-cp-form.component';
import { QueryCPFormValue } from './query-cp-form/query-cp-form.interface';

@Component({
  selector: 'app-rfc-form',
  imports: [
    TabsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    RadioButtonModule,
    SelectButtonModule,
    MessageModule,
    TipoSujetoControlComponent,
    RfcDataFormComponent,
    QueryCpFormComponent,
  ],
  templateUrl: './rfc-form.component.html',
  styleUrl: './rfc-form.component.scss',
})
export class RfcFormComponent {
  rfcForm = new FormGroup<RfcFormFormGroup>({
    rfc: new FormControl('', Validators.required),
    tipoSujeto: new FormControl<TipoSujetoCode | null>(
      null,
      Validators.required
    ),
    data: new FormGroup({
      pfData: new FormGroup({
        nombre: new FormControl(''),
        apellido: new FormControl(''),
      }),
      pmData: new FormGroup({
        razonSocial: new FormControl(''),
      }),
      cp: new FormControl(''),
    }),
  });

  rfcFormResponse$: Observable<LoadingState<RFC | RFCWithData>> | null = null;
  dataStatus!: { dataIsRequired: boolean };
  responseError: string | null = null;
  tipoSujeto: TipoSujetoCode | null = null;

  constructor(
    private rfcService: RfcService,
    private router: Router,
    private storageService: StorageService,
    private rfcFormService: RfcFormService
  ) {}

  loading = false;
  queryCpFormShown = false;

  ngOnInit() {
    this.subscribeToDataGroupValueChanges();
    this.subscribeToTipoSujetoValueChanges();
  }

  subscribeToDataGroupValueChanges() {
    const dataGroup: RfcFormFormGroup['data'] = this.rfcForm.get(
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
        this.dataStatus = value;
        if (this.dataStatus.dataIsRequired) {
          addTreeValidators(dataGroup, Validators.required);
        } else {
          removeTreeValidators(dataGroup, Validators.required);
          markAllAsPristine(dataGroup);
        }

        updateTreeValidity(this.rfcForm, { emitEvent: false });
      });
  }

  subscribeToTipoSujetoValueChanges() {
    const dataGroup: RfcFormFormGroup['data'] = this.rfcForm.get(
      'data'
    ) as FormGroup;
    const pmDataGroup: FormGroup<RfcFormPMDataFormGroup> | null = dataGroup.get(
      'pmData'
    ) as FormGroup;
    const pfDataGroup: FormGroup<RfcFormPFDataFormGroup> | null = dataGroup.get(
      'pfData'
    ) as FormGroup;

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

  onSubmit() {
    this.responseError = null;
    if (this.rfcForm.invalid) {
      markAllAsDirty(this.rfcForm);
      return;
    }
    this.loading = true;

    if (this.rfcFormResponse$ === null) {
      // needs to call API
      if (this.dataStatus.dataIsRequired) {
        // validation with data
        const formValue = this.rfcForm.value as RfcFormDataValue;
        this.rfcFormResponse$ =
          this.rfcFormService.validateRFCWithData$(formValue);
      } else {
        const formValue = this.rfcForm.value as RfcFormValue;
        this.rfcFormResponse$ = this.rfcFormService.validateRFC$(formValue);
      }
    }

    // Handle rfc form response SUCCESS - VALID, SUCCESS - INVALID or ERROR (BAD REQUEST AND SERVICE_UNAVAILABLE)
    this.rfcFormResponse$.subscribe((value) => {
      this.rfcFormResponse$ = null; // Reset response in case of error (meaning user manually resubmitted the form)
      this.loading = false;
      if (value.data) {
        // SUCCESS
        if (value.data.status === 'SUCCESS') {
          const response = value.data.response;
          for (let rfc of response.rfcs) {
            const result = rfc.result;
            // VALID
            if (result === 'RFC válido, y susceptible de recibir facturas') {
              const formValue = this.rfcForm.value as
                | RfcFormValue
                | RfcFormDataValue;

              this.storageService.setItem('tipoSujeto', formValue.tipoSujeto);
              this.storageService.setItem('rfc', rfc.rfc);
              this.storageService.setItem('rfcResult', rfc.result);

              this.router.navigateByUrl('/dashboard');
              break;
            } else if (
              result ===
              'El Código Postal no coincide con el registrado en el RFC'
            ) {
              // TODO: make this independent of onSubmit so autocompleteCP focuses on setting the cpControl value and submit focuses on giving feedback to the user or letting them in to the dashboard.
              continue;
            } else {
              // INVALID
              this.responseError = result;
              break;
            }
          }
        }
      }
      // BAD REQUEST or SERVICE_UNAVAILABLE
      if (value.error) {
        const error = value.error as
          | ValidateRFCBadRequestResponse
          | ValidateRFCWithDataBadRequestResponse
          | ValidateRFCServiceUnavailableResponse
          | ValidateRFCWithDataServiceUnavailableResponse;

        if (error.status === 'SERVICE_ERROR') {
          this.responseError = error.errorMessage;
        } else {
          error.error.forEach((err) => {
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
      }
    });
  }

  // sets the CP on the field when autocomplete is successful - valid.
  autocompleteCP(eventData: QueryCPFormValue) {
    if (
      this.rfcForm.get('tipoSujeto')?.invalid ||
      this.rfcForm.get(['data', 'cp'])?.invalid ||
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

    const formValues = this.rfcForm.value as RfcFormValueWithCP;

    const requestBody: ValidateRfcCpQueryRequest = {
      rfc: formValues.rfc,
      nombre:
        formValues.tipoSujeto === 'PF'
          ? `${formValues.data.pfData.nombre} ${formValues.data.pfData.nombre}`
          : formValues.data.pmData.razonSocial,
      estado: eventData.estado?.c_estado,
      municipio: eventData.municipio?.c_mnpio,
    };

    this.rfcFormResponse$ = this.rfcFormService.cpQuery$(requestBody);
  }

  handleAutoCompleteCPClick() {
    // Validate controls based on the tipoSujeto value and trigger validation errors.
    if (this.rfcForm.get('tipoSujeto')?.value === 'PF') {
      if (this.rfcForm.get('')) {
      }
    }
  }
}
