import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CurpService } from './curp.service';

@Component({
  selector: 'app-curp',
  imports: [InputTextModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './curp.component.html',
  styleUrl: './curp.component.scss'
})
export class CurpComponent {
  constructor(private curpService: CurpService) {}

  curpForm = new FormGroup({
    curp: new FormControl('')
  })

  onSubmit() {    
    const formValues = this.curpForm.value
    
    // if (typeof formValues.curp != "string") {
    //   console.error("No valid CURP provided.")
    //   return
    // }
    
    this.curpService.validateCURP(formValues.curp || "")        
    
    this.curpForm.reset()
  }

}
