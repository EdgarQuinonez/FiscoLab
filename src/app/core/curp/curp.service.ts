import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development'

@Injectable({
  providedIn: 'root'
})
export class CurpService {
  private params = {
    // SUCCESS event
    "testCaseId": "663567bb713cf2110a1106b0"
  }
  private endpoint = `${environment.apiUrl}/curp/validate?testCaseId=${this.params.testCaseId}`  
  constructor(private http: HttpClient) {}

  validateCURP(curp: string) {
    
    this.http.post(this.endpoint, { curp }).subscribe(response =>
      console.log(response)
    )            
    
  }
}
