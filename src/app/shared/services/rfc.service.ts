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
  ValidateRFCWithDataSuccessResponse,
} from './rfc.service.interface';
// import cpCatalog from '../../../../public/cp.catalog.json';
import cpCatalog from '@public/cp.catalog.json';
import estadosCatalog from '@public/estados.catalog.json';
import municipiosCatalog from '@public/municipio.catalog.json';
import { ClavesEstados, ClavesMunicipios } from '@shared/types';
import { Observable, of, Subscription, switchMap } from 'rxjs';
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

  // builds the rfcs array with multiple cps filtering on optional parameters mnpio and estado. Returns the results of the request.
  cpQuery$(requestBody: ValidateRfcCpQueryRequest) {
    const rfcs: ValidateRFCWithDataRequest['rfcs'] = [];
    const rfcsLimit = 5000;
    let cpArray: string[]; // holds cps to use in the request body

    if (requestBody.estado && requestBody.municipio) {
      const queryResults = cpCatalog[requestBody.estado][requestBody.municipio];
      cpArray = queryResults;

      if (cpArray.length > rfcsLimit) {
        // TODO: Consider warning user about multiple queries that have to be made in order to complete their request.
        throw new Error(
          'Se ha excedido el número de RFCs que se pueden hacer en una sola consulta.'
        );
      }

      for (let cp of queryResults) {
        const rfcObj = {
          rfc: requestBody.rfc,
          nombre: requestBody.nombre,
          cp: cp,
        };

        rfcs.push(rfcObj);
      }
    } else if (requestBody.estado && !requestBody.municipio) {
      // Iterate through all of the mnpios of the state and retrieve their cps into an cpArray
    } else {
      // Iterate through all states and mnpios to retrieve all of their cps
    }

    return of(null).pipe(
      switchMapWithLoading(() => this.validateRFCWithData$(rfcs))
    );
  }

  getFinalResponse$(validateRfcResponse: ValidateRFCWithDataSuccessResponse) {
    // Goes through all results of the rfcFormResponse to set the final result SUCCESS - INVALID or VALID, or BAD REQUEST (Validation errors.)

    const response = validateRfcResponse.response;
    const matched = response.rfcs.find(
      (rfc) =>
        rfc.result === 'RFC válido, y susceptible de recibir facturas' ||
        rfc.result ===
          'El nombre, denominación o razón social no coincide con el registrado en el RFC' ||
        rfc.result === 'RFC no registrado en el padrón de contribuyentes'
    );

    return {
      ...validateRfcResponse,
      response: {
        rfcs: [matched ?? response.rfcs[response.rfcs.length - 1]],
      },
    };
  }

  obtainPersonalDataRfcPF$(rfc: string) {
    const params = {
      testCaseId: '663567bb713cf2110a1106d2', // SUCCESS
    };
    const endpoint = `${environment.apiUrl}/sat/pf_data_from_rfc?testCaseId=${params.testCaseId}`;

    return this.http.post<ObtainPersonalDataPfRFC>(endpoint, { rfc: rfc });
  }
}
