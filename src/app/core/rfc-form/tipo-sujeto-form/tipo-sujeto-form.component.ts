import { Component, output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormControlStatus,
} from '@angular/forms';
import { TipoSujetoCode } from '@shared/types';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-tipo-sujeto-form',
  imports: [SelectButtonModule, ReactiveFormsModule],
  templateUrl: './tipo-sujeto-form.component.html',
  styleUrl: './tipo-sujeto-form.component.scss',
})
export class TipoSujetoFormComponent {
  valueChanged = output<
    | {
        formValue: TipoSujetoCode | undefined | null;
        formStatus: FormControlStatus;
      }
    | null
    | undefined
  >();

  tipoSujetoForm = new FormGroup({
    tipoSujeto: new FormControl('', Validators.required),
  });

  updateTipoSujetoValue() {
    this.valueChanged.emit({
      formValue: this.tipoSujetoForm.get('tipoSujeto')?.value as TipoSujetoCode,
      formStatus: this.tipoSujetoForm.status,
    });
  }

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
}
