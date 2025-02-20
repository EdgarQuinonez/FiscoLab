import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'
import { CurpService } from '../services/curp.service';
import { Console } from 'node:console';
@Component({
  selector: 'app-home',
  imports: [InputTextModule, ReactiveFormsModule, ButtonModule],
  providers: [CurpService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {  

  constructor(private curpService: CurpService) {}

  curpForm = new FormGroup({
    curp: new FormControl('')
  })

  onSubmit() {    
    const formValues = this.curpForm.value
    
    if (typeof formValues.curp != "string") {
      console.error("No valid CURP provided.")
      return
    }
    
    this.curpService.validateCURP(formValues.curp)        
  }
}
