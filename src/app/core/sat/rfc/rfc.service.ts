import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { StorageService } from '@shared/services/storage.service';
import { ValidateResponse } from './rfc.interface';

@Injectable({
  providedIn: 'root'
})
export class RfcService { 
  
  
  constructor(private http: HttpClient, private storageService: StorageService) {}

  generateRFC() {

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
