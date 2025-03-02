import { Component } from '@angular/core';
import { RfcFisicaService } from './rfc-fisica.service';
import { from, Observable, of, switchMap } from 'rxjs'
import { AsyncPipe } from '@angular/common';
import { StorageService } from '@shared/services/storage.service';
import { PersonalData, PFDataFromRFCResponse, ValidateResponse, ValidateRFCResult } from './rfc-fisica.interface'
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CurpResponseData } from '@core/curp/curp.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@shared/types';


@Component({
  selector: 'app-rfc-fisica',
  imports: [ButtonModule, CardModule, AsyncPipe],
  templateUrl: './rfc-fisica.component.html',
  styleUrl: './rfc-fisica.component.scss'
})
export class RfcFisicaComponent {
  results$!: Observable<LoadingState<ValidateResponse>>;
  personalData: PersonalData | null = null
  nombres: string | null = null

  constructor(private rfcFisicaService: RfcFisicaService, private storageService: StorageService) {}
  ngOnInit() {
    this.results$ = new Observable<any>(subscriber => subscriber.next()).pipe(
      switchMapWithLoading<ValidateResponse>(() => this.rfcFisicaService.generateAndValidateRFC$())
    )

    this.results$.subscribe(value => {
      if (value.data) {
        const response = value.data.response.rfcs[0]
        
        const personalDataStr = this.storageService.getItem("personalData")

        if (typeof personalDataStr === "string" && personalDataStr.length > 0) {
          const personalData: CurpResponseData = JSON.parse(personalDataStr)        
          this.nombres = personalData.nombres
        } 
        
        if (response.result === "RFC válido, y susceptible de recibir facturas") {
          this.storageService.setItem("rfc", response.rfc)        
        }        
      }
    })    
  }
  
  // getPersonalData() {
  //   this.rfcFisicaService.personalDataFromRFC$().subscribe(value => {
  //     const response = value.response

  //     if (value.status != "SUCCESS") {
  //       throw new Error("Hubo un error al recuperar la información personal usando RFC.")        
  //     }

  //     if (response.estatus === "NOT_FOUND") {
  //       throw new Error("No se encontró información personal con el RFC.")
  //     }
      

  //     this.personalData = response
  //     console.log(response)
  //   })
  // }
  getPersonalData() {
    // this.rfcFisicaService.personalDataFromRFC$().pipe()
    this.results$.subscribe(value => console.log(value))
  }
}