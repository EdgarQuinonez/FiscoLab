import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { StorageService } from '@shared/services/storage.service';
import { GenerateRequestBody, GenerateResponse, ValidateResponse } from './rfc-fisica.interface';
import { CurpService } from '@core/curp/curp.service';
import { lastValueFrom, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfcFisicaService {

  constructor(private http: HttpClient, private storageService: StorageService, private curpService: CurpService) {}
  
  generateRFC() {
    const params = {
      testCaseId: '664230608659f0c02fcd3f0c' // SUCCESS
    }      
    const endpoint = `${environment.apiUrl}/api/v2/sat/rfc_pf?testCaseId=${params.testCaseId}`
    const personalData = this.storageService.getItem("personalData")

    if (typeof personalData != "string") {
      throw Error("personalData key not found.")
    }
    
    const requestBody: GenerateRequestBody = JSON.parse(personalData)
    return this.http.post<GenerateResponse>(endpoint, requestBody)
    // return lastValueFrom(this.http.post<GenerateResponse>(endpoint, requestBody))
  }

  validateRFC(rfc: string) {
    const params = {
      testCase: 'valid'
    }
    const endpoint = `${environment.apiUrl}/sat/rfc_validate?testCase=${params.testCase}`
    return this.http.post<ValidateResponse>(endpoint, {rfcs: [{rfc: rfc}]})
    // return lastValueFrom(this.http.post<ValidateResponse>(endpoint, {rfcs: [{rfc: rfc}]}))
  }

  generateAndValidateRFC() {
    
  }

  personalDataFromRFC() {

  }
}
