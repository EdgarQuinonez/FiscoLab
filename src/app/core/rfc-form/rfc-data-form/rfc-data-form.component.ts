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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rfc-data-form',
  imports: [
    ButtonModule,
    DatePickerModule,
    MessageModule,
    InputTextModule,
    ReactiveFormsModule,
  ],
  templateUrl: './rfc-data-form.component.html',
  styleUrl: './rfc-data-form.component.scss',
})
export class RfcDataFormComponent {
  rfcForm = new FormGroup({
    pfDataForm: new FormGroup({
      nombres: new FormControl(''),
      apellidoPaterno: new FormControl(''),
      apellidoMaterno: new FormControl(''),
      fechaNacimiento: new FormControl(''),
    }),
    pmDataForm: new FormGroup({
      fechaConstitucion: new FormControl(''),
      razonSocial: new FormControl(''),
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

  onSubmit() {}
}
