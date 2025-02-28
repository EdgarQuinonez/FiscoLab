import { Component } from '@angular/core';
import { RfcFisicaService } from './rfc-fisica.service';
import { from, Observable } from 'rxjs'
import { AsyncPipe } from '@angular/common';
import { StorageService } from '@shared/services/storage.service';
import { PFDataFromRFCResponse, ValidateRFCResult } from './rfc-fisica.interface'

@Component({
  selector: 'app-rfc-fisica',
  imports: [],
  templateUrl: './rfc-fisica.component.html',
  styleUrl: './rfc-fisica.component.scss'
})
export class RfcFisicaComponent {
  rfc!: string;
  result!: ValidateRFCResult
  // personalData!: Object

  constructor(private rfcFisicaService: RfcFisicaService, private storageService: StorageService) {}
  ngOnInit() {
    this.rfcFisicaService.generateAndValidateRFC$().subscribe(value => {
      console.log(value)
      const response = value.response.rfcs[0]
      this.rfc = response.rfc
      this.result = response.result
      
      
      if (response.result === "RFC válido, y susceptible de recibir facturas") {
        this.storageService.setItem("rfc", response.rfc)        
      }
    })
  }


}
