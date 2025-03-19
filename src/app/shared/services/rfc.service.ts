import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { RFC, RFCWithData, ValidateRFCWithDataRequest } from '@shared/types';

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

  validateRFCWithData$(rfcObj: ValidateRFCWithDataRequest) {
    const params = {
      // SUCCESS
      testCaseId: '663567a9713cf2110a110673',
    };
    const endpoint = `${environment.apiUrl}/sat/rfc_validate_from_data?testCaseId=${params.testCaseId}`;

    return this.http.post<RFCWithData>(endpoint, {
      rfcs: [rfcObj],
    });
  }

  // TODO: Match RFC with CP and nombres in a single request
  // validateRFCWithDataCPLookup
}
