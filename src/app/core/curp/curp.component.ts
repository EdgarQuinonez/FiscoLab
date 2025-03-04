import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CurpService } from './curp.service';
import { Curp, RequestBody } from './curp.interface';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { Observable } from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@types';


@Component({
  selector: 'app-curp',
  imports: [InputTextModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './curp.component.html',
  styleUrl: './curp.component.scss'
})
export class CurpComponent {
  constructor(private curpService: CurpService, private router: Router, private storageService: StorageService) {}

  curpResponse$!: Observable<LoadingState<Curp>>

  curpForm = new FormGroup({
    curp: new FormControl('', [Validators.required, ])
  })



  onSubmit() {    
    const formValues = this.curpForm.value as RequestBody

    this.curpResponse$ = new Observable(subscriber => subscriber.next()).pipe(
      switchMapWithLoading(() => this.curpService.validateCURP$(formValues.curp))
    )

    this.curpResponse$.subscribe(value => {
      const data = value.data
      if (data?.status === "SUCCESS") {
        const response = data.response
        if (response.status === "FOUND") {
          this.router.navigateByUrl("dashboard")

          this.storageService.setItem("curp", response.curp)
          this.storageService.setItem("personalData", JSON.stringify(response))

          this.curpForm.reset()
        }
      }
    })
  //   this.curpService.validateCURP(formValues.curp as string).subscribe(value => {
  //     const response = value.response      
  //     if (value.status === "SUCCESS") {
  //       if (response.status === "FOUND") {
  //         this.router.navigateByUrl("dashboard")
          
  //         this.storageService.setItem("curp", response.curp)
  //         this.storageService.setItem("personalData", JSON.stringify(response))      
  //       }
  
  //       this.curpForm.reset()
  //     }    
  //   })
  }
}
