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
import { Observable } from 'rxjs';
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

  onSubmit() {
    if (this.curpForm.invalid) {
      return;
    }

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
