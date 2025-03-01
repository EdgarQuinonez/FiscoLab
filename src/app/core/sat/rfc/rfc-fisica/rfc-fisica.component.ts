import { Component } from '@angular/core';
import { RfcFisicaService } from './rfc-fisica.service';
import { from, Observable } from 'rxjs'
import { AsyncPipe } from '@angular/common';
import { StorageService } from '@shared/services/storage.service';
import { PersonalData, PFDataFromRFCResponse, ValidateRFCResult } from './rfc-fisica.interface'
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CurpResponseData } from '@core/curp/curp.interface';

@Component({
  selector: 'app-rfc-fisica',
  imports: [ButtonModule, CardModule],
  templateUrl: './rfc-fisica.component.html',
  styleUrl: './rfc-fisica.component.scss'
})
export class RfcFisicaComponent {
  rfc!: string;
  result!: ValidateRFCResult
  personalData: PersonalData | null = null
  nombres: string | null = null

  constructor(private rfcFisicaService: RfcFisicaService, private storageService: StorageService) {}
  ngOnInit() {
    this.rfcFisicaService.generateAndValidateRFC$().subscribe(value => {
      console.log(value)
      const response = value.response.rfcs[0]
      this.rfc = response.rfc
      this.result = response.result

      const personalDataStr = this.storageService.getItem("personalData")

    
      if (typeof personalDataStr === "string" && personalDataStr.length > 0) {
        const personalData: CurpResponseData = JSON.parse(personalDataStr)        
        this.nombres = personalData.nombres
      } 
      
      if (response.result === "RFC válido, y susceptible de recibir facturas") {
        this.storageService.setItem("rfc", response.rfc)        
      }
    })
  }

  getPersonalData() {
    this.rfcFisicaService.personalDataFromRFC().subscribe(value => {
      const response = value.response

      if (value.status != "SUCCESS") {
        throw new Error("Hubo un error al recuperar la información personal usando RFC.")        
      }

      if (response.estatus === "NOT_FOUND") {
        throw new Error("No se encontró información personal con el RFC.")
      }
      

      this.personalData = response
      console.log(response)
    })
  }


}
