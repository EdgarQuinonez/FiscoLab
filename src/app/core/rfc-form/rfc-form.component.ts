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
  TipoSujetoCode,
  ValidateRFCBadRequestResponse,
  ValidateRFCSuccessResponse,
} from '@shared/types';
import { Observable, tap } from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { MessageModule } from 'primeng/message';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TipoSujetoControlComponent } from './tipo-sujeto-control/tipo-sujeto-control.component';
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

  rfcFormResponse$: Observable<LoadingState<RFC>> | null = null;

  constructor(
    private rfcService: RfcService,
    private router: Router,
    private storageService: StorageService
  ) {}

  loading = false;

  // ngOnInit() {}

  onSubmit() {
    if (this.rfcForm.invalid) {
      this.rfcForm.get('tipoSujeto')?.markAsDirty();
      return;
    }

    this.loading = true;
    const cp = this.rfcForm.get(['data', 'cp'] as const);
    const nombre = this.rfcForm.get(['data', 'nombre'] as const);
    const apellido = this.rfcForm.get(['data', 'apellido'] as const);

    // if any optional field is filled then we add required validators.
    if (cp?.value || nombre?.value || apellido?.value) {
      const dataGroup = this.rfcForm.get('data');
      console.log(dataGroup);
      // cp?.addValidators(Validators.required);
      // nombre?.addValidators(Validators.required);
      // apellido?.addValidators(Validators.required);

      this.loading = false;
    } else {
      console.log(this.rfcForm.value);
      // this.validateRFC();
      this.loading = false;
    }
  }

  validateRFC() {
    const rfcFormValue = this.rfcForm.value as { rfc: string };
    console.log('validate rfc ');

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
          this.storageService.setItem(
            'tipoSujeto',
            this.rfcForm.get('tipoSujeto')?.value as string
          );
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
