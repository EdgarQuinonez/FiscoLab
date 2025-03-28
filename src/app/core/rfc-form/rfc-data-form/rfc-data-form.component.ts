import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  GenerateRfcPf,
  GenerateRfcPfSuccessResponse,
  GenerateRfcPm,
  GenerateRfcPmSuccessReponse,
  RFC,
  RFCWithData,
} from '@shared/services/rfc.service.interface';
import { LoadingState, TipoSujetoCode } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
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

@Component({
  selector: 'app-rfc-data-form',
  imports: [
    ButtonModule,
    DatePickerModule,
    MessageModule,
    InputTextModule,
    TipoSujetoControlComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './rfc-data-form.component.html',
  styleUrl: './rfc-data-form.component.scss',
})
export class RfcDataFormComponent {
  rfcForm = new FormGroup({
    tipoSujeto: new FormControl('', Validators.required),
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
    data: new FormGroup({
      cp: new FormControl(''),
    }),
  });

  loading = false;

  rfcFormResponse$: Observable<LoadingState<RFC | RFCWithData>> | null = null;
  dataStatus: { dataIsRequired: boolean } = { dataIsRequired: false };
  responseError: string | null = null;
  tipoSujeto: TipoSujetoCode | null = null;

  constructor(private rfcService: RfcService) {}

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
      const pmForm = this.rfcForm.get('pmDataForm') as FormGroup;
      const pfForm = this.rfcForm.get('pfDataForm') as FormGroup;

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

  onSubmit() {
    this.responseError = null;
    if (this.rfcForm.invalid) {
      markAllAsDirty(this.rfcForm);
      return;
    }

    this.loading = true;
    const rfcFormValue = this.rfcForm.value as RfcFormValue;
    // console.log(rfcFormValue);
    const tipoSujeto = rfcFormValue.tipoSujeto as TipoSujetoCode;
    let rfc$: Observable<LoadingState<GenerateRfcPf | GenerateRfcPm>> | null =
      null;

    // if (tipoSujeto === 'PF') {
    //   const personalData = rfcFormValue.pfDataForm;
    //   rfc$ = new Observable((subscriber) => subscriber.next()).pipe(
    //     switchMapWithLoading(() =>
    //       this.rfcService.generateRfcPF$({
    //         ...personalData,
    //         fechaNacimiento: format(personalData.fechaNacimiento, 'yyyy-MM-dd'),
    //       })
    //     ),
    //     tap((value) => {
    //       if (value.error) {
    //         console.log(value.error);
    //       }
    //     })
    //   );
    // } else if (tipoSujeto === 'PM') {
    //   const companyData = rfcFormValue.pmDataForm;
    //   rfc$ = new Observable((subscriber) => subscriber.next()).pipe(
    //     switchMapWithLoading(() =>
    //       this.rfcService.generateRfcPM$({
    //         ...companyData,
    //         fechaConstitucion: format(
    //           companyData.fechaConstitucion,
    //           'yyyy-MM-dd'
    //         ),
    //       })
    //     )
    //   );
    // }

    // if (this.dataStatus.dataIsRequired) {
    //   if (rfc$) {
    //     rfc$
    //       .pipe(
    //         switchMapWithLoading(
    //           (value: LoadingState<GenerateRfcPfSuccessResponse | GenerateRfcPmSuccessReponse>) => {
    //             // TODO: analyze if I know for sure only success responses reach here and data is defined
    //             const response = value.data?.response;

    //             return this.rfcService.validateRFCWithData$({
    //               rfc: response.rfc,
    //               cp: rfcFormValue.data.cp,
    //               nombre:
    //                 rfcFormValue.tipoSujeto === 'PM'
    //                   ? rfcFormValue.pmDataForm.razonSocial
    //                   : `${rfcFormValue.pfDataForm.nombres} ${rfcFormValue.pfDataForm.apellidoPaterno} ${rfcFormValue.pfDataForm.apellidoMaterno}`,
    //             });
    //           }
    //         )
    //       )
    //       .subscribe((value) => {
    //         this.loading = value.loading;
    //       });
    //   }
    // } else {
    // }
  }
}
