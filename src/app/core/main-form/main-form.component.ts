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

  onSubmit() {
    console.log('submitted');
  }
}
