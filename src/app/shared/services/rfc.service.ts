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
  Rfc,
  RFCWithData,
  ValidateRfcCpQueryRequest,
  ValidateRFCRequestBody,
  ValidateRFCWithDataRequest,
} from './rfc.service.interface';
// import cpCatalog from '../../../../public/cp.catalog.json';
import cpCatalog from '@public/cp.catalog.json';
import estadosCatalog from '@public/estados.catalog.json';
import municipiosCatalog from '@public/municipio.catalog.json';
import { ClavesEstados, ClavesMunicipios } from '@shared/types';
import { Observable, Subscription, switchMap } from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';

@Injectable({
  providedIn: 'root',
})
export class RfcService {
  constructor(private http: HttpClient) {}

  validateRfc$(requestBody: ValidateRFCRequestBody) {
    const params = {
      testCaseId: '663567bb713cf2110a1106ce',
    };
    const endpoint = `${environment.apiUrl}/sat/rfc_validate?testCaseId=${params.testCaseId}`;
    return this.http.post<Rfc>(endpoint, requestBody);
  }

  validateRFCWithData$(rfcs: ValidateRFCWithDataRequest['rfcs']) {
    const params = {
      // SUCCESS - INVALID
      // testCaseId: '663567bb713cf2110a1106d0',
      // SUCCESS - VALID,
      testCaseId: '663567bb713cf2110a1106cf',
    };
    const endpoint = `${environment.apiUrl}/sat/rfc_validate_from_data?testCaseId=${params.testCaseId}`;

    return this.http.post<RFCWithData>(endpoint, {
      rfcs: rfcs,
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
}
