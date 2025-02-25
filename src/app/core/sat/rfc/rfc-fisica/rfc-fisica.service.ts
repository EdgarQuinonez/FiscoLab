import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { StorageService } from '@shared/services/storage.service';
import { GenerateRequestBody, GenerateResponse, PFDataFromRFCRequestBody, PFDataFromRFCResponse, ValidateResponse } from './rfc-fisica.interface';
import { CurpService } from '@core/curp/curp.service';
import { lastValueFrom, Observable, switchMap, pipe, first } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfcFisicaService {

  constructor(private http: HttpClient, private storageService: StorageService, private curpService: CurpService) {}
  
  generateRFC$() {
    const params = {
      testCaseId: '664230608659f0c02fcd3f0c' // SUCCESS
    }      
    const endpoint = `${environment.apiUrl}/sat/rfc_pf?testCaseId=${params.testCaseId}`
    const personalData = this.storageService.getItem("personalData")

    if (typeof personalData != "string") {
      throw Error("personalData key not found.")
    }
    
    const requestBody: GenerateRequestBody = JSON.parse(personalData)
    return this.http.post<GenerateResponse>(endpoint, requestBody)    
  }

  validateRFC$(rfc: string) {
    const params = {
      testCaseId: '663567bb713cf2110a1106ce'
    }
    const endpoint = `${environment.apiUrl}/sat/rfc_validate?testCaseId=${params.testCaseId}`
    return this.http.post<ValidateResponse>(endpoint, { rfcs: [{rfc: rfc}]})
    
  }

  generateAndValidateRFC$() {    
    return this.generateRFC$().pipe(
      switchMap(value => this.validateRFC$(value.response.rfc)),
      first()
    )
  }

  personalDataFromRFC() {
    const params = {
      testCaseId: '663567bb713cf2110a1106d2' // SUCCESS
    }
    const endpoint = `${environment.apiUrl}/sat/pf_data_from_rfc?testCaseId?=${params.testCaseId}`
    const rfc = this.storageService.getItem("rfc")
    if (typeof rfc != "string" || rfc === "undefined") {
      throw new Error("rfc item is not available on localStorage.")
    }

    const body: PFDataFromRFCRequestBody = {
      rfc: rfc
    }

    return this.http.post<PFDataFromRFCResponse>(endpoint, body)
  }
}
