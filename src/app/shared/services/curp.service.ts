import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.development';
import {
  Curp,
  CurpData,
  ValidateCurpDataRequest,
  ValidateCurpRequest,
} from '@shared/services/curp.service.interface';

@Injectable({
  providedIn: 'root',
})
export class CurpService {
  constructor(private http: HttpClient) {}
  validateCurpData$(personalData: ValidateCurpDataRequest) {
    const params = {
      // FOUND
      // testCaseId: '663567bb713cf2110a1106b3',
      // NOT_FOUND
      testCaseId: '663567bb713cf2110a1106b4',
      // INVALID_CURP
      // testCaseId: '663567bb713cf2110a1106b5',
    };
    const endpoint = `${environment.apiUrl}/curp/validateData?testCaseId=${params.testCaseId}`;
    return this.http.post<CurpData>(endpoint, personalData);
  }

  validateCurp$(request: ValidateCurpRequest) {
    const params = {
      // SUCCESS event
      testCaseId: '663567bb713cf2110a1106b0',
      // NOT_FOUND
      // "testCaseId": "663567bb713cf2110a1106b1",
      // INVALID_CURP
      // "testCaseId": "663567bb713cf2110a1106b2"
    };
    const endpoint = `${environment.apiUrl}/curp/validate?testCaseId=${params.testCaseId}`;
    return this.http.post<Curp>(endpoint, request);
  }
}
