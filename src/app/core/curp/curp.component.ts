import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

import { CurpService } from './curp.service';
import { Curp, CurpRequestBody, CurpResponse } from './curp.interface';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import {
  filter,
  Observable,
  startWith,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@types';
import { CurpFoundAndValidValidator } from './curp.validator';
import { CurpByDataComponent } from './curp-by-data/curp-by-data.component';
import { TabsModule } from 'primeng/tabs';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-curp',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    CurpByDataComponent,
    TabsModule,
    MessageModule,
  ],
  templateUrl: './curp.component.html',
  styleUrl: './curp.component.scss',
})
export class CurpComponent {
  constructor(
    private curpValidator: CurpFoundAndValidValidator,
    private curpService: CurpService,
    private router: Router,
    private storageService: StorageService
  ) {}
  curpForm!: FormGroup;
  loading: boolean = false;
  formSubmitSubject$ = new Subject();
  // curpResponse$!: Observable<LoadingState<Curp>>;
  curpResponse: Curp | null = null;

  ngOnInit() {
    this.curpForm = new FormGroup({
      curp: new FormControl('', {
        validators: [Validators.required],
        asyncValidators: [this.curpValidator.validate.bind(this.curpValidator)],
        updateOn: 'submit',
      }),
    });

    this.formSubmitSubject$
      .pipe(
        tap(() => this.curpForm.markAsDirty()),
        switchMap(() =>
          this.curpForm.statusChanges.pipe(
            startWith(this.curpForm.status),
            filter((status) => {
              this.loading = status === 'PENDING';
              return status !== 'PENDING';
            }),
            take(1)
          )
        ),
        filter((status) => status === 'VALID')
      )
      .subscribe((validationSuccesful) => this.onSubmit());
  }

  onSubmit() {
    // this.loading = false;
    this.curpResponse = this.curpService.getCurpResponse();
    if (this.curpResponse) {
      if (this.curpResponse.status === 'SUCCESS') {
        if (this.curpResponse.response.status === 'FOUND') {
          this.router.navigateByUrl('dashboard');

          this.storageService.setItem('curp', this.curpResponse.response.curp);
          this.storageService.setItem(
            'personalData',
            JSON.stringify(this.curpResponse.response)
          );
        }
      }
    }
  }
}
