import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuroFisicaService } from './buro-fisica.service';
import { RequestBody } from './buro-fisica.interface';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-buro-fisica',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './buro-fisica.component.html',
  styleUrl: './buro-fisica.component.scss'
})
export class BuroFisicaComponent {
  private testCredentials = {
    claveUsuario: "KK25251001",
    contrasenaUsuario: "kiban123"
  }

  constructor(private bcpfService: BuroFisicaService) {}

  queryBuroGroup = new FormGroup({
    productoRequerido: new FormControl('', [Validators.required]),
    tipoResponsabilidad: new FormControl('', [Validators.required]),
    tipoContrato: new FormControl('', [Validators.required]),
    claveUsuario: new FormControl('', [Validators.required]),
    contrasenaUsuario: new FormControl('', [Validators.required]),
  }, )

  onSubmit() {
    if (!this.queryBuroGroup.valid) {
      console.error("All fields are required.")
      return
    }
    
    this.bcpfService.queryBuroFisica({encabezado: this.queryBuroGroup.value} as RequestBody)

    this.queryBuroGroup.reset()
  }
}
