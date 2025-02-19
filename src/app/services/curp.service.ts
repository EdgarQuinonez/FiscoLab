import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurpService {
  private endpoint = environment.apiUrl + "/curp/validate"
  constructor(private http: HttpClient) {}

  validateCURP(curp: string): void {
    this.http.post(this.endpoint, { curp }).subscribe(response => {
      console.log('CURP validated status: ', response)
    })
    
  }
}
