import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'
import { CurpService } from '../services/curp.service';
@Component({
  selector: 'app-home',
  imports: [InputTextModule, ReactiveFormsModule, ButtonModule],
  providers: [CurpService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  curpControl = new FormControl('');

  constructor(private curpService: CurpService) {}


  onSubmit() {
    console.log('submitted.')
    const curp = this.curpControl.value;
    if (typeof curp != "string") {
      console.error("No valid CURP provided.")
      return
    }
    
    this.curpService.validateCURP(curp)    
  }
}
