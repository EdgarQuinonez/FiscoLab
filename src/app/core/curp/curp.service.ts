import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment.development'
import { Curp } from './curp.interface';
import { StorageService } from '@shared/services/storage.service';

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
  constructor(private http: HttpClient, private router: Router, private storageService: StorageService) {}

  validateCURP(curp: string) {    
    this.http.post<Curp>(this.endpoint, { curp }).subscribe(curpResponse => {
      if (curpResponse.status === "SUCCESS") {        
        const data = curpResponse.response

        if (data.status === "FOUND") {          

          this.storageService.setItem("curp", data.curp)
          // TODO: might store in db using curp as pk
          this.storageService.setItem("personalData", JSON.stringify({
            nombres: data.nombres,
            apellidoPaterno: data.primerApellido,
            apellidoMaterno: data.segundoApellido,
            fechaNacimiento: data.fechaNacimiento
          }))      
          // Redirect from home to dashboard
          this.router.navigateByUrl("dashboard")
        }
      } else {
        // display error msg and navigate back to curpComponent        
      }
      console.log(curpResponse)      
    })    
  }
}
