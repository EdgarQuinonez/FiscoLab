import { Component } from '@angular/core';
import {
  FormControl,
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
import { LoadingState, ValidateRFCResponse } from '@shared/types';
import { Observable, tap } from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';

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
  ],
  templateUrl: './rfc-form.component.html',
  styleUrl: './rfc-form.component.scss',
})
export class RfcFormComponent {
  tipoSujetoForm = new FormGroup({
    tipoSujeto: new FormControl('', Validators.required),
  });

  rfcForm = new FormGroup({
    rfc: new FormControl('', Validators.required),
  });

  rfcFormResponse$: Observable<LoadingState<ValidateRFCResponse>> | null = null;

  constructor(private rfcService: RfcService) {}

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

  loading = false;

  ngOnInit() {}

  onSubmit() {
    if (this.rfcForm.invalid || this.tipoSujetoForm.invalid) {
      console.log('invalid');
      return;
    }

    this.loading = true;
    const rfcFormValue = this.rfcForm.value as { rfc: string };
    const tipoSujetoFormValue = this.tipoSujetoForm.value as {
      tipoSujeto: string;
    };

    this.rfcFormResponse$ = new Observable((subscriber) =>
      subscriber.next()
    ).pipe(
      switchMapWithLoading<ValidateRFCResponse>(() =>
        this.rfcService.validateRFC$(rfcFormValue.rfc)
      ),
      tap((value) => {
        this.loading = value.loading; // false
        // TODO: redirect to dashboard, set tipoSujeto in localStorage, set RFC storage key
      })
    );
  }
}
