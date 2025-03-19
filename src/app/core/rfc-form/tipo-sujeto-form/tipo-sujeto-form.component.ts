import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-tipo-sujeto-form',
  imports: [SelectButtonModule, ReactiveFormsModule],
  templateUrl: './tipo-sujeto-form.component.html',
  styleUrl: './tipo-sujeto-form.component.scss',
})
export class TipoSujetoFormComponent {
  tipoSujetoForm = new FormGroup({
    tipoSujeto: new FormControl('', Validators.required),
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
}
