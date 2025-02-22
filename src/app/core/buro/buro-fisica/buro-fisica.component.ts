import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuroFisicaService } from './buro-fisica.service';
import { RequestBody } from './buro-fisica.interface';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber'
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete'
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-buro-fisica',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, InputNumberModule, AutoCompleteModule],
  templateUrl: './buro-fisica.component.html',
  styleUrl: './buro-fisica.component.scss'
})
export class BuroFisicaComponent {
  testCredentials = {
    claveUsuario: "KK25251001",
    contrasenaUsuario: "kiban123"
  }

  monedaCreditoOptions = ["MX", "USD"]
  idiomaOptions = ["SP", "EN"]


  constructor(private bcpfService: BuroFisicaService) {}

  queryBuroGroup = new FormGroup({
    encabezado: new FormGroup({
      productoRequerido: new FormControl('', [Validators.required]),
      tipoResponsabilidad: new FormControl('', [Validators.required]),
      tipoContrato: new FormControl('', [Validators.required]),
      claveUsuario: new FormControl('', [Validators.required]),
      contrasenaUsuario: new FormControl('', [Validators.required]),
      numeroReferenciaOperador: new FormControl('', [Validators.required]),
      importeContrato: new FormControl(0, [Validators.required]),
      monedaCredito: new FormControl('MX', [Validators.required]),
      idioma: new FormControl('SP', [Validators.required]),
    }),
    nombre: new FormGroup({
      apellidoPaterno: new FormControl('', [Validators.required]),
      apellidoMaterno: new FormControl('', [Validators.required]),
      primerNombre: new FormControl('', [Validators.required]),
      segundoNombre: new FormControl('', [Validators.required]),
      rfc: new FormControl('', [Validators.required]),
    }),
    domicilio: new FormGroup({
      direccion: new FormGroup({
        direccion: new FormControl('', [Validators.required]),
        cp: new FormControl('', [Validators.required]),    
      })
    })
  })

  populateForm() {
    // It should retrieve all of the known information to avoid manual input as much as possible.
    console.error('populateForm not yet implemented.')
  }

  searchMoneda(e: AutoCompleteCompleteEvent) {
    let _monedaCreditoOptions = [...this.monedaCreditoOptions]
    this.monedaCreditoOptions = e.query ? _monedaCreditoOptions.map(moneda => e.query + '-' + moneda) : _monedaCreditoOptions;
  }

  searchIdioma(e: AutoCompleteCompleteEvent) {
    let _idiomaOptions = [...this.idiomaOptions]
    this.idiomaOptions = e.query ? _idiomaOptions.map(idioma => e.query + '-' + idioma) : _idiomaOptions;
  }

  onSubmit() {
    if (!this.queryBuroGroup.valid) {
      console.error("All fields are required.")
      return
    }

    // console.log(this.queryBuroGroup.value)
    
    this.bcpfService.queryBuroFisica(this.queryBuroGroup.value as RequestBody)

    // this.queryBuroGroup.reset()
  }
}
