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
  RfcFormWithDataValue,
  RfcFormWithDataValueOnCPAutocomplete,
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
} from '@shared/services/rfc.service.interface';
import { RfcFormService } from './rfc-form.service';
import { MatchCpButtonComponent } from './match-cp-button/match-cp-button.component';
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
        pmDataGroup.reset();
      } else if (value === 'PF' || value === null) {
        disableAll(pmDataGroup);
        enableAll(pfDataGroup);
        pfDataGroup.reset();
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

    if (this.dataStatus.dataIsRequired) {
      this.validateRFCWithData();
    } else {
      this.validateRFC();
    }
  }

  setQueryCPResult(eventData: QueryCPFormValue) {
    // Assuming that rfc, nombre, apellidos or razonSocial controls are valid.
    // console.log(eventData);
    // if (
    //   this.rfcForm.get('tipoSujeto')?.invalid ||
    //   this.rfcForm.get('rfc')?.invalid ||
    //   this.rfcForm.get(['data', 'nombre'] as const)?.invalid ||
    //   this.rfcForm.get(['data', 'apellido'] as const)?.invalid ||
    //   this.rfcForm.get('razonSocial')?.invalid
    // ) {
    //   this.responseError =
    //     'Revisa los campos anteriores para autocompletar el Código Postal.';
    //   return;
    // }

    const rfcFormValues = this.rfcForm
      .value as RfcFormWithDataValueOnCPAutocomplete;

    if (this.rfcForm.get('tipoSujeto')?.value === 'PF') {
      this.rfcService.validateRFCWithDataCPLookup$(
        rfcFormValues.rfc,
        `${rfcFormValues.data.nombre} ${rfcFormValues.data.apellido}`
      );
    } else if (this.rfcForm.get('tipoSujeto')?.value === 'PM') {
      this.rfcService.validateRFCWithDataCPLookup$(
        rfcFormValues.rfc,
        rfcFormValues.data.razonSocial
      );
    }

    // this.rfcForm.get('tipoSujeto')?.markAsDirty();
  }

  handleAutoCompleteCPClick() {
    // Validate controls based on the tipoSujeto value and trigger validation errors.
    if (this.rfcForm.get('tipoSujeto')?.value === 'PF') {
      if (this.rfcForm.get('')) {
      }
    }
  }

  validateRFC() {
    const rfcFormValue = this.rfcForm.value as RfcFormValue;

    this.rfcFormResponse$ = this.rfcFormService.validateRFC$(rfcFormValue);

    this.rfcFormResponse$.subscribe((value) => {
      this.loading = value.loading;

      if (value.data) {
        if (value.data.status === 'SUCCESS') {
          const rfcResult = value.data.response.rfcs[0].result;
          // RFC not valid.
          if (rfcResult != 'RFC válido, y susceptible de recibir facturas') {
            this.responseError = rfcResult + '.';
          }
        }
      }

      if (value.error) {
        // TODO: Check if service unavailable needs to be handled here as well.
        const error = (value.error as ValidateRFCBadRequestResponse).error;
        this.rfcForm.get('rfc')?.setErrors({
          rfc:
            error[0].code === 'FORMAT_ERROR'
              ? 'Ingresa un RFC válido con homoclave.'
              : '',
        });
      }
    });
  }

  validateRFCWithData() {
    const rfcFormValue = this.rfcForm.value as RfcFormWithDataValue;

    this.rfcFormResponse$ =
      this.rfcFormService.validateRFCWithData$(rfcFormValue);

    this.rfcFormResponse$.subscribe((value) => {
      this.loading = value.loading;

      if (value.data) {
        if (value.data.status === 'SUCCESS') {
          const rfcResult = value.data.response.rfcs[0].result;
          // RFC not valid.
          if (rfcResult != 'RFC válido, y susceptible de recibir facturas') {
            this.responseError = rfcResult + '.';
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
    });
  }
}
