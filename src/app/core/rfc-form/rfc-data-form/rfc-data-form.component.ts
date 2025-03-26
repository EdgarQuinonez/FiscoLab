import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RFC, RFCWithData } from '@shared/services/rfc.service.interface';
import { LoadingState, TipoSujetoCode } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { debounceTime, map, Observable, startWith } from 'rxjs';
import { TipoSujetoControlComponent } from '../tipo-sujeto-control/tipo-sujeto-control.component';
import { markAllAsDirty, updateTreeValidity } from '@shared/utils/forms';
import { RfcService } from '@shared/services/rfc.service';
import { RfcFormValue } from './rfc-data.interface';
import { format } from 'date-fns';

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
        pmForm.reset();
        Object.keys(pmForm.controls).forEach((name) => {
          pmForm.get(name)?.enable();
        });
        Object.keys(pfForm.controls).forEach((name) => {
          pfForm.get(name)?.disable();
        });
      } else if (value === 'PF' || value === null) {
        pfForm.reset();
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
      console.log(
        this.rfcForm
          .get(['pfDataForm', 'fechaNacimiento'])
          ?.hasError('required')
      );
      markAllAsDirty(this.rfcForm);
      return;
    }

    this.loading = true;
    const rfcFormValue = this.rfcForm.value as RfcFormValue;
    console.log(rfcFormValue);
    // const tipoSujeto = rfcFormValue.tipoSujeto as TipoSujetoCode;

    // if (tipoSujeto === 'PF') {
    //   const personalData = rfcFormValue.pfDataForm;
    //   this.rfcService.generateRfcPF$({
    //     ...personalData,
    //     fechaNacimiento: format(personalData.fechaNacimiento, 'yyyy-MM-dd'),
    //   });
    // }

    // Generate either RFC and then validate based on the dataStatus.
    // if (this.dataStatus.dataIsRequired) {
    //   this.validateRFCWithData();
    // } else {
    //   this.validateRFC();
    // }
  }
}
