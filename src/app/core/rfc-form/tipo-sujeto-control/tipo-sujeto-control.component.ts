import { Component, computed, forwardRef, input, output } from '@angular/core';
import {
  FormControlStatus,
  FormGroup,
  FormControl,
  Validators,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NoopValueAccessorDirective } from '@shared/directives/noop-value-accessor.directive';
import { TipoSujetoCode } from '@shared/types';
import { injectNgControl } from '@shared/utils/injectNgControl';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-tipo-sujeto-control',
  imports: [SelectButtonModule],
  templateUrl: './tipo-sujeto-control.component.html',
  styleUrl: './tipo-sujeto-control.component.scss',
  hostDirectives: [NoopValueAccessorDirective],
})
export class TipoSujetoControlComponent {
  ngControl = injectNgControl();

  updateTipoSujetoValue(value: any) {
    console.log(value);
    console.log(this.ngControl.value);
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
