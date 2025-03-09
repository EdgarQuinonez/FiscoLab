import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment.development';
import { Curp, CurpByData, CurpValidateByDataRequest } from './curp.interface';
import { StorageService } from '@shared/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class CurpService {
  curpResponse: Curp | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {}

  validateCURP$(curp: string) {
    const params = {
      // SUCCESS event
      testCaseId: '663567bb713cf2110a1106b0',
      // NOT_FOUND
      // "testCaseId": "663567bb713cf2110a1106b1",
      // INVALID_CURP
      // "testCaseId": "663567bb713cf2110a1106b2"
    };
    const endpoint = `${environment.apiUrl}/curp/validate?testCaseId=${params.testCaseId}`;
    return this.http.post<Curp>(endpoint, { curp });
  }

  validateCurpByData$(personalData: CurpValidateByDataRequest) {
    const params = {
      // FOUND
      testCaseId: '663567bb713cf2110a1106b3',
      // NOT_FOUND
      // testCaseId: '663567bb713cf2110a1106b4'
      // INVALID_CURP
      // testCaseId: '663567bb713cf2110a1106b5'
    };
    const endpoint = `${environment.apiUrl}/curp/validateData?testCaseId=${params.testCaseId}`;
    return this.http.post<CurpByData>(endpoint, personalData);
  }

  setCurpResponse(curpResponse: Curp) {
    this.curpResponse = curpResponse;
  }

  getCurpResponse() {
    return this.curpResponse;
  }
}
