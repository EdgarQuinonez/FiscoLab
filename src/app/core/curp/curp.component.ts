import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
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

@Component({
  selector: 'app-curp',
  imports: [InputTextModule, ReactiveFormsModule, ButtonModule],
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
  }

  formSubmitSubject() {
    console.log('Submit btn clicked.');
    console.log('form status: ', this.curpForm.status);
    console.log(
      'Sync validation :',
      this.curpForm.controls['curp'].hasError('required')
    );
    console.log(
      'Async validation :',
      this.curpForm.controls['curp'].getError('curpFoundAndValid')
    );

    return new Subject()
      .pipe(
        tap(() => this.curpForm.markAsDirty()),
        switchMap(() =>
          this.curpForm.statusChanges.pipe(
            startWith(this.curpForm.status),
            filter((status) => status !== 'PENDING'),
            take(1)
          )
        ),
        filter((status) => status === 'VALID' || status === 'INVALID')
      )
      .subscribe((validationSuccesful) => this.onSubmit());
  }

  onSubmit() {
    console.log('submitted.');
    console.log(this.curpForm.controls['curp'].getError('curpFoundAndValid'));
    this.curpResponse = this.curpService.getCurpResponse();
    if (this.curpResponse) {
      console.log(this.curpResponse);
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
