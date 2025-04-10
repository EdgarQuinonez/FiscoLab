import {
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
} from '@angular/core';
import {
  FormControlStatus,
  FormGroup,
  FormControl,
  Validators,
  NG_VALUE_ACCESSOR,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { NoopValueAccessorDirective } from '@shared/directives/noop-value-accessor.directive';
import { TipoSujetoCode } from '@shared/types';
import { injectNgControl } from '@shared/utils/injectNgControl';
import {
  SelectButtonChangeEvent,
  SelectButtonModule,
} from 'primeng/selectbutton';

@Component({
  selector: 'app-tipo-sujeto-control',
  hostDirectives: [NoopValueAccessorDirective],
  imports: [SelectButtonModule, ReactiveFormsModule],
  templateUrl: './tipo-sujeto-control.component.html',
  styleUrl: './tipo-sujeto-control.component.scss',
})
export class TipoSujetoControlComponent {
  ngControl = injectNgControl();
  isRfc = input(false);

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

  ngOnChanges() {
    this.toggleControl();
  }

  // disable/enable control and set control value based on isRfc
  toggleControl() {
    const isRfc = computed(() => this.isRfc());
    if (isRfc()) {
      this.ngControl.control.setValue(null);
      this.ngControl.control.enable();
    } else {
      // Input is curp or empty
      this.ngControl.control.setValue('PF');
      this.ngControl.control.disable();
    }
  }
}
