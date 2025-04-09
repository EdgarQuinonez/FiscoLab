import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TipoSujetoControlComponent } from '@core/rfc-form/tipo-sujeto-control/tipo-sujeto-control.component';
import { TipoSujetoCode } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ClientSideBarComponent } from './client-side-bar/client-side-bar.component';
import { SplitterModule } from 'primeng/splitter';
import { debounceTime, tap } from 'rxjs';
import { rfcValido } from '@shared/utils/isValidRfc';
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
    console.log('submitted');
  }
}
