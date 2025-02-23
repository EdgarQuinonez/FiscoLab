import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment.development'
import { Curp } from './curp.interface';
import { StorageService } from '@shared/services/storage.service';
import { lastValueFrom } from 'rxjs';
import { response } from 'express';

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
    return lastValueFrom(this.http.post<Curp>(this.endpoint, { curp }))
  }
}
