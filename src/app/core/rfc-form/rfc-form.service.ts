import { Injectable } from '@angular/core';
import { RfcFormValue, RfcFormDataValue } from './rfc-form.interface';
import {
  RFC,
  ValidateRFCSuccessResponse,
  ValidateRFCBadRequestResponse,
  RFCWithData,
  ValidateRFCWithDataBadRequestResponse,
  ValidateRFCWithDataServiceUnavailableResponse,
} from '@shared/services/rfc.service.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Observable, tap } from 'rxjs';
import { RfcService } from '@shared/services/rfc.service';
import { StorageService } from '@shared/services/storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RfcFormService {
  constructor(
    private rfcService: RfcService,
    private storageService: StorageService,
    private router: Router
  ) {}

  validateRFC$(rfcFormValue: RfcFormValue) {
    return new Observable((subscriber) => subscriber.next()).pipe(
      switchMapWithLoading<RFC>(() =>
        this.rfcService.validateRFC$(rfcFormValue.rfc)
      ),
      tap((value) => {
        if (value.data) {
          const response = (value.data as ValidateRFCSuccessResponse).response;
          if (
            response.rfcs[0].result ===
            'RFC válido, y susceptible de recibir facturas'
          ) {
            this.storageService.setItem('tipoSujeto', rfcFormValue.tipoSujeto);
            this.storageService.setItem('rfc', response.rfcs[0].rfc);
            this.storageService.setItem('rfcResult', response.rfcs[0].result);

            this.router.navigateByUrl('/dashboard');
          }
        }
      })
    );
  }

  validateRFCWithData$(rfcFormValue: RfcFormDataValue) {
    return new Observable((subscriber) => subscriber.next()).pipe(
      switchMapWithLoading<RFCWithData>(() =>
        this.rfcService.validateRFCWithData$([
          {
            rfc: rfcFormValue.rfc,
            cp: rfcFormValue.data.cp,
            nombre:
              rfcFormValue.tipoSujeto === 'PM'
                ? rfcFormValue.data.pmData.razonSocial
                : `${rfcFormValue.data.pfData.nombre} ${rfcFormValue.data.pfData.apellido}`,
          },
        ])
      ),
      tap((value) => {
        if (value.data) {
          if (value.data.status === 'SUCCESS') {
            const response = value.data.response;
            const result = response.rfcs[0].result;
            // SUCCESS AND FOUND
            if (result === 'RFC válido, y susceptible de recibir facturas') {
              this.storageService.setItem(
                'tipoSujeto',
                rfcFormValue.tipoSujeto
              );
              this.storageService.setItem('rfc', response.rfcs[0].rfc);
              this.storageService.setItem('rfcResult', result);
              this.storageService.setItem('cp', response.rfcs[0].cp);
              this.storageService.setItem('nombre', response.rfcs[0].nombre);

              this.router.navigateByUrl('/dashboard');
            }
          }
        }
      })
    );
  }
}
