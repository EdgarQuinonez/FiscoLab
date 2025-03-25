import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import {
  GenerateRfcPf,
  GenerateRfcPfRequest,
  GenerateRfcPfSuccessResponse,
  GenerateRfcPm,
  GenerateRfcPmRequest,
  ObtainPersonalDataPfRFC,
  ObtainPersonalDataPfRFCSuccessResponse,
  RFC,
  RFCWithData,
} from './rfc.service.interface';

@Injectable({
  providedIn: 'root',
})
export class RfcService {
  constructor(private http: HttpClient) {}

  validateRFC$(rfc: string) {
    const params = {
      testCaseId: '663567bb713cf2110a1106ce',
    };
    const endpoint = `${environment.apiUrl}/sat/rfc_validate?testCaseId=${params.testCaseId}`;
    return this.http.post<RFC>(endpoint, {
      rfcs: [{ rfc: rfc }],
    });
  }

  validateRFCWithData$(rfcObj: { rfc: string; cp: string; nombre: string }) {
    const params = {
      // SUCCESS - INVALID
      testCaseId: '663567bb713cf2110a1106d0',
    };
    const endpoint = `${environment.apiUrl}/sat/rfc_validate_from_data?testCaseId=${params.testCaseId}`;

    return this.http.post<RFCWithData>(endpoint, {
      rfcs: [rfcObj],
    });
  }

  generateRfcPF$(personalData: GenerateRfcPfRequest) {
    const params = {
      testCaseId: '664230608659f0c02fcd3f0c', // SUCCESS
    };
    const endpoint = `${environment.apiUrl}/sat/rfc_pf?testCaseId=${params.testCaseId}`;

    return this.http.post<GenerateRfcPf>(endpoint, personalData);
  }

  generateRfcPM$(companyData: GenerateRfcPmRequest) {
    const params = {
      testCaseId: '66423072bb869119db3517b4', // SUCCESS
    };
    const endpoint = `${environment.apiUrl}/sat/rfc_pm?testCaseId=${params.testCaseId}`;

    return this.http.post<GenerateRfcPm>(endpoint, companyData);
  }

  obtainPersonalDataRfcPF$(rfc: string) {
    const params = {
      testCaseId: '663567bb713cf2110a1106d2', // SUCCESS
    };
    const endpoint = `${environment.apiUrl}/sat/pf_data_from_rfc?testCaseId=${params.testCaseId}`;

    return this.http.post<ObtainPersonalDataPfRFC>(endpoint, { rfc: rfc });
  }

  // TODO: Match RFC with CP and nombres in a single request
  // validateRFCWithDataCPLookup
}
