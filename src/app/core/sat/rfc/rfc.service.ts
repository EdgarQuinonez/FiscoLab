import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { StorageService } from '@shared/services/storage.service';
import { ValidateResponse } from './rfc.interface';
import { CurpService } from '@core/curp/curp.service';

@Injectable({
  providedIn: 'root'
})
export class RfcService { 
  
  
  constructor(private http: HttpClient, private storageService: StorageService, private curpService: CurpService) {}

  generateRFC() {
        
    const personalData = this.storageService.getItem("personalData")
    if (personalData) {
      const requestBody = JSON.parse(personalData)
      return requestBody
    } else {
      // Try using curp to get personal data then generate rfc
      const curp = this.storageService.getItem("curp")
      if (typeof curp != "string" ) {
        console.log("No CURP key found in localStorage.") // TODO: Redirect to CurpComponent
        return
      }
        this.curpService.validateCURP(curp) // TODO: should return response and handle that.
        
    }

  }

  validateRFC(rfc: string) {
    const params = {
      testCase: 'valid'
    }
    const endpoint = `${environment.apiUrl}/sat/rfc_validate?testCase=${params.testCase}`

    this.http.post<ValidateResponse>(endpoint, {
      rfcs: [{rfc: rfc}]
    })
  }

  personalDataFromRFC() {

  }


}
