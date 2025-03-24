import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { StorageService } from '@shared/services/storage.service';

import { CurpService } from '@core/curp/curp.service';
import { lastValueFrom, Observable, switchMap, pipe, first } from 'rxjs';
import { CurpFoundResponseData } from '@core/curp/curp.interface';
import { RfcService } from '@shared/services/rfc.service';
import { GenerateRfcPfRequest } from '@shared/services/rfc.service.interface';

@Injectable({
  providedIn: 'root',
})
export class RfcFisicaService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private curpService: CurpService,
    private rfcService: RfcService
  ) {}

  // generateRfcPF$() {
  //   const params = {
  //     testCaseId: '664230608659f0c02fcd3f0c', // SUCCESS
  //   };
  //   const endpoint = `${environment.apiUrl}/sat/rfc_pf?testCaseId=${params.testCaseId}`;
  //   const personalData = this.storageService.getItem('personalData');

  //   if (typeof personalData != 'string') {
  //     throw new Error('personalData key not found.');
  //   }

  //   const parsedPersonalData: CurpFoundResponseData = JSON.parse(personalData);
  //   const requestBody: GenerateRequestBody = {
  //     nombres: parsedPersonalData.nombres,
  //     apellidoPaterno: parsedPersonalData.primerApellido,
  //     apellidoMaterno: parsedPersonalData.segundoApellido,
  //     fechaNacimiento: parsedPersonalData.fechaNacimiento,
  //   };
  //   return this.http.post<GenerateResponse>(endpoint, requestBody);
  // }

  generateAndValidateRFC$(personalData: GenerateRfcPfRequest) {
    return this.rfcService
      .generateRfcPF$(personalData)
      .pipe(
        switchMap((value) => this.rfcService.validateRFC$(value.response.rfc))
      );
  }

  // personalDataFromRFC$() {
  //   const params = {
  //     testCaseId: '663567bb713cf2110a1106d2', // SUCCESS
  //   };
  //   const endpoint = `${environment.apiUrl}/sat/pf_data_from_rfc?testCaseId=${params.testCaseId}`;
  //   const rfc = this.storageService.getItem('rfc');
  //   if (typeof rfc != 'string' || rfc === 'undefined') {
  //     throw new Error('rfc item is not available on localStorage.');
  //   }

  //   const body: PFDataFromRFCRequestBody = {
  //     rfc: rfc,
  //   };

  //   return this.http.post<PFDataFromRFCResponse>(endpoint, body);
  // }
}
