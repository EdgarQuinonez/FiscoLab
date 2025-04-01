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
import { RfcFormValue, RfcFormWithDataValue } from './rfc-form.interface';
import { markAllAsDirty, updateTreeValidity } from '@shared/utils/forms';
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
    MatchCpButtonComponent,
    QueryCpFormComponent
  ],
  templateUrl: './rfc-form.component.html',
  styleUrl: './rfc-form.component.scss',
})
export class RfcFormComponent {
  rfcForm = new FormGroup({
    rfc: new FormControl('', Validators.required),
    tipoSujeto: new FormControl('', Validators.required),
    data: new FormGroup({
      cp: new FormControl(''),
      nombre: new FormControl(''),
      apellido: new FormControl(''),
      razonSocial: new FormControl(''),
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
  queryCpFormShown = true;

  ngOnInit() {
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
      if (value === 'PM') {
        this.rfcForm.get(['data', 'nombre'])?.reset();
        this.rfcForm.get(['data', 'apellido'])?.reset();
        this.rfcForm.get(['data', 'apellido'])?.disable();
        this.rfcForm.get(['data', 'nombre'])?.disable();
        this.rfcForm.get(['data', 'razonSocial'])?.enable();
      } else if (value === 'PF' || value === null) {
        this.rfcForm.get(['data', 'razonSocial'])?.reset();
        this.rfcForm.get(['data', 'nombre'])?.enable();
        this.rfcForm.get(['data', 'apellido'])?.enable();
        this.rfcForm.get(['data', 'razonSocial'])?.disable();
      }
      this.tipoSujeto = value as TipoSujetoCode | null;
    });
  }

  onSubmit() {
    this.rfcService.validateRFCWithDataCPLookup$('', '');
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
