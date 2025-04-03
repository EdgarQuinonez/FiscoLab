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
  ValidateRfcCpQueryRequest,
  ValidateRFCWithDataRequest,
} from './rfc.service.interface';
// import cpCatalog from '../../../../public/cp.catalog.json';
import cpCatalog from '@public/cp.catalog.json';
import estadosCatalog from '@public/estados.catalog.json';
import municipiosCatalog from '@public/municipio.catalog.json';
import { ClavesEstados, ClavesMunicipios } from '@shared/types';
import { template } from 'lodash';

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

  // TODO: Match RFC with CP and nombres in a single request
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

      for (let cp in queryResults) {
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

    // TODO: THIS SHOULD TRANSFORM THE OUTPUT TO FINALLY RETURN A STRING (VALID CP CODE) OR ERROR (INVALID ERR MSG TO SET ON RESPONSEERROR)
    this.validateRFCWithData$(rfcs).pipe();
  }
}
