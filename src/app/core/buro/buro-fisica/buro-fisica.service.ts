import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { BuroFisicaReporte, RequestBody } from './buro-fisica.interface';

@Injectable({
  providedIn: 'root'
})
export class BuroFisicaService {
  private params = {
    testCaseId: "663567bb713cf2110a110681" // SUCCESS
  }
  private testCredentials = {
    claveUsuario: "KK25251001",
    contrasenaUsuario: "kiban123"
  }

  private endpoint = `${environment.apiUrl}/bc_pf/query?testCaseId=${this.params.testCaseId}`

  constructor(private http: HttpClient) {}

  queryBuroFisica(requestBody: RequestBody) {
    this.http.post<BuroFisicaReporte>(this.endpoint, requestBody).subscribe(response => {

      if (response.status == "SUCCESS") {
        const data = response.response
        console.log(data)
      }      
    })
  }
}
