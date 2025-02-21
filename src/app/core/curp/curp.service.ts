import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment.development'
import { Curp } from './curp';

@Injectable({
  providedIn: 'root'
})
export class CurpService {
  // private router = new Router()
  
  private params = {
    // SUCCESS event
    "testCaseId": "663567bb713cf2110a1106b0"
  }
  private endpoint = `${environment.apiUrl}/curp/validate?testCaseId=${this.params.testCaseId}`  
  constructor(private http: HttpClient, private router: Router) {}

  validateCURP(curp: string) {
    
    this.http.post<Curp>(this.endpoint, { curp }).subscribe(response => {

      if (response.status === "SUCCESS") {
        const data = response.response
        if (data.status === "FOUND") {
          // Redirect from home to dashboard
          this.router.navigateByUrl("bc-pf")
        }
      }
    })                
  }
}
