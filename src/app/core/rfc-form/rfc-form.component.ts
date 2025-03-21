import { Component } from '@angular/core';
import {
  FormControl,
  FormControlStatus,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroup, InputGroupModule } from 'primeng/inputgroup';
import {
  InputGroupAddon,
  InputGroupAddonModule,
} from 'primeng/inputgroupaddon';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { TabPanel, TabsModule } from 'primeng/tabs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RfcService } from '@shared/services/rfc.service';
import {
  LoadingState,
  RFC,
  RFCWithData,
  TipoSujetoCode,
  ValidateRFCBadRequestResponse,
  ValidateRFCSuccessResponse,
  ValidateRFCWithDataBadRequestResponse,
  ValidateRFCWithDataServiceUnavailableResponse,
} from '@shared/types';
import { Observable, tap } from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { MessageModule } from 'primeng/message';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TipoSujetoControlComponent } from './tipo-sujeto-control/tipo-sujeto-control.component';
import { RfcFormValue, RfcFormWithDataValue } from './rfc-form.interface';
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
    IftaLabelModule,
    TipoSujetoControlComponent,
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
    }),
  });

  tipoSujetoOptions = [
    {
      name: 'Persona Física',
      code: 'PF',
      icon: 'pi pi-user',
    },
    {
      name: 'Persona Moral',
      code: 'PM',
      icon: 'pi pi-users',
    },
  ];

  rfcFormResponse$: Observable<LoadingState<RFC | RFCWithData>> | null = null;
  responseError: string | null = null;

  constructor(
    private rfcService: RfcService,
    private router: Router,
    private storageService: StorageService
  ) {}

  loading = false;

  // ngOnInit() {}

  onSubmit() {
    if (this.rfcForm.invalid) {
      this.rfcForm.get('rfc')?.markAsDirty();
      this.rfcForm.get('tipoSujeto')?.markAsDirty();
      return;
    }

    this.loading = true;
    const cpControl = this.rfcForm.get(['data', 'cp'] as const);
    const nombreControl = this.rfcForm.get(['data', 'nombre'] as const);
    const apellidoControl = this.rfcForm.get(['data', 'apellido'] as const);

    // if any optional field is filled then we add required validators.
    if (cpControl?.value || nombreControl?.value || apellidoControl?.value) {
      // const dataGroup = this.rfcForm.get('data');
      // console.log(dataGroup);
      // cp?.addValidators(Validators.required);
      // nombre?.addValidators(Validators.required);
      // apellido?.addValidators(Validators.required);

      // assuming we have validations to ensure the fields are filled.
      const rfcFormValue = this.rfcForm.value as RfcFormWithDataValue;
      const rfcWithDataReqBody = {
        rfc: rfcFormValue.rfc,
        cp: rfcFormValue.data.cp,
        nombre: `${rfcFormValue.data.nombre} ${rfcFormValue.data.apellido}`,
      };

      this.rfcFormResponse$ = new Observable((subscriber) =>
        subscriber.next()
      ).pipe(
        switchMapWithLoading<RFCWithData>(() =>
          this.rfcService.validateRFCWithData$(rfcWithDataReqBody)
        ),
        tap((value) => {
          if (value.data) {
            // TODO: handle SUCCESS responses NO REGISTRADO, INVALID NAME, INVALID CP.
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
                const rfcControl = this.rfcForm.get('rfc');
                if (code === 'FORMAT_ERROR') {
                  rfcControl?.setErrors({
                    rfc: 'Ingresa un RFC válido con homoclave.',
                  });
                }

                if (code === 'EMPTY_ERROR') {
                  rfcControl?.setErrors({
                    rfc: 'El campo RFC no puede estar vacío.',
                  });
                }

                if (code === 'REQUIRED_FIELD_ERROR') {
                  rfcControl?.setErrors({
                    rfc: 'El campo RFC no puede estar vacío.',
                  });
                }
              }

              if (field === 'cp') {
                if (code === 'FORMAT_ERROR') {
                  cpControl?.setErrors({
                    cp: 'Ingresa un código postal válido.',
                  });
                }

                if (code === 'EMPTY_ERROR') {
                  cpControl?.setErrors({
                    cp: 'El campo Código Postal no puede estar vacío.',
                  });
                }

                if (code === 'REQUIRED_FIELD_ERROR') {
                  cpControl?.setErrors({
                    cp: 'El campo Código Postal no puede estar vacío.',
                  });
                }
              }

              if (field === 'nombre') {
                if (code === 'EMPTY_ERROR') {
                  nombreControl?.setErrors({
                    nombre: 'El campo Nombre(s) no puede estar vacío.',
                  });
                  apellidoControl?.setErrors({
                    apellido: 'El campo Apellido no puede estar vacío.',
                  });
                }

                if (code === 'REQUIRED_FIELD_ERROR') {
                  nombreControl?.setErrors({
                    nombre: 'El campo Nombre(s) no puede estar vacío.',
                  });
                  apellidoControl?.setErrors({
                    apellido: 'El campo Apellido no puede estar vacío.',
                  });
                }
              }
            });
          }
          this.loading = false;
        })
      );

      this.rfcFormResponse$.subscribe();
    } else {
      this.validateRFC();
      // this.loading = false;
    }
  }

  validateRFC() {
    const rfcFormValue = this.rfcForm.value as RfcFormValue;

    this.rfcFormResponse$ = new Observable((subscriber) =>
      subscriber.next()
    ).pipe(
      switchMapWithLoading<RFC>(() =>
        this.rfcService.validateRFC$(rfcFormValue.rfc)
      ),
      tap((value) => {
        this.loading = value.loading;

        if (value.data) {
          const response = (value.data as ValidateRFCSuccessResponse).response;
          this.storageService.setItem('tipoSujeto', rfcFormValue.tipoSujeto);
          this.storageService.setItem('rfc', response.rfcs[0].rfc);
          this.storageService.setItem('rfcResult', response.rfcs[0].result);

          this.router.navigateByUrl('/dashboard');
        }

        if (value.error) {
          const error = (value.error as ValidateRFCBadRequestResponse).error;
          this.rfcForm.get('rfc')?.setErrors({
            rfc:
              error[0].code === 'FORMAT_ERROR'
                ? 'Ingresa un RFC válido con homoclave.'
                : '',
          });
        }
      })
    );

    this.rfcFormResponse$.subscribe();
  }

  validateRFCWithData() {}
}
