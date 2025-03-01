import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CurpService } from './curp.service';
import { RequestBody } from './curp.interface';
import { Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-curp',
  imports: [InputTextModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './curp.component.html',
  styleUrl: './curp.component.scss'
})
export class CurpComponent {
  constructor(private curpService: CurpService, private router: Router, private storageService: StorageService) {}

  curpForm = new FormGroup({
    curp: new FormControl('', [Validators.required])
  })

  onSubmit() {    
    if (!this.curpForm.valid) {
      console.error("CURP field is required.")
      return
    }

    const formValues = this.curpForm.value
    
    this.curpService.validateCURP(formValues.curp as string).subscribe(value => {
      const response = value.response
      if (value.status === "SUCCESS") {
        if (response.status === "FOUND") {
          this.router.navigateByUrl("dashboard")
          
          this.storageService.setItem("curp", response.curp)
          this.storageService.setItem("personalData", JSON.stringify(response))      
        }
  
        this.curpForm.reset()
      }    
    })
  }
}
