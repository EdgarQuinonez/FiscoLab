import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TipoSujetoControlComponent } from '@core/rfc-form/tipo-sujeto-control/tipo-sujeto-control.component';
import { LoadingState, TipoSujetoCode } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ClientSideBarComponent } from './client-side-bar/client-side-bar.component';
import { SplitterModule } from 'primeng/splitter';
import { debounceTime, Observable, tap } from 'rxjs';
import { MainFormService } from '@core/main-form/main-form.service'
import { rfcValido } from '@shared/utils/isValidRfc';
import { markAllAsDirty } from '@shared/utils/forms';
import { MainFormValue } from '@core/main-form/main-form.interface';
import { Curp } from '@shared/services/curp.service.interface';
import { Rfc } from '@shared/services/rfc.service.interface'


@Component({
  selector: 'app-main-form',
  imports: [
    MessageModule,
    ButtonModule,
    TipoSujetoControlComponent,
    ReactiveFormsModule,
    CardModule,
    ClientSideBarComponent,
    SplitterModule,
  ],
  templateUrl: './main-form.component.html',
  styleUrl: './main-form.component.scss',
})
export class MainFormComponent {
  constructor(private mainFormService: MainFormService) {}

  loading = false;
  responseError: string | null = null;
  validationResponse$: Observable<null> | Observable<LoadingState<Curp>> | Observable<LoadingState<Rfc>> | null = null;

  form = new FormGroup({
    clave: new FormControl('', Validators.required),
    tipoSujeto: new FormControl<TipoSujetoCode | null>(
      null,
      Validators.required
    ),
  });

  queryMethod: 'rfc' | 'curp' = 'curp' // Enable/Disable tipoSujeto ctrl. Choose API calls to make.  

  ngOnInit() {

  }

  subscribeToClaveValueChanges() {
    this.form.get('clave')?.valueChanges.pipe(
      debounceTime(200),
      tap(value => {
        const sujetoControl = this.form.get('tipoSujeto')
        if (!value) {
          sujetoControl?.setValue('PF')
          this.queryMethod = 'curp'
        } else {
          // RFC
          if(value.length <= 13) {
            sujetoControl?.setValue(null)
            this.queryMethod = 'rfc'
          } else {
            // CURP
            sujetoControl?.setValue('PF')
            this.queryMethod = 'curp'
          }
        }

      })

    )
  }

  onSubmit() {
    this.responseError = null;
    if (this.form.invalid) {
      markAllAsDirty(this.form);
      return;
    }
    this.loading = true;

    const formValue = this.form.value as MainFormValue;
    this.validationResponse$ = this.mainFormService.validateClave$(formValue, this.queryMethod);
   
    this.finalResponse$?.subscribe((value: any) => {
      if (!value) {
        return;
      }
      
      if (value.status === 'SUCCESS') {
        if (this.mainFormService.isClaveValidationSuccess(value)) {
          const response = value.response.claves[0]; // Adjust based on actual response structure
          
          if (response.result === 'Validación exitosa') { // Adjust condition based on actual success message
            // Store necessary data and navigate
            this.storageService.setItem('clave', response.clave);
            this.storageService.setItem('result', response.result);
            
            if (this.form.value.tipoSujeto) {
              this.storageService.setItem(
                'tipoSujeto',
                this.form.value.tipoSujeto
              );
            }

            this.router.navigateByUrl('/dashboard');
          } else {
            this.responseError = response.result;
          }
        }
      } else if (value.status === 'SERVICE_ERROR') {
        this.responseError =
          'Lamentamos el inconveniente. El servicio no se encuentra disponible en este momento. Intenta más tarde.';
      }

      // Handle bad request
      if (typeof value.status === 'number') {
        const error = value.error;

        error.forEach((err: any) => {
          const field = err.field.slice(0, -3); // strip down index from field
          const code = err.code;

          if (field === 'clave') {
            if (code === 'FORMAT_ERROR') {
              this.form.get('clave')?.setErrors({
                clave: `Ingresa una ${this.queryMethod === 'rfc' ? 'RFC' : 'CURP'} válida.`,
              });
            }
          }
        });
      }

      // Reset after handling response
      this.loading = false;
      this.validationResponse$ = null;
      this.finalResponse$ = null;
    });
  }
}
