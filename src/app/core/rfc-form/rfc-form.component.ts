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
import { LoadingState, TipoSujetoCode } from '@shared/types';
import {
  debounceTime,
  map,
  Observable,
  startWith,
} from 'rxjs';
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
  Rfc,
  RFCWithData,
  ValidateRfcCpQueryRequest,
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

  rfcFormResponse$: Observable<LoadingState<Rfc | RFCWithData>> | null = null;
  finalResponse$: Observable<RFCWithData | Rfc | null> | null = null; // should store only the final result of the validation rfc SUCCES - INVALID, SUCCESS - VALID, BAD REQUEST AND SERVICE_ERROR
  dataStatus!: { dataIsRequired: boolean };
  responseError: string | null = null;
  tipoSujeto: TipoSujetoCode | null = null;

  constructor(
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
          addTreeValidators(dataGroup, Validators.required);
        } else {
          removeTreeValidators(dataGroup, Validators.required);
          markAllAsPristine(dataGroup);
        }

        updateTreeValidity(this.rfcForm, { emitEvent: false });
        this.dataStatus = value;
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

    if (this.rfcFormResponse$ === null && this.finalResponse$ === null) {
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
      // filters response
      this.finalResponse$ = this.rfcFormService.getFinalResponse$(
        this.rfcFormResponse$
      );
    }

    // ACTUALLY REFLECT SUCCESS-VALID OR INVALID OR BAD REQUEST IN FORM.
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
            this.storageService.setItem('rfc', response.rfc);
            this.storageService.setItem('result', response.result);
            this.storageService.setItem('cp', response.cp);
            this.storageService.setItem('nombre', response.nombre);
            if (this.rfcForm.value.tipoSujeto) {
              this.storageService.setItem(
                'tipoSujeto',
                this.rfcForm.value.tipoSujeto
              );
            }

            this.router.navigateByUrl('/dashboard');
          } else {
            this.responseError = response.result;
          }
        } else {
          const response = value.response.rfcs[0];
          if (
            response.result === 'RFC válido, y susceptible de recibir facturas'
          ) {
            this.storageService.setItem('rfc', response.rfc);
            this.storageService.setItem('result', response.result);

            this.router.navigateByUrl('/dashboard');
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

      // After using the response set them to null in case of resubmitting form.
      this.loading = false;
      this.rfcFormResponse$ = null;
      this.finalResponse$ = null;
    });
  }

  // true when rest of the fields but cp are valid
  isAutocompleteReady() {
    const pmDataGroup = this.rfcForm.get(['data', 'pmData']);
    const pfDataGroup = this.rfcForm.get(['data', 'pfData']);
    const rfcControl = this.rfcForm.get('rfc');
    const tipoSujetoControl = this.rfcForm.get('tipoSujeto');
    return !!(
      tipoSujetoControl?.valid &&
      rfcControl?.valid &&
      this.dataStatus.dataIsRequired &&
      (pmDataGroup?.valid || pfDataGroup?.valid)
    );
  }

  // sets the CP on the field when autocomplete is successful - valid.
  autocompleteCP(eventData: QueryCPFormValue) {
    // Triggering validation errors
    if (!this.isAutocompleteReady()) {
      // TODO: Currently there's no intuitive way to remove validators if user decides that he didn't want to autocomplete nor validate with data.
      this.dataStatus = { dataIsRequired: true };
      const dataGroup: RfcFormFormGroup['data'] = this.rfcForm.get(
        'data'
      ) as FormGroup;
      const cpControl = this.rfcForm.get(['data', 'cp'] as const);

      addTreeValidators(dataGroup, Validators.required);
      updateTreeValidity(this.rfcForm, { emitEvent: false });

      markAllAsDirty(this.rfcForm);
      cpControl?.markAsPristine(); // USER FEEDBACK, AUTOCOMPLETE DOESN'T REQUIRE cpcontrol to have a value
      return;
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

  handleAutoCompleteCPClick() {
    // Validate controls based on the tipoSujeto value and trigger validation errors.
    if (this.rfcForm.get('tipoSujeto')?.value === 'PF') {
      if (this.rfcForm.get('')) {
      }
    }
  }
}
