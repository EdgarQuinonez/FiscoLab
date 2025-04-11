import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GenderCode } from '@core/curp/curp.interface';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import curpCatalog from '@public/curp.catalog.json';
import { ClavesEntidades } from '@shared/types';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
@Component({
  selector: 'app-curp-data-form',
  imports: [
    ReactiveFormsModule,
    MessageModule,
    DatePickerModule,
    SelectModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    FluidModule,
  ],
  templateUrl: './curp-data-form.component.html',
  styleUrl: './curp-data-form.component.scss',
})
export class CurpDataFormComponent {
  form = new FormGroup({
    nombres: new FormControl('', Validators.required),
    primerApellido: new FormControl('', Validators.required),
    segundoApellido: new FormControl('', Validators.required),
    fechaNacimiento: new FormControl<Date | null>(null, Validators.required),
    claveEntidad: new FormControl<{
      name: string;
      code: string;
    } | null>(null, Validators.required),
    sexo: new FormControl<GenderCode | null>(null, Validators.required),
  });

  gender: {
    name: string;
    code: string;
  }[] = [];

  states: {
    name: string;
    code: string;
  }[] = [];

  statesSuggestions: {
    name: string;
    code: string;
  }[] = [];

  ngOnInit() {
    // init gender
    for (const [code, name] of Object.entries(curpCatalog.GENDER)) {
      this.gender.push({
        name,
        code,
      });
    }
    // init states
    for (const [code, name] of Object.entries(curpCatalog.STATES)) {
      this.states.push({
        name,
        code,
      });
    }
  }

  responseError: string | null = null;
  loading = false;

  searchEntidad(e: AutoCompleteCompleteEvent) {
    const query = e.query.toLowerCase();

    this.statesSuggestions = this.states.filter(
      (state) => state.name.toLowerCase().indexOf(query) === 0
    );
  }

  onSubmit() {}
  // onSubmit() {
  //   if (this.dataForm.invalid) {
  //     markAllAsDirty(this.dataForm);
  //     return;
  //   }

  //   this.loading = true;
  //   this.responseError = null;

  //   const data = this.dataForm.value;

  //   const requestBody: CurpValidateByDataRequest = {
  //     primerApellido: data.primerApellido as string,
  //     segundoApellido: data.segundoApellido,
  //     nombres: data.nombres as string,
  //     fechaNacimiento: format(data.fechaNacimiento as Date, 'yyyy-MM-dd'),
  //     claveEntidad: (data.claveEntidad as { name: string; code: string }).code,
  //     sexo: (data.sexo as { name: string; code: string }).code,
  //   };

  //   this.validateCurpResponse$ = new Observable((subscriber) => {
  //     subscriber.next();
  //   }).pipe(
  //     switchMapWithLoading<CurpByData>(() =>
  //       this.curpService.validateCurpByData$(requestBody)
  //     ),
  //     tap((value) => {
  //       this.loading = value.loading;
  //       if (value.data) {
  //         if (value.data.status === 'SUCCESS') {
  //           const response = value.data.response;
  //           if (response.status === 'FOUND') {
  //             this.router.navigateByUrl('dashboard');

  //             this.storageService.setItem('curp', response.curp);
  //             this.storageService.setItem(
  //               'personalData',
  //               JSON.stringify(response)
  //             );
  //             this.storageService.setItem('tipoSujeto', 'PF');
  //           }
  //           // TODO: Handle NOT_VALID, NOT_FOUND
  //           if (response.status === 'NOT_FOUND') {
  //             this.responseError =
  //               'No se pudo encontrar una CURP asociada en el sistema de la RENAPO.';
  //           }

  //           if (response.status === 'NOT_VALID') {
  //             this.responseError = `La CURP asociada es inválida. Código: ${response.statusCurp}.`;
  //           }
  //         }
  //       }

  //       if (value.error) {
  //         const error = value.error as
  //           | CurpBadRequestResponse
  //           | CurpValidateByDataServiceUnavailableResponse;
  //         if (error.status === 'SERVICE_ERROR') {
  //           this.responseError =
  //             'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
  //           return;
  //         }

  //         // BAD REQUEST
  //         error.error.forEach((error) => {
  //           this.dataForm.get(error.field)?.setErrors({
  //             [error.field]:
  //               error.code === 'FORMAT_ERROR'
  //                 ? 'No utilices caracteres especiales ni números.'
  //                 : 'El campo es requerido.',
  //           });
  //         });
  //       }
  //     })
  //   );

  //   this.validateCurpResponse$.subscribe();
  // }
}
